const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');
require('dotenv').config();

class EmailReporter {
  constructor() {
    this.emailUser = process.env.EMAIL_USER || 'ne.automation.user.01@gmail.com';
    this.emailPassword = process.env.EMAIL_PASSWORD;
    this.emailTo = process.env.EMAIL_TO || 'gaurav.jayant@groupbayport.com';
    this.emailFrom = process.env.EMAIL_FROM || 'Neonearth Automation <ne.automation.user.01@gmail.com>';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = Number(process.env.SMTP_PORT || 587);

    // Track each test as it finishes — works even when execution stops early
    // Key = test.id so retries update the same entry (no double-counting)
    this.recordedTests = new Map();

    if (!this.emailPassword) {
      console.warn('⚠️  EMAIL_PASSWORD not set in .env');
    }
  }

  // ── Playwright reporter hooks ─────────────────────────────────────────────

  onBegin() {
    console.log('📧 Email reporter ready.');
  }

  /**
   * Called by Playwright after every test attempt including retries.
   * Using test.id as Map key means retries update the SAME entry — no double-counting.
   */
  onTestEnd(test, result) {
    const key = test.id || test.title;
    const existing = this.recordedTests.get(key) || { title: test.title, attempts: [] };
    existing.attempts.push({ status: result.status, duration: result.duration || 0 });
    this.recordedTests.set(key, existing);
  }

  /**
   * NOTE: Playwright's `result` argument here is FullResult = { status, startTime, duration }.
   * It does NOT carry suites/tests — that is why we track via onTestEnd above.
   */
  async onEnd(result) {
    if (process.env.EMAIL_REPORT === 'false' || process.argv.includes('--list')) {
      console.log('📧 Email report skipped.');
      return;
    }

    let stats = this.buildStats();

    if (!stats || stats.total === 0) {
      // No onTestEnd events — fall back to JSON report (direct/script execution)
      const jsonStats = await this.statsFromJsonReport();
      if (!jsonStats || jsonStats.total === 0) {
        console.warn('⚠️  No test results found — email not sent.');
        return;
      }
      await this.sendEmailReport(jsonStats);
    } else {
      // onTestEnd data available — augment skipped count from JSON so
      // "not-run" tests (stopped early) are included just like Playwright shows them
      const jsonStats = await this.statsFromJsonReport(5000);
      if (jsonStats && jsonStats.total > stats.total) {
        const notRun = jsonStats.total - stats.total;
        stats = this.format({
          total: jsonStats.total,
          passed: stats.passed,
          failed: stats.failed,
          skipped: stats.skipped + notRun,
          totalDuration: parseFloat(stats.totalDuration) * 1000,
          retryWarnings: stats.retryWarnings,
        });
      }
      await this.sendEmailReport(stats);
    }
  }

  // ── Stats builders ────────────────────────────────────────────────────────

  buildStats() {
    if (this.recordedTests.size === 0) return null;

    let total = 0, passed = 0, failed = 0, skipped = 0, totalDuration = 0, retryWarnings = 0;

    for (const test of this.recordedTests.values()) {
      total++;
      const attempts = test.attempts || [];
      const statuses = attempts.map(a => a.status);
      const duration = attempts.reduce((s, a) => s + (a.duration || 0), 0);
      totalDuration += duration;

      // A test that failed at least once but eventually passed counts as passed (flaky)
      const finalStatus = statuses.includes('passed')
        ? 'passed'
        : (attempts[attempts.length - 1] || {}).status;

      if (finalStatus === 'passed') {
        passed++;
        if (statuses.length > 1 && statuses.slice(0, -1).some(s => s !== 'passed')) {
          retryWarnings++; // passed only after retry
        }
      } else if (finalStatus === 'skipped') {
        skipped++;
      } else {
        failed++;
      }
    }

    return this.format({ total, passed, failed, skipped, totalDuration, retryWarnings });
  }

