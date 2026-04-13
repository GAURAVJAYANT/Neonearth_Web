// utils/helpers/performanceHelper.js
// Measures real-world page performance during E2E tests.
// Collects: page load time, DOM ready, first paint, LCP, API response times.
// Results appear in: console logs, Allure Report (steps + attachments), JSON files.

const { log } = require('./logger');
const fs = require('fs');
const path = require('path');

// Lazy import to avoid issues if running outside Playwright context
let allure = null;
try {
  allure = require('allure-playwright').allure;
} catch (e) {
  // allure not available (e.g. unit test context)
}

// ── Thresholds (in ms) — fail test if exceeded ────────────────────────────
const THRESHOLDS = {
  pageLoad:    8000,  // Full page load
  domReady:    5000,  // DOM interactive
  firstPaint:  3000,  // First Contentful Paint
  lcp:         4000,  // Largest Contentful Paint
  apiResponse: 5000,  // Any single API call
};

// ── Results store — accumulated per test run ──────────────────────────────
const results = [];

/**
 * Measures full page navigation time and Web Vitals.
 * Attaches a formatted table + JSON to the Allure report.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} pageName  e.g. 'Cart Page', 'Checkout Page'
 * @param {boolean} failOnThreshold  Throws if any metric exceeds its limit
 */
async function measurePagePerformance(page, pageName, failOnThreshold = false) {
  log(`📊 Measuring performance for: ${pageName}`);

  // ── Collect metrics ───────────────────────────────────────────────────
  const timing = await page.evaluate(() => {
    const t = performance.timing;
    return {
      domReady: t.domContentLoadedEventEnd - t.navigationStart,
      pageLoad: t.loadEventEnd - t.navigationStart,
      ttfb:     t.responseStart - t.navigationStart,
    };
  });

  const paintMetrics = await page.evaluate(() => {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(e => e.name === 'first-contentful-paint');
    return { firstPaint: fcp ? Math.round(fcp.startTime) : null };
  });

  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      let lcpValue = null;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        lcpValue = Math.round(entries[entries.length - 1].startTime);
      });
      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
      setTimeout(() => resolve(lcpValue), 500);
    });
  });

  const metric = {
    page:       pageName,
    timestamp:  new Date().toISOString(),
    ttfb:       timing.ttfb,
    domReady:   timing.domReady,
    pageLoad:   timing.pageLoad,
    firstPaint: paintMetrics.firstPaint,
    lcp:        lcp,
  };

  results.push(metric);

  // ── Console log ───────────────────────────────────────────────────────
  log(`\n┌─── 📊 Performance: ${pageName} ${'─'.repeat(Math.max(0, 34 - pageName.length))}┐`);
  log(`│  TTFB               : ${_fmt(metric.ttfb)}   ${_badge(metric.ttfb, 2000)}`);
  log(`│  DOM Ready          : ${_fmt(metric.domReady)}   ${_badge(metric.domReady, THRESHOLDS.domReady)}`);
  log(`│  Page Load          : ${_fmt(metric.pageLoad)}   ${_badge(metric.pageLoad, THRESHOLDS.pageLoad)}`);
  log(`│  First Paint (FCP)  : ${_fmt(metric.firstPaint)}   ${_badge(metric.firstPaint, THRESHOLDS.firstPaint)}`);
  log(`│  LCP                : ${_fmt(lcp)}   ${_badge(lcp, THRESHOLDS.lcp)}`);
  log(`└${'─'.repeat(53)}┘`);

  // ── Push to Allure ────────────────────────────────────────────────────
  if (allure) {
    await allure.step(`📊 Performance: ${pageName}`, async () => {

      // Add each metric as a named parameter (shows as a table in Allure)
      await allure.parameter('TTFB',               `${metric.ttfb ?? 'N/A'}ms`);
      await allure.parameter('DOM Ready',           `${metric.domReady ?? 'N/A'}ms`);
      await allure.parameter('Page Load',           `${metric.pageLoad ?? 'N/A'}ms`);
      await allure.parameter('First Paint (FCP)',   `${metric.firstPaint ?? 'N/A'}ms`);
      await allure.parameter('LCP',                 `${lcp ?? 'N/A'}ms`);

      // Build a human-readable text table for the Allure attachment
      const table = _buildTextTable(pageName, metric, lcp);

      // Attach as plain text (shows inline in Allure) + raw JSON
      await allure.attachment(
        `⚡ Performance Report — ${pageName}`,
        Buffer.from(table, 'utf-8'),
        'text/plain',
      );

      await allure.attachment(
        `📦 Raw Performance Data — ${pageName}`,
        Buffer.from(JSON.stringify({ thresholds: THRESHOLDS, ...metric, lcp }, null, 2), 'utf-8'),
        'application/json',
      );
    });
  }

  // ── Threshold enforcement ─────────────────────────────────────────────
  if (failOnThreshold) {
    const violations = _getViolations(metric, lcp);
    if (violations.length > 0) {
      throw new Error(`⚡ Performance threshold exceeded on [${pageName}]:\n  - ${violations.join('\n  - ')}`);
    }
  }

  return metric;
}

