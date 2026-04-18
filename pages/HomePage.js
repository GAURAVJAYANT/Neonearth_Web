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
      WAIT_INITIAL: 7000,
      WAIT_JITTER: 5000,
      WAIT_SUBMENU: 4500,
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

    // 1. Ensure the top-level menu is visible
    await menu.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });

    // 2. Hover retry loop — keeps trying until the dropdown target (category or product) appears
    const target = category || product;
    let isTargetReady = false;

    for (let i = 0; i < this.CONFIG.RETRIES; i++) {
      console.log(`⏳ Attempt ${i + 1}: Hovering over menu for ${name}...`);
      await menu.hover({ force: true });

      try {
        await target.waitFor({ state: 'visible', timeout: 5000 });
        isTargetReady = true;
        break;
      } catch (e) {
        console.log(`⚠️ ${name} target not visible yet, trying jitter hover...`);
        const box = await menu.boundingBox();
        if (box) {
          // Jitter: move slightly away then back to re-trigger the hover state
          await this.page.mouse.move(box.x - 30, box.y + box.height / 2);
          await this.page.waitForTimeout(500);
          await menu.hover({ force: true });
        }
        await this.page.waitForTimeout(this.CONFIG.WAIT_JITTER);
        isTargetReady = await target.isVisible();
        if (isTargetReady) break;
      }
    }

    if (!isTargetReady) {
      console.log(`🚨 Final Attempt: Force hovering...`);
      await menu.hover({ force: true });
      await this.page.waitForTimeout(this.CONFIG.WAIT_INITIAL);
    }

    // 3. Handle sub-category hover (e.g., "Hallway Runners", "Panoramic Tapestries")
    if (category) {
      await category.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
      await category.scrollIntoViewIfNeeded();
      await category.hover({ force: true });
      console.log(`⏳ Hovered over intermediate category: ${name}`);

      // Wait for product to appear after category hover, with retry
      for (let j = 0; j < 2; j++) {
        try {
          await product.waitFor({ state: 'visible', timeout: 5000 });
          break;
        } catch (e) {
          console.log(`⚠️ Product not visible after category hover (attempt ${j + 1}), retrying...`);
          await category.hover({ force: true });
          await this.page.waitForTimeout(1500);
        }
      }
    }

    // 4. Click the product link
    await product.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
    await product.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1500); // let menu animation settle

    try {
      await product.click({ timeout: 10000 });
    } catch (e) {
      console.log(`⚠️ Standard click failed for ${name}, attempting force click...`);
      await product.click({ force: true });
    }
    console.log(`✅ Clicked product for: ${name}`);

    // 5. Verify navigation landed on the correct PDP URL
    if (urlPattern) {
      await this.page.waitForURL(urlPattern, { timeout: this.CONFIG.WAIT_PDP_LOAD });
      console.log(`✨ Successfully navigated to ${name} PDP`);
    }
  }
}

module.exports = { HomePage };