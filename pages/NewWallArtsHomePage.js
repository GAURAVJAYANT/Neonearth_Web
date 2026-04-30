// pages/NewTapestryHomePage.js

const { HomePage } = require('./HomePage');

class NewWallArtsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // Top-level Wall Arts menu item
    this.menu = page.locator('a[href="/wall-arts"]');
    // page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Wall Arts"))');
  }

  async navigate(categoryName, productName) {
    // Wait for Wall Arts menu
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });

    // Step 1: Open Wall Arts dropdown
    await this.menu.hover();
    await this.page.waitForTimeout(1000);
    await this.waitForStability(this.menu);

    // Step 2: Handle Category if provided (e.g., "Custom Wall Tapestries")
    if (categoryName) {
      const category = this.page.getByRole('link', {
        name: categoryName,
        exact: false
      }).first();

      await category.waitFor({ state: 'visible', timeout: 15000 });
      await this.waitForStability(category);
      await category.hover({ force: true });
      console.log(`Hovered category: ${categoryName}`);
      await this.page.waitForTimeout(1500); // Wait for sub-menu to expand
    }

    // Step 3: Define Product locator
    const searchName = productName.includes('-')
      ? productName.split('-').pop().trim()
      : productName;

    const product = this.page.getByRole('link', {
      name: searchName,
      exact: false
    }).first();

    // Step 4: Wait, Stabilize, and Click
    await product.waitFor({ state: 'visible', timeout: 15000 });
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

    console.log(`✅ Navigated: ${categoryName ? categoryName + ' → ' : ''}${searchName}`);
  }
}

module.exports = { NewWallArtsHomePage };
