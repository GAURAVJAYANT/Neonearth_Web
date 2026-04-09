const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.menu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Tapestries' });
    this.product = page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' });
    this.rugsMenu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Rugs & Mats' });
    this.rectangleRugProduct = page.locator('span.product-text', { hasText: 'Rectangle Rug' });
    // Use getByText for panoramic tapestries as requested in the user's requirement
    this.panoramicTapestryCategory = page.getByText('Custom Panoramic Tapestries', { exact: true });
    this.panoramicTapestryProduct = page.getByText('Custom Panoramic Tapestry - Velvet Satin', { exact: true });
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

  /** Hover the Rugs & Mats menu cleanly, wait for dropdown, then click the Rectangle Rug product */
  async navigateToRugsProduct() {
    // Ensure the top-level menu is visible
    await this.rugsMenu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Rugs & Mats menu found');

    // 1. Initial Clean Hover
    await this.rugsMenu.hover();
    console.log('⏳ Attempting primary hover...');
    await this.page.waitForTimeout(3000); // Wait for potential lag in site's JS

    // 2. Perform "Jitter" hover if dropdown is still not visible
    let isProductVisible = await this.rectangleRugProduct.isVisible();
    if (!isProductVisible) {
      console.log('⚠️ Dropdown not opening, trying jitter hover (move and re-enter)...');
      const box = await this.rugsMenu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2); // Move slightly left
        await this.page.waitForTimeout(500);
        await this.rugsMenu.hover(); // Move back center
        await this.page.waitForTimeout(3000);
      }
      isProductVisible = await this.rectangleRugProduct.isVisible();
    }

    // 3. Final Attempt: "Force" state check via more aggressive hover properties
    if (!isProductVisible) {
      console.log('⚠️ Re-hovering with force parameter...');
      await this.rugsMenu.hover({ force: true });
      await this.page.waitForTimeout(3000);
    }

    // At this point, we wait for the target product to be visible.
    await this.rectangleRugProduct.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Dropdown content visible via mouse hover');
    
    // Once dropdown is open, navigate directly to product sub-menu
    await this.rectangleRugProduct.click();
    console.log('✅ Clicked Rectangle Rug');

    // Confirm navigation to PDP
    await this.page.waitForURL(/rug-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Rug PDP successfully via clean hover');
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Panoramic Tapestries category, then click the product */
  async navigateToPanoramicTapestryProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.panoramicTapestryCategory.isVisible();
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.panoramicTapestryCategory.isVisible();
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Re-hovering with force parameter...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
    }

    // Wait for the category to be visible and hover over it
    await this.panoramicTapestryCategory.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Custom Panoramic Tapestries category visible, hovering over it...');
    
    await this.panoramicTapestryCategory.hover();
    console.log('⏳ Hovering over Custom Panoramic Tapestries to reveal sub-menu...');
    await this.page.waitForTimeout(2000); // Wait for sub-menu to appear
    
    // Now click on the specific product
    await this.panoramicTapestryProduct.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Custom Panoramic Tapestry - Velvet Satin product visible');
    
    await this.panoramicTapestryProduct.click();
    console.log('✅ Clicked Custom Panoramic Tapestry - Velvet Satin');

    // Confirm navigation to PDP
    await this.page.waitForURL(/panoramic-tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Panoramic Tapestry PDP successfully');
  }
}

module.exports = { HomePage };