/**
 * Validates an API call's response time and status, and logs to Allure.
 *
 * @param {import('@playwright/test').Page} page
 * @param {Function} action   Action that triggers the API call
 * @param {string} urlPattern URL substring to match
 * @param {string} label      Name shown in Allure
 * @param {boolean} failOnThreshold
 */
async function measureApiCall(page, action, urlPattern, label, failOnThreshold = false) {
  log(`🔗 Intercepting API: ${label}`);

  const start = Date.now();
  let responseStatus = null;
  let responseTime = null;
  let capturedUrl = null;

  const [response] = await Promise.all([
    page.waitForResponse(
      res => res.url().includes(urlPattern),
      { timeout: 30000 }
    ).then(res => {
      responseTime = Date.now() - start;
      responseStatus = res.status();
      capturedUrl = res.url();
      return res;
    }).catch(() => null),
    action(),
  ]);

  if (!response) {
    log(`⚠️  [${label}] No API response matched "${urlPattern}"`);
    return null;
  }

  const apiMetric = { api: label, url: capturedUrl, status: responseStatus, responseTime, timestamp: new Date().toISOString() };
  results.push(apiMetric);

  // ── Console log ───────────────────────────────────────────────────────
  const statusIcon = responseStatus < 400 ? '✅' : '❌';
  const timeIcon   = responseTime <= THRESHOLDS.apiResponse ? '🟢' : '🔴';
  log(`\n┌─── 🔗 API: ${label} ${'─'.repeat(Math.max(0, 40 - label.length))}┐`);
  log(`│  Status         : ${statusIcon} HTTP ${responseStatus}`);
  log(`│  Response Time  : ${timeIcon} ${responseTime}ms  (limit: ${THRESHOLDS.apiResponse}ms)`);
  log(`└${'─'.repeat(53)}┘`);

  // ── Push to Allure ────────────────────────────────────────────────────
  if (allure) {
    await allure.step(`🔗 API Validation: ${label}`, async () => {
      await allure.parameter('HTTP Status',    `${responseStatus}`);
      await allure.parameter('Response Time',  `${responseTime}ms`);
      await allure.parameter('Threshold',      `${THRESHOLDS.apiResponse}ms`);
      await allure.parameter('Result',         responseTime <= THRESHOLDS.apiResponse ? '✅ PASS' : '🔴 SLOW');

      const table = [
        `API Validation — ${label}`,
        '─'.repeat(50),
        `Status         : ${statusIcon} HTTP ${responseStatus}`,
        `Response Time  : ${responseTime}ms`,
        `Threshold      : ${THRESHOLDS.apiResponse}ms`,
        `Result         : ${responseTime <= THRESHOLDS.apiResponse ? 'PASS ✅' : 'SLOW 🔴'}`,
        `URL            : ${capturedUrl}`,
      ].join('\n');

      await allure.attachment(
        `🔗 API Result — ${label}`,
        Buffer.from(table, 'utf-8'),
        'text/plain',
      );
    });
  }

  if (failOnThreshold && responseStatus >= 400) throw new Error(`❌ API [${label}] returned HTTP ${responseStatus}`);
  if (failOnThreshold && responseTime > THRESHOLDS.apiResponse) throw new Error(`⚡ API [${label}] ${responseTime}ms exceeded ${THRESHOLDS.apiResponse}ms`);

  return apiMetric;
}

/**
 * Saves all collected metrics to a JSON file AND attaches a full summary to Allure.
 * Call at the end of each test (e.g. in verifySuccessAndReport).
 * @param {string} testName
 */
