const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.menu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Tapestries' });
    this.product = page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' });
  }

  async open() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /** Hover the Tapestries menu, wait for dropdown, then click the Velvet Satin product */
  async navigateToProduct() {
    // Ensure the top‑level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // Use a real hover action which is usually more reliable than manual mouse moves
    await this.menu.hover({ force: true });
    await this.page.waitForTimeout(1000); // Give time for CSS/JS transitions
    console.log('✅ Mouse hovered over Tapestries');

    // Wait for the dropdown to become visible (using a more flexible selector if 'open' class is slow)
    const dropdown = this.page.locator('.mega-menu-container, .dropdown-menu').filter({ hasText: 'Custom Wall Tapestry' }).first();
    try {
      await dropdown.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Dropdown is visible');
    } catch (e) {
      console.log('⚠️ Dropdown not visible via standard hover, trying a click to open...');
      await this.menu.click();
      await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    }

    // Click the desired product inside the dropdown
    await this.product.waitFor({ state: 'visible', timeout: 10000 });
    await this.product.click({ force: true });
    console.log('✅ Clicked Custom Wall Tapestry - Velvet Satin');

    // Verify navigation to the product page
    await expect(this.page).toHaveURL(/custom-wall-tapestry-p/i, { timeout: 20000 });
    console.log('✅ Navigated to Velvet Satin product page');
  }
}

module.exports = { HomePage };