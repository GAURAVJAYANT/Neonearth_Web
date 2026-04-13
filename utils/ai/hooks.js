const { test: base } = require('@playwright/test');
const AIEngine = require('./index');
const { takeScreenshot } = require('../helpers/screenshotHelper');
const { log } = require('../helpers/logger');

/**
 * Custom test fixture that automatically analyzes failures.
 */
exports.test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    if (testInfo.status !== testInfo.expectedStatus) {
      log(`🚨 Test Failed: ${testInfo.title}. Analyzing...`);
      
      // Take a failure screenshot
      const screenshotName = `fail_${testInfo.title.replace(/\s+/g, '_')}`;
      await takeScreenshot(page, screenshotName);

      // Perform AI Analysis
      const analysis = await AIEngine.analyze(testInfo.error.message);
      
      // Attach analysis to the report (if using a reporter that supports it)
      console.log(`\n--- AI FAILURE ANALYSIS ---\n${analysis}\n--------------------------\n`);
    }
  },
});