async function savePerformanceReport(testName) {
  const reportDir = path.resolve('performance-results');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const sanitized = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath  = path.join(reportDir, `${sanitized}_${Date.now()}.json`);

  const report = {
    test:       testName,
    runAt:      new Date().toISOString(),
    thresholds: THRESHOLDS,
    metrics:    [...results],
  };

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  log(`\n💾 Performance report saved: ${filePath}`);

  // ── Attach full summary to Allure ─────────────────────────────────────
  if (allure) {
    const summary = _buildSummaryText(testName, results);

    await allure.attachment(
      `📊 Full Performance Summary — ${testName}`,
      Buffer.from(summary, 'utf-8'),
      'text/plain',
    );

    await allure.attachment(
      `📦 Performance JSON — ${testName}`,
      Buffer.from(JSON.stringify(report, null, 2), 'utf-8'),
      'application/json',
    );
  }

  results.length = 0; // Reset for next test
  return filePath;
}

// ── Internal helpers ──────────────────────────────────────────────────────

function _fmt(ms) {
  if (ms === null || ms === undefined) return 'N/A      ';
  return `${ms}ms`.padEnd(9);
}

function _badge(value, threshold) {
  if (value === null || value === undefined) return '⚪ N/A';
  return value <= threshold ? '🟢 PASS' : '🔴 SLOW';
}

function _getViolations(metric, lcp) {
  const v = [];
  if (metric.pageLoad  > THRESHOLDS.pageLoad)  v.push(`Page Load ${metric.pageLoad}ms > ${THRESHOLDS.pageLoad}ms`);
  if (metric.domReady  > THRESHOLDS.domReady)   v.push(`DOM Ready ${metric.domReady}ms > ${THRESHOLDS.domReady}ms`);
  if (metric.firstPaint && metric.firstPaint > THRESHOLDS.firstPaint) v.push(`FCP ${metric.firstPaint}ms > ${THRESHOLDS.firstPaint}ms`);
  if (lcp && lcp > THRESHOLDS.lcp) v.push(`LCP ${lcp}ms > ${THRESHOLDS.lcp}ms`);
  return v;
}

function _buildTextTable(pageName, metric, lcp) {
  const row = (label, value, threshold) => {
    const val = value !== null && value !== undefined ? `${value}ms` : 'N/A';
    const status = (value === null || value === undefined) ? '⚪' : value <= threshold ? '✅ PASS' : '❌ SLOW';
    return `  ${label.padEnd(28)} ${val.padEnd(10)} Limit: ${threshold}ms   ${status}`;
  };
  return [
    `Performance Report — ${pageName}`,
    `Measured At : ${new Date().toISOString()}`,
    '─'.repeat(72),
    '  Metric                        Value      Threshold              Result',
    '─'.repeat(72),
    row('TTFB (Time to First Byte)',  metric.ttfb,       2000),
    row('DOM Ready',                  metric.domReady,   THRESHOLDS.domReady),
    row('Full Page Load',             metric.pageLoad,   THRESHOLDS.pageLoad),
    row('First Paint (FCP)',          metric.firstPaint, THRESHOLDS.firstPaint),
    row('Largest Contentful Paint',   lcp,               THRESHOLDS.lcp),
    '─'.repeat(72),
  ].join('\n');
}

function _buildSummaryText(testName, metrics) {
  const lines = [
    `Full Performance Summary`,
    `Test    : ${testName}`,
    `Run At  : ${new Date().toISOString()}`,
    '═'.repeat(72),
  ];
  for (const m of metrics) {
    if (m.page) {
      lines.push(`\n📄 Page: ${m.page}`);
      lines.push(`   TTFB        : ${m.ttfb ?? 'N/A'}ms`);
      lines.push(`   DOM Ready   : ${m.domReady ?? 'N/A'}ms`);
      lines.push(`   Page Load   : ${m.pageLoad ?? 'N/A'}ms`);
      lines.push(`   FCP         : ${m.firstPaint ?? 'N/A'}ms`);
      lines.push(`   LCP         : ${m.lcp ?? 'N/A'}ms`);
    } else if (m.api) {
      lines.push(`\n🔗 API: ${m.api}`);
      lines.push(`   Status      : HTTP ${m.status}`);
      lines.push(`   Time        : ${m.responseTime}ms`);
      lines.push(`   URL         : ${m.url}`);
    }
  }
  return lines.join('\n');
}

module.exports = { measurePagePerformance, measureApiCall, savePerformanceReport, THRESHOLDS };
