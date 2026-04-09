const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.menu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Tapestries' });
    this.product = page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' });
    this.rugsMenu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Rugs & Mats' });
    this.rectangleRugProduct = page.locator('span.product-text', { hasText: 'Rectangle Rug' });
    // Panoramic Tapestries category - hover over this to reveal sub-menu
    this.panoramicTapestryCategory = page.locator(`span:has-text("Custom Panoramic Tapestries")`);
    // Panoramic Tapestry Velvet Satin product - use xpath with normalize-space for accurate selection from sub-menu
    this.panoramicTapestryProduct = page.locator(`//span[normalize-space()='Custom Panoramic Tapestry - Velvet Satin']`);
    // Panoramic Tapestry Weave Loom product - from sub-menu
    this.panoramicWeaveLoomProduct = page.locator(`//span[normalize-space()='Custom Panoramic Tapestry - Weave Loom']`);
    // Weave Loom product
    this.weaveLoomProduct = page.getByText('Custom Wall Tapestry - Weave Loom', { exact: true });
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

  /** 
   * Navigate to Panoramic Tapestry product:
   * 1. Hover Tapestries menu → dropdown opens
   * 2. Hover span:has-text("Custom Panoramic Tapestries") → sub-menu reveals
   * 3. Click Custom Panoramic Tapestry - Velvet Satin from sub-menu
   */
  async navigateToPanoramicTapestryProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // Step 1: Hover over Tapestries menu to open dropdown
    await this.menu.hover();
    console.log('⏳ Step 1: Hovering over Tapestries menu to open dropdown...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // Step 2: Try to find the category, if not visible, perform jitter hover
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

    // Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Re-hovering with force parameter...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
    }

    // Step 2: Wait for category to be visible in dropdown and hover over it to reveal sub-menu
    await this.panoramicTapestryCategory.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Step 2: "Custom Panoramic Tapestries" category found in dropdown');
    
    await this.panoramicTapestryCategory.hover();
    console.log('⏳ Hovering over "Custom Panoramic Tapestries" to reveal sub-menu...');
    await this.page.waitForTimeout(2000); // Wait for sub-menu to appear
    
    // Step 3: Click on the specific product from the sub-menu
    await this.panoramicTapestryProduct.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Step 3: Custom Panoramic Tapestry - Velvet Satin visible in sub-menu');
    
    await this.panoramicTapestryProduct.click();
    console.log('✅ Clicked Custom Panoramic Tapestry - Velvet Satin from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/panoramic-tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Panoramic Tapestry PDP successfully');
  }

  /** Hover the Tapestries menu to open dropdown, then click the Custom Wall Tapestry - Weave Loom product */
  async navigateToWeaveLoomProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the product, if not visible, perform jitter hover
    let isProductVisible = await this.weaveLoomProduct.isVisible();
    if (!isProductVisible) {
      console.log('⚠️ Product not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isProductVisible = await this.weaveLoomProduct.isVisible();
    }

    // 3. Final attempt with force hover
    if (!isProductVisible) {
      console.log('⚠️ Re-hovering with force parameter...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
    }

    // Wait for the product to be visible and click it
    await this.weaveLoomProduct.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Custom Wall Tapestry - Weave Loom product visible');
    
    await this.weaveLoomProduct.click();
    console.log('✅ Clicked Custom Wall Tapestry - Weave Loom');

    // Confirm navigation to PDP
    await this.page.waitForURL(/weave-loom-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Weave Loom Tapestry PDP successfully');
  }

  /** 
   * Navigate to Panoramic Tapestry Weave Loom product:
   * 1. Hover Tapestries menu → dropdown opens
   * 2. Hover span:has-text("Custom Panoramic Tapestries") → sub-menu reveals
   * 3. Click Custom Panoramic Tapestry - Weave Loom from sub-menu
   */
  async navigateToPanoramicWeaveLoomProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // Step 1: Hover over Tapestries menu to open dropdown
    await this.menu.hover();
    console.log('⏳ Step 1: Hovering over Tapestries menu to open dropdown...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // Step 2: Try to find the category, if not visible, perform jitter hover
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

    // Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Re-hovering with force parameter...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
    }

    // Step 2: Wait for category to be visible in dropdown and hover over it to reveal sub-menu
    await this.panoramicTapestryCategory.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Step 2: "Custom Panoramic Tapestries" category found in dropdown');
    
    await this.panoramicTapestryCategory.hover();
    console.log('⏳ Hovering over "Custom Panoramic Tapestries" to reveal sub-menu...');
    await this.page.waitForTimeout(2000); // Wait for sub-menu to appear
    
    // Step 3: Click on the Weave Loom product from the sub-menu
    await this.panoramicWeaveLoomProduct.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Step 3: Custom Panoramic Tapestry - Weave Loom visible in sub-menu');
    
    await this.panoramicWeaveLoomProduct.click();
    console.log('✅ Clicked Custom Panoramic Tapestry - Weave Loom from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/panoramic-tapestry-p|weave-loom-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Panoramic Tapestry Weave Loom PDP successfully');
  }
}

module.exports = { HomePage };