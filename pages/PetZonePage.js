// pages/PetZoneHomePage.js

const { HomePage } = require('./HomePage');

class PetZoneHomePage extends HomePage {
  constructor(page) {
    super(page);

    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Pet Zone"))'
    );
  }

  async navigate(categoryName, productName) {
    // Wait for Pet Zone menu
    await this.menu.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Open Pet Zone dropdown
    await this.menu.hover();
    await this.page.waitForTimeout(1000);
    await this.waitForStability(this.menu);

    // -----------------------------------
    // Category Hover
    // Example: 
    // -----------------------------------

    const category = this.page.getByRole('link', {
      name: categoryName,
      exact: false
    }).first();

    await category.waitFor({
      state: 'visible',
      timeout: 15000
    });

    await this.waitForStability(category);
    await category.scrollIntoViewIfNeeded();

    await category.hover({
      force: true
    });

    console.log(`Hovered category: ${categoryName}`);

    await this.page.waitForTimeout(1500);

    // -----------------------------------
    // Product Click
    // Example:
    // By Style - Polyester
    // → Polyester
    // -----------------------------------

    const searchName = productName.includes('-')
      ? productName.split('-').pop().trim()
      : productName;

    const product = this.page.getByRole('link', {
      name: searchName,
      exact: false
    }).first();

    await product.waitFor({
      state: 'visible',
      timeout: 15000
    });

    await this.waitForStability(product);
    await product.scrollIntoViewIfNeeded();

    console.log(`Clicking product: ${searchName}`);

    await product.click();

    console.log(
      `✅ Navigated: ${categoryName} → ${searchName}`
    );
  }
}

module.exports = { PetZoneHomePage };