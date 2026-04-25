const { SmartPage } = require('./SmartPage');

/**
 * HomePage — Pure base class.
 * Contains only shared configuration, the open() method, and the _navigate() engine.
 * All product-specific locators and navigation methods live in the specialized subclasses:
 *   - TapestryHomePage  (pages/TapestryHomePage.js)
 *   - PillowHomePage    (pages/PillowHomePage.js)
 *   - RugsHomePage      (pages/RugsHomePage.js)
 */
class HomePage extends SmartPage {
  constructor(page) {
    super(page);

    // Shared navigation timing configuration
    this.CONFIG = {
      WAIT_INITIAL: 12000,
      WAIT_JITTER: 10000,
      WAIT_SUBMENU: 10000,
      WAIT_PDP_LOAD: 30000,
      RETRIES: 2,
      TIMEOUT_VISIBLE: 15000
    };
  }

  /** Open the website homepage */
  async open() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Core Navigation Engine — shared by all specialized subclasses.
   * Handles hover-and-click with jitter recovery, sub-category expansion,
   * force-click fallback, and URL verification.
   * @private
   */
  async _navigate({ menu, category = null, product, urlPattern, name }) {
    console.log(`🚀 Starting navigation to: ${name}`);

    // Step 1: Wait for any site-wide overlays, then hover the top-level menu
    await this.waitForOverlays();
    await menu.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
    await menu.hover({ force: true });
    console.log(`⏳ Hovering top-level menu for: ${name}...`);

    // Give the browser a moment to trigger the hover state and start animations
    await this.page.waitForTimeout(1000);

    // Step 2: Retry if dropdown target not visible yet (jitter recovery)
    const target = category || product;
    let isTargetReady = false;

    for (let i = 0; i < this.CONFIG.RETRIES; i++) {
      try {
        // Wait for target to be visible and stable
        await target.waitFor({ state: 'visible', timeout: 8000 });
        await this.waitForStability(target);
        isTargetReady = true;
        console.log(`✅ Dropdown visible and stable on attempt ${i + 1} for: ${name}`);
        break;
      } catch (e) {
        console.log(`⚠️ ${name} — dropdown not ready (attempt ${i + 1}), retrying hover...`);
        // Jitter: move cursor away then re-hover to re-trigger the CSS state
        const box = await menu.boundingBox();
        if (box) {
          await this.page.mouse.move(box.x - 50, box.y + box.height / 2);
          await this.page.waitForTimeout(500);
        }
        await menu.hover({ force: true });
        await this.page.waitForTimeout(1500);
        isTargetReady = await target.isVisible();
        if (isTargetReady) break;
      }
    }

    if (!isTargetReady) {
      console.log(`🚨 Final fallback hover for: ${name}`);
      await menu.hover({ force: true });
      await this.page.waitForTimeout(3000); // Longer wait on final fallback
    }

    // Step 3: Sub-category hover (e.g. "Custom Panoramic Tapestries", "Hallway Runners")
    if (category) {
      await category.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
      await this.waitForStability(category);
      await category.scrollIntoViewIfNeeded();
      await category.hover({ force: true });
      console.log(`⏳ Hovering sub-category for: ${name}...`);

      // Wait for submenu flyout to appear and stabilize
      await this.page.waitForTimeout(1000);
      await this.waitForStability(category);

      // Retry if product still not visible after sub-category hover
      for (let j = 0; j < 2; j++) {
        try {
          await product.waitFor({ state: 'visible', timeout: 8000 });
          await this.waitForStability(product);
          console.log(`✅ Product link visible and stable after sub-category hover`);
          break;
        } catch (e) {
          console.log(`⚠️ Product not visible after sub-hover (attempt ${j + 1}), retrying...`);
          await category.hover({ force: true });
          await this.page.waitForTimeout(1500);
        }
      }
    }

    // Step 4: Click the product link (final settle, then click)
    await product.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
    await this.waitForStability(product);
    await product.scrollIntoViewIfNeeded();
    
    // Final settle to ensure no moving parts are intercepting the click
    await this.page.waitForTimeout(1500); 

    try {
      console.log(`🖱️ Attempting click on: ${name}`);
      await product.click({ timeout: 10000 });
    } catch (e) {
      console.log(`⚠️ Standard click failed for ${name}, trying force click...`);
      await product.click({ force: true });
    }
    console.log(`✅ Clicked product for: ${name}`);

    // Step 5: Verify correct PDP URL
    if (urlPattern) {
      await this.page.waitForURL(urlPattern, { timeout: this.CONFIG.WAIT_PDP_LOAD });
      console.log(`✨ Successfully navigated to ${name} PDP`);
    }
  }
}

module.exports = { HomePage };