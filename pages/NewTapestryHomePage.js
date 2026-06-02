// pages/NewTapestryHomePage.js

const { HomePage } = require('./HomePage');

class NewTapestryHomePage extends HomePage {

  constructor(page) {
    super(page);

    // Top-level Tapestries menu
    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Tapestries"))'
    );
  }

  async navigate(categoryName, productName) {

    // -----------------------------------
    // Step 1 → Open Tapestries Dropdown
    // -----------------------------------

    await this.menu.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Smart hover main menu
    await this.smartHover(this.menu);

    console.log('✅ Hovered Tapestries menu');

    // IMPORTANT
    // Allow mega menu animation
    await this.page.waitForTimeout(2000);

    // -----------------------------------
    // Step 2 → Category Handling
    // -----------------------------------

    if (categoryName) {

      const category = this.page.getByRole('link', {
        name: categoryName,
        exact: false
      }).first();

      await category.waitFor({
        state: 'visible',
        timeout: 15000
      });

      // Smart hover handles:
      // visibility
      // stability
      // scrolling
      // retries

      await this.smartHover(category);

      console.log(`✅ Hovered category: ${categoryName}`);

      // IMPORTANT
      // Wait for submenu render
      await this.page.waitForTimeout(2500);
    }

    // -----------------------------------
    // Step 3 → Product Locator
    // -----------------------------------

    const searchName = productName.includes('-')
      ? productName.split('-').pop().trim()
      : productName;

    const product = this.page.getByRole('link', {
      name: searchName,
      exact: false
    }).first();

    // Wait until visible
    await product.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Wait for stable submenu render
    await this.waitForStability(product);

    await product.scrollIntoViewIfNeeded();

    // VERY IMPORTANT
    // Hover product first
    // keeps submenu alive

    await this.smartHover(product);

    // Give menu time to stabilize
    await this.page.waitForTimeout(1000);

    console.log(`🛒 Clicking product: ${searchName}`);

    try {

      // Smart click handles:
      // overlays
      // retries
      // stability
      // intercepted clicks

      await this.smartClick(product);

    } catch (e) {

      console.log(
        '⚠️ Smart click failed, trying JS click...'
      );

      // Final fallback
      await product.evaluate(el => el.click());
    }

    // Wait navigation complete
    await this.page.waitForLoadState(
      'domcontentloaded'
    );

    console.log(
      `✅ Navigated Successfully: ${
        categoryName
          ? categoryName + ' → '
          : ''
      }${searchName}`
    );
  }
}

module.exports = { NewTapestryHomePage };