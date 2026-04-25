// pages/CurtainsHomePage.js

const { HomePage } = require('./HomePage');

class CurtainsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // Main Curtains menu
    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Curtains"))'
    );
  }

  async navigate(categoryName, productName) {
    // Wait for Curtains menu
    await this.menu.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Step 1 → Open Curtains dropdown
    await this.menu.hover();
    await this.page.waitForTimeout(1000);
    await this.waitForStability(this.menu);

    // ----------------------------------
    // Step 2 → Category Handling
    // ----------------------------------

    // Custom Drapes is usually default active
    if (!categoryName.includes('Custom Drapes')) {
      let category;

      // Special handling for Sheer Curtains
      if (categoryName.includes('Sheer')) {
        category = this.page.getByRole('link', {
          name: 'Sheer Curtains Best ›'
        });
      } else {
        category = this.page.getByRole('link', {
          name: categoryName,
          exact: false
        }).first();
      }

      await category.waitFor({
        state: 'visible',
        timeout: 15000
      });
      await this.waitForStability(category);

      await category.scrollIntoViewIfNeeded();

      // Only hover, no click
      await category.hover({
        force: true
      });

      // Wait for submenu products to refresh
      await this.page.waitForTimeout(1500);
      await this.waitForStability(category);
    }

    // ----------------------------------
    // Step 3 → Product Selection
    // ----------------------------------

    const product = this.page.getByRole('link', {
      name: productName,
      exact: false
    }).first();

    await product.waitFor({
      state: 'visible',
      timeout: 15000
    });
    await this.waitForStability(product);

    await product.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);

    try {
      console.log(`🖱️ Attempting click on: ${productName}`);
      await product.click({ timeout: 10000 });
    } catch (e) {
      console.log(`⚠️ Standard click failed for ${productName}, trying force click...`);
      await product.click({ force: true });
    }

    console.log(
      `Navigated: ${categoryName} → ${productName}`
    );
  }
}

module.exports = { CurtainsHomePage };