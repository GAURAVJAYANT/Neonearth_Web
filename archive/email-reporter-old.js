const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class EmailReporter {
  constructor() {
    this.emailUser = process.env.EMAIL_USER || 'ne.automation.user.01@gmail.com';
    this.emailPassword = process.env.EMAIL_PASSWORD;
    this.emailTo = process.env.EMAIL_TO || 'gaurav.jayant@groupbayport.com';
    this.emailFrom = process.env.EMAIL_FROM || 'Neonearth Automation <ne.automation.user.01@gmail.com>';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = Number(process.env.SMTP_PORT || 587);

    if (!this.emailPassword) {
      console.warn('WARNING: EMAIL_PASSWORD not set in .env file');
    }
  }

  async onEnd() {
    if (process.env.EMAIL_REPORT === 'false' || process.argv.includes('--list')) {
      console.log('\n📧 Email report skipped.');
      return;
    }

    try {
      // Wait for test-results/report.json to be created by Playwright JSON reporter
      const stats = await this.readTestResults();
      
      if (!stats || stats.total === 0) {
        console.warn('\n⚠️ No test results found. Email not sent.');
        return;
      }

      await this.sendEmailReport(stats);
    } catch (error) {
      console.error('\n❌ Email reporter error:', error.message);
    }
  }

  getTransporter() {
    return nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: false,
      auth: {
        user: this.emailUser,
        pass: this.emailPassword,
      },
    });
  }

  async waitForAllureStats(expectedTotal, runStatus, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;
    let lastStats = null;
    let lastCount = -1;
    let stableReads = 0;

    while (Date.now() < deadline) {
      const files = this.getAllureResultFiles();

      if (files.length > 0) {
        const stats = this.buildStatsFromAllure(files, runStatus);
        if (stats.total > 0) {
          lastStats = stats;

          if (expectedTotal > 0 && stats.total >= expectedTotal) {
            return stats;
          }

          if (files.length === lastCount) {
            stableReads++;
          } else {
            stableReads = 0;
            lastCount = files.length;
          }

          if (expectedTotal === 0 && stableReads >= 2) {
            return stats;
          }
        }
      }

      await this.sleep(1000);
    }

    return lastStats && lastStats.total > 0 ? lastStats : null;
  }

  getAllureResultFiles() {
    if (!fs.existsSync(this.allureResultsDir)) return [];
    return fs
      .readdirSync(this.allureResultsDir)
      .filter(file => file.endsWith('-result.json'))
      .map(file => path.join(this.allureResultsDir, file));
  }

  buildStatsFromAllure(files, runStatus = 'passed') {
    const groups = new Map();

    for (const file of files) {
      try {
        const result = JSON.parse(fs.readFileSync(file, 'utf8'));
        const key = result.historyId || result.testCaseId || result.fullName || result.name || result.uuid || file;
        const attempts = groups.get(key) || [];
        attempts.push(result);
        groups.set(key, attempts);
      } catch (error) {
        console.warn(`Skipping invalid Allure result file ${path.basename(file)}: ${error.message}`);
      }
    }

    const stats = this.createEmptyStats(runStatus);

    for (const attempts of groups.values()) {
      attempts.sort((a, b) => this.getAllureEndTime(a) - this.getAllureEndTime(b));

      const latest = attempts[attempts.length - 1];
      const statuses = attempts.map(attempt => this.normalizeStatus(attempt.status));
      const finalStatus = this.normalizeStatus(latest.status);
      const suiteName = this.getAllureSuiteName(latest);
      const duration = this.getAllureDuration(latest);

      this.addTestToStats(stats, suiteName, finalStatus, duration, statuses);
    }

    return this.finalizeStats(stats);
  }

  buildStatsFromLiveResults(runStatus = 'passed') {
    const stats = this.createEmptyStats(runStatus);

    for (const test of this.recordedTests.values()) {
      const attempts = test.attempts || [];
      if (!attempts.length) continue;

      const finalAttempt = attempts[attempts.length - 1];
      const statuses = attempts.map(attempt => this.normalizeStatus(attempt.status));
      const duration = attempts.reduce((sum, attempt) => sum + this.toNumber(attempt.duration), 0);

      this.addTestToStats(stats, test.suite, this.normalizeStatus(finalAttempt.status), duration, statuses);
    }

    return this.finalizeStats(stats);
  }

  createEmptyStats(runStatus = 'passed') {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      retryWarnings: 0,
      totalDurationMs: 0,
      runStatus: this.normalizeStatus(runStatus),
      testsBySuite: {},
    };
  }

  addTestToStats(stats, suiteName, finalStatus, durationMs, attemptStatuses) {
    const suite = suiteName || 'Suite';
    const status = this.normalizeStatus(finalStatus);
    const hadFailureBeforePass = status === 'passed'
      && attemptStatuses.slice(0, -1).some(attemptStatus => this.isFailureStatus(attemptStatus));

    if (!stats.testsBySuite[suite]) {
      stats.testsBySuite[suite] = { total: 0, passed: 0, failed: 0, skipped: 0 };
    }

    stats.total++;
    stats.totalDurationMs += this.toNumber(durationMs);
    stats.testsBySuite[suite].total++;

    if (hadFailureBeforePass) {
      stats.retryWarnings++;
    }

    if (status === 'passed') {
      stats.passed++;
      stats.testsBySuite[suite].passed++;
    } else if (status === 'skipped') {
      stats.skipped++;
      stats.testsBySuite[suite].skipped++;
    } else {
      stats.failed++;
      stats.testsBySuite[suite].failed++;
    }
  }

  finalizeStats(stats) {
    const total = this.toNumber(stats.total);
    const passed = this.toNumber(stats.passed);
    const failed = this.toNumber(stats.failed);
    const skipped = this.toNumber(stats.skipped);
    const retryWarnings = this.toNumber(stats.retryWarnings);
    const cleanRun = total > 0
      && passed === total
      && failed === 0
      && skipped === 0
      && retryWarnings === 0
      && !this.isFailureStatus(stats.runStatus);

    return {
      total,
      passed,
      failed,
      skipped,
      retryWarnings,
      runStatus: stats.runStatus,
      executionStatus: cleanRun ? 'Passed' : 'Failed',
      successRate: this.rate(passed, total),
      failureRate: this.rate(failed, total),
      skippedRate: this.rate(skipped, total),
      warningRate: this.rate(retryWarnings, total),
      totalDuration: (this.toNumber(stats.totalDurationMs) / 1000).toFixed(2),
      testsBySuite: stats.testsBySuite || {},
    };
  }

  getPlaywrightSuiteName(test) {
    const titlePath = typeof test.titlePath === 'function' ? test.titlePath() : [];
    const file = titlePath.find(item => item.endsWith('.spec.js')) || 'Suite';
    const suite = titlePath.filter(item => item && item !== file && item !== test.title).join(' > ');
    return suite ? `${file} > ${suite}` : file;
  }

  getAllureSuiteName(result) {
    const labels = Array.isArray(result.labels) ? result.labels : [];
    const labelValue = name => (labels.find(label => label.name === name) || {}).value;
    const file = labelValue('package') || (result.fullName ? result.fullName.split(':')[0] : 'Suite');
    const suite = labelValue('subSuite');
    return suite ? `${file} > ${suite}` : file;
  }

  getAllureEndTime(result) {
    return this.toNumber(result.stop || result.start);
  }

  getAllureDuration(result) {
    const start = this.toNumber(result.start);
    const stop = this.toNumber(result.stop);
    return stop > start ? stop - start : 0;
  }

  normalizeStatus(status) {
    if (status === 'timedOut' || status === 'interrupted' || status === 'broken' || status === 'unknown') {
      return 'failed';
    }
    return status || 'failed';
  }

  isFailureStatus(status) {
    return this.normalizeStatus(status) === 'failed';
  }

  rate(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
  }

  toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  suiteRows(testsBySuite) {
    const rows = Object.entries(testsBySuite || {});
    if (!rows.length) {
      return '';
    }

    return rows.map(([suite, counts]) => {
      const total = this.toNumber(counts.total);
      const passed = this.toNumber(counts.passed);
      const failed = this.toNumber(counts.failed);
      const skipped = this.toNumber(counts.skipped);
      const passRate = this.rate(passed, total);

      return `
        <tr>
          <td style="padding:10px;border:1px solid #000;text-align:left;">${this.escapeHtml(suite)}</td>
          <td style="padding:10px;border:1px solid #000;text-align:center;">${total}</td>
          <td style="padding:10px;border:1px solid #000;text-align:center;color:#198754;font-weight:bold;">${passed}</td>
          <td style="padding:10px;border:1px solid #000;text-align:center;color:#b42318;font-weight:bold;">${failed}</td>
          <td style="padding:10px;border:1px solid #000;text-align:center;">${skipped}</td>
          <td style="padding:10px;border:1px solid #000;text-align:center;">${passRate}%</td>
        </tr>`;
    }).join('');
  }

  generateEmailBody(stats) {
    const timestamp = new Date().toLocaleString();
    const executionId = `NE-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}`;
    const statusColor = stats.executionStatus === 'Passed' ? '#198754' : '#b42318';
    const tableStyle = 'width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:25px;';
    const thStyle = 'padding:10px;border:1px solid #000;text-align:center;font-weight:bold;background-color:#fff;color:#000;font-size:14px;';
    const tdStyle = 'padding:10px;border:1px solid #000;text-align:center;color:#000;font-size:14px;';
    const suiteRows = this.suiteRows(stats.testsBySuite);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background-color:#f5f5f5;color:#111;font-family:Arial,'Segoe UI',sans-serif;">
  <div style="max-width:900px;margin:0 auto;background-color:#fff;padding:30px;">
    <h1 style="margin:0 0 28px;font-size:24px;color:#001b3f;font-weight:bold;">Neonearth Test Automation Report</h1>

    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">Dear Team,</p>
    <p style="margin:0 0 28px;font-size:14px;line-height:1.6;">The execution of the <strong>Neonearth automation suite</strong> has completed. Below are the execution details.</p>

    <div style="margin:0 0 30px;font-size:14px;line-height:1.7;">
      <strong>Project Name :</strong> Neonearth<br>
      <strong>Suite Name :</strong> Playwright Automation<br>
      <strong>Execution Status :</strong> <span style="color:${statusColor};font-weight:bold;">${stats.executionStatus}</span><br>
      <strong>Executed On :</strong> ${timestamp}<br>
      <strong>Execution Duration :</strong> ${stats.totalDuration}s<br>
      <strong>Execution ID :</strong> ${executionId}<br>
      <strong>Browser :</strong> Chromium<br>
      <strong>Base URL :</strong> <a href="https://www.neonearth.com/">https://www.neonearth.com/</a>
    </div>

    <h2 style="margin:25px 0 15px;font-size:16px;color:#000;font-weight:bold;">Execution Result Percentage</h2>
    <table role="presentation" style="${tableStyle}">
      <tr>
        <th style="${thStyle}">Passed</th>
        <th style="${thStyle}">Failed</th>
        <th style="${thStyle}">Warning</th>
        <th style="${thStyle}">Skipped</th>
        <th style="${thStyle}">Terminated</th>
        <th style="${thStyle}">Not Executed</th>
      </tr>
      <tr>
        <td style="${tdStyle}">${stats.successRate}%</td>
        <td style="${tdStyle}">${stats.failureRate}%</td>
        <td style="${tdStyle}">${stats.warningRate}%</td>
        <td style="${tdStyle}">${stats.skippedRate}%</td>
        <td style="${tdStyle}">0%</td>
        <td style="${tdStyle}">0%</td>
      </tr>
    </table>

    <h2 style="margin:25px 0 15px;font-size:16px;color:#000;font-weight:bold;">Execution Summary</h2>
    <table role="presentation" style="${tableStyle}">
      <tr>
        <th style="${thStyle}">Total Tests</th>
        <th style="${thStyle}">Passed</th>
        <th style="${thStyle}">Failed</th>
        <th style="${thStyle}">Skipped</th>
        <th style="${thStyle}">Retry Warnings</th>
      </tr>
      <tr>
        <td style="${tdStyle}">${stats.total}</td>
        <td style="${tdStyle};color:#198754;font-weight:bold;">${stats.passed}</td>
        <td style="${tdStyle};color:#b42318;font-weight:bold;">${stats.failed}</td>
        <td style="${tdStyle}">${stats.skipped}</td>
        <td style="${tdStyle}">${stats.retryWarnings}</td>
      </tr>
    </table>

    ${suiteRows ? `
    <h2 style="margin:25px 0 15px;font-size:16px;color:#000;font-weight:bold;">Suite Breakdown</h2>
    <table role="presentation" style="${tableStyle}">
      <tr>
        <th style="${thStyle};text-align:left;">Suite</th>
        <th style="${thStyle}">Total</th>
        <th style="${thStyle}">Passed</th>
        <th style="${thStyle}">Failed</th>
        <th style="${thStyle}">Skipped</th>
        <th style="${thStyle}">Pass Rate</th>
      </tr>
      ${suiteRows}
    </table>` : ''}

    <p style="margin:20px 0 15px;font-size:14px;line-height:1.6;">Please find the comprehensive report for this execution attached to this email.</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;"><strong>Regards,</strong><br>Neonearth QA Automation</p>
  </div>
</body>
</html>`;
  }

  async generatePdfFromEmailHtml(htmlContent, pdfPath) {
    const os = require('os');
    const tmpFile = path.join(os.tmpdir(), `neonearth-report-${Date.now()}.html`);
    fs.writeFileSync(tmpFile, htmlContent, 'utf8');

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size:10px;width:100%;text-align:center;color:#888;">Neonearth Test Automation Report</div>',
        footerTemplate: '<div style="font-size:10px;width:100%;text-align:center;color:#888;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      });
    } finally {
      if (browser) await browser.close();
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }

  async dispatchEmail(stats) {
    if (!stats || stats.total === 0) {
      console.warn('Email report not sent because test result count is 0.');
      return false;
    }

    try {
      console.log(`\nEmail report stats: Total=${stats.total}, Passed=${stats.passed}, Failed=${stats.failed}, Skipped=${stats.skipped}`);

      const emailHtml = this.generateEmailBody(stats);
      const attachments = [];
      const pdfPath = path.resolve('test-results/report.pdf');

      try {
        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
        await this.generatePdfFromEmailHtml(emailHtml, pdfPath);
        attachments.push({ filename: 'Neonearth_Test_Report.pdf', path: pdfPath });
      } catch (error) {
        console.warn(`PDF generation failed. Sending email without PDF: ${error.message}`);
      }

      const subjectStatus = stats.executionStatus === 'Passed' ? 'PASSED' : 'FAILED';
      const info = await this.getTransporter().sendMail({
        from: this.emailFrom,
        to: this.emailTo,
        subject: `Neonearth Test Report - ${new Date().toLocaleDateString()} - ${subjectStatus}`,
        html: emailHtml,
        attachments,
      });

      console.log(`Email sent successfully. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`Email error: ${error.message}`);
      return false;
    }
  }
}

module.exports = EmailReporter;

if (require.main === module) {
  (async () => {
    const reporter = new EmailReporter();
    const stats = await reporter.waitForAllureStats(0, 'passed', 5000);
    if (!stats || stats.total === 0) {
      console.warn('No Allure results found. Email not sent.');
      return;
    }
    await reporter.dispatchEmail(stats);
  })();
}
