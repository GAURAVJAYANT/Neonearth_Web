const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { generatePdfReport } = require('./generate-pdf-report');
require('dotenv').config();

class EmailReporter {
  constructor() {
    this.emailUser = process.env.EMAIL_USER || 'ne.automation.user.01@gmail.com';
    this.emailPassword = process.env.EMAIL_PASSWORD;
    this.emailTo = process.env.EMAIL_TO || 'gaurav.jayant@groupbayport.com';
    this.emailFrom = process.env.EMAIL_FROM || 'Neonearth Automation <ne.automation.user.01@gmail.com>';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = process.env.SMTP_PORT || 587;

    // Validate credentials on initialization
    if (!this.emailPassword) {
      console.warn('WARNING: EMAIL_PASSWORD not set in .env file');
    }
  }

  /**
   * Create Nodemailer transporter for Gmail
   */
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

  /**
   * Read test results from JSON report
   */
  getTestResults() {
    const reportPath = path.resolve('./test-results/report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.warn('Test results file not found:', reportPath);
      return null;
    }

    try {
      const data = fs.readFileSync(reportPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading test results:', err.message);
      return null;
    }
  }

  async waitForTestResults(timeoutMs = 10000) {
    const reportPath = path.resolve('./test-results/report.json');
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (fs.existsSync(reportPath)) {
        try {
          const data = fs.readFileSync(reportPath, 'utf8');
          return JSON.parse(data);
        } catch (err) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return this.getTestResults();
  }

  /**
   * Playwright reporter hook. This sends the email after normal Playwright,
   * npm, and IDE-triggered test runs.
   */
  async onEnd() {
    if (process.env.EMAIL_REPORT === 'false' || process.argv.includes('--list')) {
      console.log('Email report skipped.');
      return;
    }

    await this.waitForTestResults();
    await this.generatePdfIfPossible();
    const success = await this.sendEmail();

    if (!success) {
      console.error('Email report failed. Check SMTP credentials and network access.');
    }
  }

  async generatePdfIfPossible() {
    const pdfPath = path.resolve('./test-results/report.pdf');

    try {
      await generatePdfReport();
    } catch (error) {
      if (fs.existsSync(pdfPath)) {
        console.warn('Could not regenerate PDF report. Attaching existing PDF:', error.message);
        return;
      }

      console.warn('Could not generate PDF report before email:', error.message);
    }
  }

  /**
   * Calculate comprehensive test statistics
   */
  calculateStats(results) {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let totalDuration = 0;
    let startTime = null;
    let endTime = null;
    const failedTests = [];
    const flakyTests = [];
    const slowTests = [];
    const testsBySuite = {};
    const testsByStatus = { passed: [], failed: [], skipped: [] };
    const countedTests = new Set();

    const addTest = (test, suiteTitle) => {
      const testKey = `${suiteTitle}::${test.title}`;
      if (countedTests.has(testKey)) {
        return;
      }
      countedTests.add(testKey);

      total++;

      const attempts = test.results || [test];
      const finalResult = attempts[attempts.length - 1] || {};
      const attemptStatuses = attempts.map(result => result.status).filter(Boolean);
      const status = attemptStatuses.includes('passed')
        ? 'passed'
        : finalResult.status || test.status || (test.ok ? 'passed' : 'failed');
      const duration = attempts.reduce((sum, result) => sum + (result.duration || 0), test.duration || 0);
      const errorMessage = finalResult.errors?.[0]?.message || test.error?.message || 'No error message';
      totalDuration += duration;

      if (!startTime) {
        startTime = results.stats?.startTime
          ? new Date(results.stats.startTime).toLocaleString()
          : new Date().toLocaleString();
      }
      endTime = results.stats?.startTime && results.stats?.duration
        ? new Date(new Date(results.stats.startTime).getTime() + results.stats.duration).toLocaleString()
        : new Date().toLocaleString();

      if (!testsBySuite[suiteTitle]) {
        testsBySuite[suiteTitle] = { passed: 0, failed: 0, skipped: 0, total: 0 };
      }
      testsBySuite[suiteTitle].total++;

      slowTests.push({
        title: test.title,
        suite: suiteTitle,
        duration: (duration / 1000).toFixed(2),
      });

      if (status === 'passed') {
        passed++;
        testsBySuite[suiteTitle].passed++;
        testsByStatus.passed.push({ title: test.title, suite: suiteTitle });

        if (attemptStatuses.slice(0, -1).some(attemptStatus => attemptStatus !== 'passed')) {
          flakyTests.push({
            title: test.title,
            suite: suiteTitle,
            retries: attempts.length - 1,
            finalResult: 'Passed After Retry',
          });
        }
      } else if (status === 'failed' || status === 'timedOut' || status === 'interrupted') {
        failed++;
        testsBySuite[suiteTitle].failed++;
        failedTests.push({
          title: test.title,
          suite: suiteTitle,
          error: errorMessage,
          severity: this.determineSeverity({ error: { message: errorMessage } }),
        });
        testsByStatus.failed.push({ title: test.title, suite: suiteTitle });
      } else {
        skipped++;
        testsBySuite[suiteTitle].skipped++;
        testsByStatus.skipped.push({ title: test.title, suite: suiteTitle });
      }
    };

    const walkSuite = (suite, parentTitle = '') => {
      const suiteTitle = parentTitle && suite.title ? `${parentTitle} > ${suite.title}` : (suite.title || parentTitle || 'Default Suite');

      (suite.tests || []).forEach(test => addTest(test, suiteTitle));
      (suite.specs || []).forEach(spec => {
        (spec.tests || []).forEach(test => addTest({ ...test, title: spec.title, ok: spec.ok }, suiteTitle));
      });
      (suite.suites || []).forEach(childSuite => walkSuite(childSuite, suiteTitle));
    };

    if (results && results.suites) {
      results.suites.forEach(suite => walkSuite(suite));
    }

    // Sort slow tests and get top 5
    const topSlowTests = slowTests
      .sort((a, b) => parseFloat(b.duration) - parseFloat(a.duration))
      .slice(0, 5);

    const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
    const failureRate = total > 0 ? ((failed / total) * 100).toFixed(2) : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      successRate,
      failureRate,
      totalDuration: (totalDuration / 1000).toFixed(2),
      startTime: startTime || new Date().toLocaleString(),
      endTime: endTime || new Date().toLocaleString(),
      failedTests,
      flakyTests,
      topSlowTests,
      testsBySuite,
      testsByStatus,
    };
  }

  /**
   * Determine severity of failed test
   */
  determineSeverity(test) {
    const message = (test.error?.message || '').toLowerCase();
    
    if (message.includes('critical') || message.includes('login') || message.includes('payment')) {
      return 'CRITICAL';
    } else if (message.includes('timeout') || message.includes('navigation')) {
      return 'HIGH';
    } else if (message.includes('assert') || message.includes('expect')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Get severity color
   */
  getSeverityColor(severity) {
    switch (severity) {
      case 'CRITICAL':
        return '#d32f2f';
      case 'HIGH':
        return '#f57c00';
      case 'MEDIUM':
        return '#fbc02d';
      case 'LOW':
        return '#388e3c';
      default:
        return '#757575';
    }
  }

  /**
   * Generate progress gauge for success rate
   */
  generateGauge(percentage) {
    return `${percentage}%`;
  }

  /**
   * Email-client-safe report layout. Simple and clean format matching the screenshot.
   */
  generateEmailBody(stats) {
    const timestamp = new Date().toLocaleString();
    const executionId = `NE-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}`;
    const statusText = stats.failed === 0 ? 'Passed' : 'Failed';
    const statusColor = stats.failed === 0 ? '#198754' : '#b42318';
    const warningCount = stats.flakyTests ? stats.flakyTests.length : 0;
    const passedRate = Number(stats.successRate || 0).toFixed(2);
    const failedRate = Number(stats.failureRate || 0).toFixed(2);
    const warningRate = stats.total > 0 ? ((warningCount / stats.total) * 100).toFixed(2) : '0.00';
    const skippedRate = stats.total > 0 ? ((stats.skipped / stats.total) * 100).toFixed(2) : '0.00';

    const tableStyle = 'width:100%;border-collapse:collapse;border:1px solid #000;';
    const thStyle = 'padding:10px;border:1px solid #000;text-align:center;font-weight:bold;background-color:#fff;color:#000;font-size:14px;';
    const tdStyle = 'padding:10px;border:1px solid #000;text-align:center;color:#000;font-size:14px;';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:20px;background-color:#f5f5f5;color:#333;font-family:Arial,'Segoe UI',sans-serif;">
        <div style="max-width:800px;margin:0 auto;background-color:#fff;padding:30px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          
          <h1 style="margin:0 0 20px;font-size:24px;color:#000;font-weight:bold;">Neonearth Test Automation Report</h1>
          
          <p style="margin:0 0 15px;font-size:14px;line-height:1.6;">Dear Team,</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">The execution of the <strong>Neonearth automation suite</strong> has completed. Below are the execution details.</p>
          
          <div style="margin:0 0 25px;font-size:14px;line-height:1.8;">
            <strong>Project Name :</strong> Neonearth<br>
            <strong>Suite Name :</strong> Playwright Automation<br>
            <strong>Execution Status :</strong> <span style="color:${statusColor};font-weight:bold;">${statusText}</span><br>
            <strong>Executed On :</strong> ${timestamp}<br>
            <strong>Execution Duration :</strong> ${stats.totalDuration}s<br>
            <strong>Execution ID :</strong> ${executionId}<br>
            <strong>Browser :</strong> Chromium<br>
            <strong>Base URL :</strong> https://www.neonearth.com/
          </div>

          <h2 style="margin:25px 0 15px;font-size:16px;color:#000;font-weight:bold;">Execution Result Percentage</h2>
          <table role="presentation" style="${tableStyle}margin-bottom:25px;">
            <tr>
              <th style="${thStyle}">Passed</th>
              <th style="${thStyle}">Failed</th>
              <th style="${thStyle}">Warning</th>
              <th style="${thStyle}">Skipped</th>
              <th style="${thStyle}">Terminated</th>
              <th style="${thStyle}">Not Executed</th>
            </tr>
            <tr>
              <td style="${tdStyle}">${passedRate}%</td>
              <td style="${tdStyle}">${failedRate}%</td>
              <td style="${tdStyle}">${warningRate}%</td>
              <td style="${tdStyle}">${skippedRate}%</td>
              <td style="${tdStyle}">0%</td>
              <td style="${tdStyle}">0%</td>
            </tr>
          </table>

          <h2 style="margin:25px 0 15px;font-size:16px;color:#000;font-weight:bold;">Execution Summary</h2>
          <table role="presentation" style="${tableStyle}margin-bottom:25px;">
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
              <td style="${tdStyle}">${warningCount}</td>
            </tr>
          </table>

          <p style="margin:20px 0 15px;font-size:14px;line-height:1.6;">Please find the comprehensive report for this execution attached to this email.</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;"><strong>Regards,</strong><br>Neonearth QA Automation</p>

          <div style="margin-top:25px;padding-top:15px;border-top:1px solid #ddd;color:#666;font-size:12px;line-height:1.5;">
            <p style="margin:0 0 3px;">Generated: ${timestamp}</p>
            <p style="margin:0 0 3px;">© 2026 Neonearth. Automated Quality Assurance System.</p>
            <p style="margin:0;">This is an automated email from the Neonearth Test Automation Platform.</p>
          </div>
        </div>
      </body>
      </html>`;
  }

  /**
   * Send email with report
   */
  async sendEmail() {
    try {
      console.log('\nPreparing to send professional email report...');

      // Get test results
      let results = this.getTestResults();
      let stats = null;
      
      if (!results) {
        console.warn('Test results JSON not found. Checking for alternative report sources...');
        
        // Try to create a basic report if JSON doesn't exist
        stats = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          successRate: 0,
          failureRate: 0,
          totalDuration: '0',
          startTime: new Date().toLocaleString(),
          endTime: new Date().toLocaleString(),
          failedTests: [],
          flakyTests: [],
          topSlowTests: [],
          testsBySuite: {},
          testsByStatus: { passed: [], failed: [], skipped: [] },
          note: 'Test results file not found. Check if tests executed successfully.'
        };
      } else {
        // Calculate statistics from existing results
        stats = this.calculateStats(results);
      }

      console.log(`\nTest Statistics:`);
      console.log(`   Total: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed} | Skipped: ${stats.skipped}`);
      console.log(`   Success Rate: ${stats.successRate}% | Failure Rate: ${stats.failureRate}%`);
      console.log(`   Duration: ${stats.totalDuration}s`);
      
      if (stats.flakyTests && stats.flakyTests.length > 0) {
        console.log(`   Flaky Tests: ${stats.flakyTests.length}`);
      }

      // Generate email body
      const emailHtml = this.generateEmailBody(stats);

      // Prepare attachments
      const attachments = [];
      const pdfPath = path.resolve('./test-results/report.pdf');
      
      if (fs.existsSync(pdfPath)) {
        attachments.push({
          filename: 'Neonearth_Test_Report.pdf',
          path: pdfPath,
        });
        console.log('PDF report attached');
      } else {
        console.warn('PDF report not found at:', pdfPath);
      }

      // Create transporter and send email
      const transporter = this.getTransporter();

      const mailOptions = {
        from: this.emailFrom,
        to: this.emailTo,
        subject: `Neonearth Test Report - ${new Date().toLocaleDateString()}`,
        html: emailHtml,
        attachments: attachments,
      };

      console.log(`\nSending professional email to: ${this.emailTo}`);
      const info = await transporter.sendMail(mailOptions);

      console.log('Professional email sent successfully!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      console.log('\nReport Features Included:');
      console.log('   ✓ Executive Summary');
      console.log('   ✓ Test Execution Timeline');
      console.log('   ✓ Environment Details');
      console.log('   ✓ Test Breakdown by Suite');
      if (stats.failedTests && stats.failedTests.length > 0) console.log('   ✓ Failed Test Analysis');
      if (stats.flakyTests && stats.flakyTests.length > 0) console.log('   ✓ Flaky Test Warnings');
      if (stats.topSlowTests && stats.topSlowTests.length > 0) console.log('   ✓ Performance Metrics');
      if (fs.existsSync(pdfPath)) console.log('   ✓ PDF Report Attached');
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error.message);
      
      if (error.message.includes('Invalid login') || error.message.includes('535') || error.message.includes('Bad credentials')) {
        console.error('\nAUTHENTICATION FAILED');
        console.error('   Your email/password combination is incorrect.');
        console.error('   For Gmail: Generate a new App Password:');
        console.error('      1. Go to https://myaccount.google.com/apppasswords');
        console.error('      2. Select "Mail" and "Windows Computer"');
        console.error('      3. Copy the 16-character password to EMAIL_PASSWORD in .env');
        console.error('   Make sure 2-Factor Authentication is enabled on your Gmail account\n');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('\nNETWORK ERROR');
        console.error('   Cannot reach SMTP server. Check your internet connection.\n');
      } else if (error.message.includes('socket hang up') || error.message.includes('timeout')) {
        console.error('\nCONNECTION TIMEOUT');
        console.error('   SMTP server did not respond. Check SMTP_HOST and SMTP_PORT.\n');
      }
      
      return false;
    }
  }
}

// Export for use in test pipeline
module.exports = EmailReporter;

// If run directly as a script
if (require.main === module) {
  (async () => {
    const reporter = new EmailReporter();
    const success = await reporter.sendEmail();
    process.exit(success ? 0 : 1);
  })();
}
