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

  /** Hover the Tapestries menu cleanly, wait for dropdown, then click the Velvet Satin product */
  async navigateToProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover
    await this.menu.hover();
    console.log('⏳ Attempting primary hover...');
    await this.page.waitForTimeout(3000); // Wait for potential lag in site's JS

    // 2. Perform "Jitter" hover if dropdown is still not visible
    // This moves the mouse slightly within the menu item to re-trigger JS listeners
    let isProductVisible = await this.product.isVisible();
    if (!isProductVisible) {
      console.log('⚠️ Dropdown not opening, trying jitter hover (move and re-enter)...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2); // Move slightly left
        await this.page.waitForTimeout(500);
        await this.menu.hover(); // Move back center
        await this.page.waitForTimeout(3000);
      }
      isProductVisible = await this.product.isVisible();
    }

    // 3. Final Attempt: "Force" state check via more aggressive hover properties
    if (!isProductVisible) {
      console.log('⚠️ Re-hovering with force parameter...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
    }

    // At this point, we wait for the target product to be visible. 
    // We absolutely avoid clicking the top-level menu ('Tapestries') as it's unreliable.
    await this.product.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Dropdown content visible via mouse hover');
    
    // Once dropdown is open, navigate directly to product sub-menu
    await this.product.click();
    console.log('✅ Clicked Custom Wall Tapestry - Velvet Satin');

    // Confirm navigation to PDP
    await this.page.waitForURL(/custom-wall-tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to PDP successfully via clean hover');
  }
}

module.exports = { HomePage };