  async statsFromJsonReport(timeoutMs = 15000) {
    const reportPath = path.resolve('./test-results/report.json');
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (fs.existsSync(reportPath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          const stats = this.parseJsonReport(raw);
          if (stats.total > 0) return stats;
        } catch (_) { /* file still being written, retry */ }
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    return null;
  }

  parseJsonReport(data) {
    const counted = new Set();
    let total = 0, passed = 0, failed = 0, skipped = 0, totalDuration = 0, retryWarnings = 0;

    const addTest = (test, suiteTitle) => {
      const key = `${suiteTitle}::${test.title}`;
      if (counted.has(key)) return;
      counted.add(key);
      total++;

      const attempts = test.results || [];
      const statuses = attempts.map(r => r.status).filter(Boolean);
      const duration = attempts.reduce((s, r) => s + (r.duration || 0), 0);
      totalDuration += duration;

      const finalStatus = statuses.includes('passed') || statuses.includes('expected')
        ? 'passed'
        : statuses[statuses.length - 1] || (test.ok ? 'passed' : 'failed');

      if (finalStatus === 'passed') {
        passed++;
        if (statuses.length > 1 && statuses.slice(0, -1).some(s => s !== 'passed' && s !== 'expected')) {
          retryWarnings++;
        }
      } else if (finalStatus === 'skipped') {
        skipped++;
      } else {
        failed++;
      }
    };

    const walk = (suite, parent = '') => {
      const title = parent && suite.title
        ? `${parent} > ${suite.title}`
        : (suite.title || parent || 'Suite');
      (suite.tests || []).forEach(t => addTest(t, title));
      (suite.specs || []).forEach(spec =>
        (spec.tests || []).forEach(t => addTest({ ...t, title: spec.title, ok: spec.ok }, title))
      );
      (suite.suites || []).forEach(s => walk(s, title));
    };

    (data?.suites || []).forEach(s => walk(s));
    return this.format({ total, passed, failed, skipped, totalDuration, retryWarnings });
  }

  format({ total, passed, failed, skipped, totalDuration, retryWarnings }) {
    return {
      total,
      passed,
      failed,
      skipped,
      retryWarnings: retryWarnings || 0,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00',
      failureRate: total > 0 ? ((failed / total) * 100).toFixed(2) : '0.00',
      skippedRate: total > 0 ? ((skipped / total) * 100).toFixed(2) : '0.00',
      warningRate: total > 0 ? (((retryWarnings || 0) / total) * 100).toFixed(2) : '0.00',
      totalDuration: (totalDuration / 1000).toFixed(2),
    };
  }

  // ── Email template ────────────────────────────────────────────────────────

  generateEmailBody(stats) {
    const timestamp = new Date().toLocaleString();
    const executionId = `NE-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}`;
    const thStyle = 'padding:10px;border:1px solid #ddd;text-align:center;font-weight:bold;background-color:#f9f9f9;';
    const tdStyle = 'padding:10px;border:1px solid #ddd;text-align:center;';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background-color:#f5f5f5;color:#333;font-family:Arial,'Segoe UI',sans-serif;">
  <div style="max-width:900px;margin:0 auto;background-color:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <h1 style="margin:0 0 20px;font-size:24px;color:#000;font-weight:bold;">Neonearth Test Automation Report</h1>

    <p style="margin:0 0 15px;font-size:14px;line-height:1.6;">Dear Team,</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">The execution of the <strong>Neonearth automation suite</strong> has completed. Below are the execution details.</p>

    <div style="margin:0 0 25px;font-size:14px;line-height:1.8;border-bottom:1px solid #eee;padding-bottom:15px;">
      <strong>Project Name :</strong> Neonearth<br>
      <strong>Suite Name :</strong> Playwright Automation<br>
      <strong>Executed On :</strong> ${timestamp}<br>
      <strong>Execution Duration :</strong> ${stats.totalDuration}s<br>
      <strong>Execution ID :</strong> ${executionId}<br>
      <strong>Browser :</strong> Chromium<br>
      <strong>Base URL :</strong> https://www.neonearth.com/
    </div>

    <h2 style="margin:20px 0 15px;font-size:18px;color:#000;font-weight:bold;">Execution Result Percentage</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;margin-bottom:20px;">
      <tr>
        <th style="${thStyle}">Passed</th>
        <th style="${thStyle}">Failed</th>
        <th style="${thStyle}">Warning</th>
        <th style="${thStyle}">Skipped</th>
        <th style="${thStyle}">Terminated</th>
        <th style="${thStyle}">Not Executed</th>
      </tr>
      <tr>
        <td style="${tdStyle}color:#28a745;font-weight:bold;">${stats.successRate}%</td>
        <td style="${tdStyle}color:#dc3545;font-weight:bold;">${stats.failureRate}%</td>
        <td style="${tdStyle}">${stats.warningRate}%</td>
        <td style="${tdStyle}">${stats.skippedRate}%</td>
        <td style="${tdStyle}">0%</td>
        <td style="${tdStyle}">0%</td>
      </tr>
    </table>

    <h2 style="margin:20px 0 15px;font-size:18px;color:#000;font-weight:bold;">Execution Summary</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;margin-bottom:20px;">
      <tr>
        <th style="${thStyle}">Total Tests</th>
        <th style="${thStyle}">Passed</th>
        <th style="${thStyle}">Failed</th>
        <th style="${thStyle}">Skipped</th>
        <th style="${thStyle}">Retry Warnings</th>
      </tr>
      <tr>
        <td style="${tdStyle}font-size:16px;font-weight:bold;">${stats.total}</td>
        <td style="${tdStyle}font-size:16px;font-weight:bold;color:#28a745;">${stats.passed}</td>
        <td style="${tdStyle}font-size:16px;font-weight:bold;color:#dc3545;">${stats.failed}</td>
        <td style="${tdStyle}font-size:16px;font-weight:bold;">${stats.skipped}</td>
        <td style="${tdStyle}">${stats.retryWarnings}</td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:14px;line-height:1.6;">Please find the comprehensive report for this execution attached to this email.</p>
    <p style="margin:10px 0 20px;font-size:14px;line-height:1.6;"><strong>Regards,</strong><br>Neonearth QA Automation</p>

    <div style="margin-top:25px;padding-top:15px;border-top:1px solid #ddd;color:#666;font-size:12px;">
      <p style="margin:0 0 3px;">Generated: ${timestamp}</p>
      <p style="margin:0 0 3px;">© 2026 Neonearth. Automated Quality Assurance System.</p>
      <p style="margin:0;">This is an automated email from the Neonearth Test Automation Platform.</p>
    </div>
  </div>
</body>
</html>`;
  }

  // ── PDF generation ────────────────────────────────────────────────────────

  /**
   * Generates PDF from the email HTML so the PDF always shows identical counts.
   */
  async generatePdfFromEmailHtml(htmlContent, pdfPath) {
    const os = require('os');
    const tmpFile = path.join(os.tmpdir(), `neonearth-${Date.now()}.html`);
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
        headerTemplate: `<div style="font-size:10px;width:100%;text-align:center;color:#888;">Neonearth Test Automation Report</div>`,
        footerTemplate: `<div style="font-size:10px;width:100%;text-align:center;color:#888;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      });
    } finally {
      if (browser) await browser.close();
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }

  // ── Send email ────────────────────────────────────────────────────────────

  async sendEmailReport(stats) {
    try {
      console.log(`\n📊 Stats: Total=${stats.total} | Passed=${stats.passed} | Failed=${stats.failed} | Skipped=${stats.skipped}`);

      const emailHtml = this.generateEmailBody(stats);

      // Generate PDF from the email HTML (guarantees PDF counts = email counts)
      // Delete any stale PDF from a previous run first — prevents wrong file being attached
      const attachments = [];
      const pdfPath = path.resolve('./test-results/report.pdf');
      try { fs.unlinkSync(pdfPath); } catch (_) {}

      try {
        console.log('📄 Generating PDF...');
        await this.generatePdfFromEmailHtml(emailHtml, pdfPath);
        console.log('✅ PDF generated');
      } catch (pdfErr) {
        console.warn('⚠️  PDF generation failed:', pdfErr.message);
      }

      if (fs.existsSync(pdfPath)) {
        attachments.push({ filename: 'Neonearth_Test_Report.pdf', path: pdfPath });
        console.log('✅ PDF attached');
      } else {
        console.warn('⚠️  No PDF attached — generation failed');
      }

      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: false,
        auth: { user: this.emailUser, pass: this.emailPassword },
      });

      const info = await transporter.sendMail({
        from: this.emailFrom,
        to: this.emailTo,
        subject: `Neonearth Test Report - ${new Date().toLocaleDateString()} - ${stats.failed === 0 ? '✅ PASSED' : '❌ FAILED'}`,
        html: emailHtml,
        attachments,
      });

      console.log(`✅ Email sent to ${this.emailTo}`);
      console.log(`   Message ID: ${info.messageId}\n`);
    } catch (error) {
      console.error('❌ Email error:', error.message);
    }
  }
}

module.exports = EmailReporter;

if (require.main === module) {
  (async () => {
    const r = new EmailReporter();
    await r.onEnd({});
  })();
}
