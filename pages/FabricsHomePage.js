// pages/FabricsHomePage.js

const { HomePage } = require('./HomePage');

class FabricsHomePage extends HomePage {

  constructor(page) {
    super(page);

    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Fabrics"))'
    );
  }

  async navigate(categoryName, productName) {

    // -----------------------------------
    // Smart Hover Main Menu
    // -----------------------------------

    await this.smartHover(this.menu);

    console.log('✅ Hovered Fabrics menu');

    // Small wait for mega menu animation
    await this.page.waitForTimeout(1000);

    // -----------------------------------
    // Category Hover
    // Example: By Style
    // -----------------------------------

    const category = this.page.getByRole('link', {
      name: categoryName,
      exact: false
    }).first();

    // Smart hover handles:
    // visibility
    // stability
    // scrolling
    // retries

    await this.smartHover(category);

    console.log(`✅ Hovered category: ${categoryName}`);

    // IMPORTANT
    // Wait for submenu render
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

    // Hover keeps submenu open
    await this.smartHover(product);

    await this.page.waitForTimeout(500);

    console.log(`🛒 Clicking product: ${searchName}`);

    // Smart click handles:
    // overlays
    // intercepted click
    // retries
    // stability
    // scrolling

    await this.smartClick(product);

    // Wait for navigation complete
    await this.page.waitForLoadState('domcontentloaded');

    console.log(
      `✅ Navigated Successfully: ${categoryName} → ${searchName}`
    );
  }
}

module.exports = { FabricsHomePage };