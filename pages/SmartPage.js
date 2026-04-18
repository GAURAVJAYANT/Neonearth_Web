const { BasePage } = require('./BasePage');
const AIEngine = require('../utils/ai');
const { log } = require('../utils/helpers/logger');

class SmartPage extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Core Smart Action Engine (FIXED)
   * @param {Function} action - function that accepts selector
   * @param {string} originalSelector
   * @param {string} actionName
   */
  async smartAction(action, originalSelector, actionName = 'Interaction') {
    try {
      return await action(originalSelector);
    } catch (error) {
      log(`⚠️ ${actionName} failed for [${originalSelector}]`);
      log(`🤖 Triggering AI healing...`);

      const fullDOM = await this.page.content();
      const healedSelector = await AIEngine.heal(originalSelector, fullDOM);

      if (!healedSelector || healedSelector === 'AI failed') {
        log(`❌ AI could not heal locator: [${originalSelector}]`);
        throw error;
      }

      log(`✨ AI suggested locator: ${healedSelector}`);

      try {
        return await action(healedSelector); // ✅ FIX: use healed selector
      } catch (healError) {
        log(`❌ Healing retry failed: ${healError.message}`);
        throw error; // throw original error for debugging clarity
      }
    }
  }

  /**
   * Smart Click
   */
  async smartClick(selector) {
    await this.smartAction(
      async (sel) => {
        const locator = this.page.locator(sel);
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
      },
      selector,
      'Click'
    );
  }

  /**
   * Smart Fill
   */
  async smartFill(selector, text) {
    await this.smartAction(
      async (sel) => {
        const locator = this.page.locator(sel);
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.fill(text);
      },
      selector,
      'Fill'
    );
  }

  /**
   * Smart Hover
   */
  async smartHover(selector) {
    await this.smartAction(
      async (sel) => {
        const locator = this.page.locator(sel);
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.hover();
      },
      selector,
      'Hover'
    );
  }

  /**
   * Smart Visible Assertion
   */
  async smartAssertVisible(selector) {
    await this.smartAction(
      async (sel) => {
        const locator = this.page.locator(sel);
        await locator.waitFor({ state: 'visible', timeout: 15000 });
      },
      selector,
      'Assert Visible'
    );
  }

  /**
   * Smart Text Assertion (BONUS)
   */
  async smartAssertText(selector, expectedText) {
    await this.smartAction(
      async (sel) => {
        const locator = this.page.locator(sel);
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        const actualText = await locator.textContent();

        if (!actualText.includes(expectedText)) {
          throw new Error(`Text mismatch. Expected: ${expectedText}, Found: ${actualText}`);
        }
      },
      selector,
      'Assert Text'
    );
  }

  /**
   * Failure Analysis (AI Debugging)
   */
  async analyzeFailure(error) {
    try {
      const analysis = await AIEngine.analyze(error.message);
      log(`🔍 AI Analysis:\n${analysis}`);
      return analysis;
    } catch (e) {
      log(`⚠️ AI analysis failed: ${e.message}`);
    }
  }
}

module.exports = { SmartPage };