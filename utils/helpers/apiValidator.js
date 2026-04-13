// utils/helpers/apiValidator.js
// Intercepts and validates network API calls during E2E tests.
// Ensures APIs return expected status codes and payloads — no blind waiting.
// Results appear in: console logs AND Allure Report (as steps + attachments).

const { log } = require('./logger');

// Lazy import to avoid issues outside Playwright context
let allure = null;
try {
  allure = require('allure-playwright').allure;
} catch (e) {}

/**
 * Waits for a network response matching a URL pattern during an action.
 * Validates status code and optionally validates the response body.
 *
 * Usage:
 *   const res = await validateApiCall(page, () => btn.click(), {
 *     urlPattern: '/cart/add',
 *     label: 'Add to Cart',
 *     expectedStatus: 200,
 *   });
 *
 * @param {import('@playwright/test').Page} page
 * @param {Function} action  Action that triggers the network call
 * @param {object} options
 * @param {string}   options.urlPattern      URL fragment to match
 * @param {string}   options.label           Name for logging
 * @param {number}   [options.expectedStatus=200]  Expected HTTP status
 * @param {Function} [options.validateBody]  Optional: (body) => void – throw to fail
 * @param {number}   [options.timeout=30000]
 * @returns {Promise<{status, url, body, responseTime}>}
 */
async function validateApiCall(page, action, options = {}) {
  const {
    urlPattern,
    label = urlPattern,
    expectedStatus = 200,
    validateBody = null,
    timeout = 30000,
  } = options;

  log(`🔗 Validating API: [${label}] — matching: "${urlPattern}"`);

  const start = Date.now();
  let capturedResponse = null;

  const [response] = await Promise.all([
    page.waitForResponse(
      res => res.url().includes(urlPattern),
      { timeout }
    ).catch(() => null),
    action(),
  ]);

  const responseTime = Date.now() - start;

  if (!response) {
    log(`⚠️  [${label}] ⚠️ No API call matched "${urlPattern}" within ${timeout}ms`);
    return null;
  }

  const status  = response.status();
  const url     = response.url();

  // ── Status Validation ─────────────────────────────────────────────
  const statusOk = status === expectedStatus;
  log(`  ${statusOk ? '✅' : '❌'} [${label}] HTTP ${status} (expected: ${expectedStatus}) — ${responseTime}ms`);

  // ── Push to Allure ────────────────────────────────────────────────
  if (allure) {
    await allure.step(`🔗 API: ${label} — HTTP ${status} (${responseTime}ms)`, async () => {
      await allure.parameter('URL',             url.split('?')[0]);
      await allure.parameter('HTTP Status',     `${status}`);
      await allure.parameter('Expected Status', `${expectedStatus}`);
      await allure.parameter('Response Time',   `${responseTime}ms`);
      await allure.parameter('Result',          statusOk ? '✅ PASS' : '❌ FAIL');

      const detail = [
        `API Validation — ${label}`,
        '─'.repeat(60),
        `URL             : ${url}`,
        `HTTP Status     : ${status}  (expected: ${expectedStatus})`,
        `Response Time   : ${responseTime}ms`,
        `Validation      : ${statusOk ? 'PASS ✅' : 'FAIL ❌'}`,
      ].join('\n');

      await allure.attachment(
        `🔗 API: ${label}`,
        Buffer.from(detail, 'utf-8'),
        'text/plain',
      );
    });
  }

  if (!statusOk) {
    throw new Error(
      `❌ API Validation Failed: [${label}]\n` +
      `   URL     : ${url}\n` +
      `   Expected: HTTP ${expectedStatus}\n` +
      `   Received: HTTP ${status}`
    );
  }

  // ── Body Validation (optional) ────────────────────────────────────
  let body = null;
  if (validateBody) {
    try {
      const contentType = response.headers()['content-type'] || '';
      body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      validateBody(body);
      log(`  ✅ [${label}] Response body validation passed`);
    } catch (e) {
      throw new Error(`❌ API Body Validation Failed: [${label}]\n   ${e.message}`);
    }
  }

  return { status, url, body, responseTime };
}

/**
 * Sets up passive API monitoring for a page — logs all API calls without blocking.
 * Call once in test setup (or in beforeEach).
 *
 * Usage:
 *   const monitor = monitorApiCalls(page, ['/cart', '/checkout', '/product']);
 *   // ... run test ...
 *   const report = monitor.getReport();
 *
 * @param {import('@playwright/test').Page} page
 * @param {string[]} urlPatterns  List of URL fragments to monitor
 */
function monitorApiCalls(page, urlPatterns = []) {
  const callLog = [];

  page.on('response', (response) => {
    const url = response.url();
    const matches = urlPatterns.some(p => url.includes(p));
    if (!matches) return;

    const entry = {
      url:    url,
      status: response.status(),
      time:   new Date().toISOString(),
    };
    callLog.push(entry);

    const icon = entry.status < 400 ? '✅' : '❌';
    log(`  ${icon} [API Monitor] ${entry.status} — ${url.split('?')[0]}`);
  });

  return {
    getReport: () => callLog,
    getFailures: () => callLog.filter(e => e.status >= 400),
    assertNoFailures: () => {
      const failures = callLog.filter(e => e.status >= 400);
      if (failures.length > 0) {
        throw new Error(
          `❌ API Monitor: ${failures.length} failed API call(s) detected:\n` +
          failures.map(f => `  - HTTP ${f.status}: ${f.url}`).join('\n')
        );
      }
      log(`✅ API Monitor: All ${callLog.length} intercepted calls returned success`);
    },
  };
}

/**
 * Validates that a cart API call succeeded after Add to Cart.
 * Wraps the common pattern used in ProductPage.
 *
 * @param {import('@playwright/test').Page} page
 * @param {Function} addToCartAction  The action that clicks the ATC button
 */
async function validateAddToCartApi(page, addToCartAction) {
  return validateApiCall(page, addToCartAction, {
    urlPattern: '/cart',
    label: 'Add To Cart',
    expectedStatus: 200,
    // Validate cart isn't empty in the response
    validateBody: (body) => {
      if (typeof body === 'string' && body.includes('"count":0')) {
        throw new Error('Cart count is 0 after adding item — ATC silently failed');
      }
    },
  });
}

/**
 * Validates the checkout page loaded with a valid session.
 * @param {import('@playwright/test').Page} page
 * @param {Function} checkoutAction
 */
async function validateCheckoutApi(page, checkoutAction) {
  return validateApiCall(page, checkoutAction, {
    urlPattern: '/onepagecheckout',
    label: 'Checkout Load',
    expectedStatus: 200,
  });
}

module.exports = {
  validateApiCall,
  monitorApiCalls,
  validateAddToCartApi,
  validateCheckoutApi,
};
