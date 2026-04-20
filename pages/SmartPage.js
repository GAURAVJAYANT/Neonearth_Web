const { BasePage } = require('./BasePage');
const { expect } = require('@playwright/test');
const AIEngine = require('../utils/ai');
const { log } = require('../utils/helpers/logger');

class SmartPage extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Waits for an element's bounding box to be stable (not moving)
   * @param {import('@playwright/test').Locator} locator 
   * @param {number} timeoutMs 
   */
  async waitForStability(locator, timeoutMs = 5000) {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeoutMs });
      
      let prevBox = await locator.boundingBox();
      let stableFor = 0;
      const interval = 100;

      while (stableFor < 300) { // Stable for 300ms
        await this.page.waitForTimeout(interval);
        const currentBox = await locator.boundingBox();
        
        if (currentBox && prevBox && 
            currentBox.x === prevBox.x && 
            currentBox.y === prevBox.y && 
            currentBox.width === prevBox.width && 
            currentBox.height === prevBox.height) {
          stableFor += interval;
        } else {
          stableFor = 0;
          prevBox = currentBox;
        }
        
        if (stableFor >= 300) break;
      }
    } catch (e) {
      log(`  ⚠️ Stability check timed out or failed: ${e.message}`);
    }
  }

  /**
   * Waits for common site-wide overlays to disappear
   */
  async waitForOverlays(timeout = 15000) {
    const overlays = [
      '.loading-mask',
      '.spinner',
      '.overlay',
      '.ajax-loader',
      '.loader'
    ];
    
    for (const selector of overlays) {
      try {
        const locator = this.page.locator(selector).first();
        if (await locator.isVisible()) {
          log(`  ⏳ Waiting for overlay [${selector}] to disappear...`);
          await locator.waitFor({ state: 'hidden', timeout });
        }
      } catch (e) {}
    }
  }

  /**
   * Waits for all loaders to disappear and STAY hidden for a period of time.
   * Useful for handling 'flickering' loaders during long processes (like Checkout).
   */
  async waitForLoaderSilence(timeout = 300000, silenceDuration = 3000) {
    const overlays = ['.loading-mask', '.spinner', '.overlay', '.ajax-loader', '.loader'];
    const startTime = Date.now();
    
    log(`  ⏳ Watching for loaders to settle (max ${timeout/1000}s)...`);

    while (Date.now() - startTime < timeout) {
      const visibleLoaders = [];
      for (const selector of overlays) {
        if (await this.page.locator(selector).first().isVisible()) {
          visibleLoaders.push(selector);
        }
      }

      if (visibleLoaders.length === 0) {
        // Loaders are gone, now wait to ensure they STAY gone
        try {
          // Inner polling for silence duration to avoid huge wait
          const silenceStart = Date.now();
          let flickering = false;
          while (Date.now() - silenceStart < silenceDuration) {
            await this.page.waitForTimeout(500);
            for (const selector of overlays) {
              if (await this.page.locator(selector).first().isVisible()) {
                flickering = true;
                break;
              }
            }
            if (flickering) break;
          }

          if (!flickering) {
            log(`  ✅ Loaders settled after ${(Date.now() - startTime)/1000}s`);
            return; 
          }
        } catch (e) {}
      } else {
        log(`  🕐 Active loader detected: ${visibleLoaders.join(', ')}`);
        await this.page.waitForTimeout(1000);
      }
    }
    throw new Error(`Timed out waiting for loader silence after ${timeout/1000}s`);
  }

  /**
   * Helper to get a locator from either a string or an existing locator
   */
  _getLocator(selectorOrLocator) {
    if (typeof selectorOrLocator === 'string') {
      return this.page.locator(selectorOrLocator);
    }
    return selectorOrLocator;
  }

  /**
   * Core Smart Action Engine (ENHANCED)
   * Includes local retries for actionability issues before AI healing
   */
  async smartAction(action, target, actionName = 'Interaction') {
    let lastError;
    const targetName = typeof target === 'string' ? target : 'Element';
    const selectorForHealing = typeof target === 'string' ? target : null;
    
    // Stage 1: Robust Local Retries (Actionability Fix)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await action(target, attempt > 1); // pass isRetry flag
      } catch (error) {
        lastError = error;
        const msg = error.message.toLowerCase();
        
        log(`  🔁 ${actionName} Attempt ${attempt} failed for [${targetName}]: ${error.message.split('\n')[0]}`);
        
        if (msg.includes('intercepted') || msg.includes('visible') || msg.includes('enabled') || msg.includes('timeout')) {
          log(`  ⏳ Retrying in ${attempt}s...`);
          await this.waitForOverlays();
          await this.page.waitForTimeout(1000 * attempt);
        } else {
          break; // Not a transient flakiness issue, move to AI healing
        }
      }
    }

    // Stage 2: AI Healing Fallback (Only if we have a string selector)
    if (selectorForHealing) {
      log(`⚠️ ${actionName} failed globally for [${selectorForHealing}]`);
      log(`🤖 Triggering AI healing...`);

      const fullDOM = await this.page.content();
      const healedSelector = await AIEngine.heal(selectorForHealing, fullDOM);

      if (healedSelector && healedSelector !== 'AI failed') {
        log(`✨ AI suggested locator: ${healedSelector}`);
        try {
          return await action(healedSelector, true); 
        } catch (healError) {
          log(`❌ Healing retry failed: ${healError.message}`);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Smart Click (ULTRA ROBUST)
   */
  async smartClick(target, options = {}) {
    const { force = false, timeout = 15000 } = options;
    
    await this.smartAction(
      async (t, isRetry) => {
        const locator = this._getLocator(t).first();
        
        // 1. Physical visibility & Stability
        await locator.waitFor({ state: 'visible', timeout });
        await this.waitForStability(locator);
        
        // 2. Scroll & Adjust
        await locator.scrollIntoViewIfNeeded();
        if (isRetry) {
          // If we are retrying, try to scroll a bit more to clear any potential sticky overlays
          await this.page.evaluate(() => window.scrollBy(0, -100));
        }

        // 3. Click attempt
        try {
          // Normal click first to let Playwright handle actionability, or force if requested
          await locator.click({ timeout: 5000, force: isRetry || force });
        } catch (e) {
          if (e.message.includes('intercepted') && !isRetry) {
            log('  ⚠️ Click intercepted, retrying with force in next attempt...');
            throw e; 
          }
          throw e;
        }
      },
      target,
      'Click'
    );
  }

  /**
   * Smart Fill
   */
  async smartFill(target, text, timeout = 15000) {
    await this.smartAction(
      async (t) => {
        const locator = this._getLocator(t).first();
        await locator.waitFor({ state: 'visible', timeout });
        await locator.scrollIntoViewIfNeeded();
        await locator.click({ clickCount: 3 }); 
        await locator.fill(text);
      },
      target,
      'Fill'
    );
  }

  /**
   * Smart Hover
   */
  async smartHover(target, timeout = 10000) {
    await this.smartAction(
      async (t) => {
        const locator = this._getLocator(t).first();
        await locator.waitFor({ state: 'visible', timeout });
        await locator.scrollIntoViewIfNeeded();
        await locator.hover();
      },
      target,
      'Hover'
    );
  }

  /**
   * Smart Visible Assertion
   */
  async smartAssertVisible(target, timeout = 15000) {
    await this.smartAction(
      async (t) => {
        const locator = this._getLocator(t).first();
        await expect(locator).toBeVisible({ timeout });
      },
      target,
      'Assert Visible'
    );
  }

  /**
   * Smart Text Assertion
   */
  async smartAssertText(target, expectedText, timeout = 10000) {
    await this.smartAction(
      async (t) => {
        const locator = this._getLocator(t).first();
        await locator.waitFor({ state: 'visible', timeout });
        await expect(locator).toContainText(expectedText, { timeout });
      },
      target,
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