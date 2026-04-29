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
      WAIT_INITIAL: 8000,
      WAIT_JITTER: 8000,
      WAIT_SUBMENU: 8000,
      WAIT_PDP_LOAD: 30000,
      RETRIES: 3,
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

    // ── KEY: Wait for dropdown CSS animation to fully complete ──────────
    await this.page.waitForTimeout(2000);

    // Step 2: Retry if dropdown target not visible yet (jitter recovery)
    const target = category || product;
    let isTargetReady = false;

    for (let i = 0; i < this.CONFIG.RETRIES; i++) {
      try {
        await target.waitFor({ state: 'visible', timeout: 8000 });
        isTargetReady = true;
        console.log(`✅ Dropdown visible on attempt ${i + 1} for: ${name}`);
        break;
      } catch (e) {
        console.log(`⚠️ ${name} — dropdown not ready (attempt ${i + 1}), retrying hover...`);
        // Jitter: move cursor away then re-hover to re-trigger the CSS state
        const box = await menu.boundingBox();
        if (box) {
          await this.page.mouse.move(box.x - 30, box.y + box.height / 2);
          await this.page.waitForTimeout(500);
        }
        await menu.hover({ force: true });
        await this.page.waitForTimeout(this.CONFIG.WAIT_JITTER);
        isTargetReady = await target.isVisible();
        if (isTargetReady) break;
      }
    }

    if (!isTargetReady) {
      console.log(`🚨 Final fallback hover for: ${name}`);
      await menu.hover({ force: true });
      await this.page.waitForTimeout(this.CONFIG.WAIT_INITIAL);
    }

    // Step 3: Sub-category hover (e.g. "Custom Panoramic Tapestries", "Hallway Runners")
    if (category) {
      await category.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
      await category.scrollIntoViewIfNeeded();
      await category.hover({ force: true });
      console.log(`⏳ Hovering sub-category for: ${name}...`);

      // ── KEY: Wait for sub-menu flyout to fully animate open ────────────
      await this.page.waitForTimeout(2000);

      // Retry if product still not visible after sub-category hover
      for (let j = 0; j < 2; j++) {
        try {
          await product.waitFor({ state: 'visible', timeout: 8000 });
          console.log(`✅ Product link visible after sub-category hover`);
          break;
        } catch (e) {
          console.log(`⚠️ Product not visible after sub-hover (attempt ${j + 1}), retrying...`);
          await category.hover({ force: true });
          await this.page.waitForTimeout(2000);
        }
      }
    }

    // Step 4: Click the product link (final settle, then click)
    await product.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
    await product.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000); // brief settle before click

    try {
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

  /**
   * High-Stability Mega Menu Navigation Engine.
   * Handles the 'Active Wait & Category Re-hover' logic to ensure sub-menus always load.
   */
  async smartMegaMenuNavigate({ menu, categoryName, productName }) {
    const searchName = productName.includes('-')
      ? productName.split('-').pop().trim()
      : productName;

    console.log(`🚀 Starting Smart Navigation: ${categoryName} → ${searchName}`);

    // Step 1: Wait for and hover the top-level menu
    await menu.waitFor({ state: 'visible', timeout: 15000 });
    await menu.hover();
    await this.page.waitForTimeout(1000);
    await this.waitForStability(menu);

    // Step 2: Define Category and Product locators
    const category = this.page.getByRole('link', {
      name: categoryName,
      exact: false
    }).first();

    const product = this.page.getByRole('link', {
      name: searchName,
      exact: false
    }).first();

    // Step 3: Hover the category
    await category.waitFor({ state: 'visible', timeout: 15000 });
    await this.waitForStability(category);
    await category.scrollIntoViewIfNeeded();
    await category.hover({ force: true });
    console.log(`Hovered category: ${categoryName}`);

    // ── Step 4: Robust Sub-Menu Wait & Retry Loop ─────────────────────────────
    // We check if the product is visible. If not, we re-hover the category.
    let isProductReady = false;
    for (let i = 0; i < 3; i++) {
      try {
        await product.waitFor({ state: 'visible', timeout: 5000 });
        isProductReady = true;
        console.log(`✅ Product sub-menu visible on attempt ${i + 1}`);
        break;
      } catch (e) {
        console.log(`⚠️ Product not visible (attempt ${i + 1}), re-hovering category: ${categoryName}`);
        await category.hover({ force: true });
        await this.page.waitForTimeout(2000);
      }
    }

    if (!isProductReady) {
      throw new Error(`❌ Failed to load sub-menu product: ${searchName} after multiple category hovers.`);
    }

    // Step 5: Final Settle and Click
    await this.waitForStability(product);
    await product.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);

    console.log(`Clicking product: ${searchName}`);
    try {
      await product.click({ timeout: 10000 });
    } catch (e) {
      console.log(`⚠️ Standard click failed, trying force click...`);
      await product.click({ force: true });
    }

    console.log(`✅ Smart Navigated: ${categoryName} → ${searchName}`);
  }
}

module.exports = { HomePage };