// pages/NewRugsHomePage.js

const { HomePage } = require('./HomePage');

class NewRugsHomePage extends HomePage {

  constructor(page) {
    super(page);

    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Rugs"))'
    );
  }

  async navigate(categoryName, productName) {

    // -----------------------------------
    // Wait Main Menu
    // -----------------------------------

    await this.menu.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Hover Main Menu
    await this.smartHover(this.menu);

    console.log('✅ Hovered Rugs menu');

    // IMPORTANT
    // Allow mega menu animation
    await this.page.waitForTimeout(2000);

    // -----------------------------------
    // Category Hover
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

      // Hover category slowly
      await this.smartHover(category);

      console.log(`✅ Hovered category: ${categoryName}`);

      // VERY IMPORTANT
      // Wait submenu render fully
      await this.page.waitForTimeout(2500);
    }

    // -----------------------------------
    // Product Locator
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

    // Wait stability
    await this.waitForStability(product);

    // Scroll
    await product.scrollIntoViewIfNeeded();

    // VERY IMPORTANT
    // Hover product FIRST
    // Keeps submenu alive

    await this.smartHover(product);

    // Give menu time to stabilize
    await this.page.waitForTimeout(1000);

    console.log(`🛒 Clicking product: ${searchName}`);

    try {

      // Smart click
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

module.exports = { NewRugsHomePage };