const { expect } = require('@playwright/test');
const { SmartPage } = require('./SmartPage');

class HomePage extends SmartPage {
  constructor(page) {
    super(page);
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
    // Triangular Tapestries category - hover over this to reveal sub-menu
    this.triangularTapestryCategory = page.locator(`span:has-text("Custom Triangular Tapestries")`);
    // Triangular Tapestry Velvet Satin product - from sub-menu
    this.triangularTapestryProduct = page.locator(`//span[normalize-space()='Custom Triangular Tapestry - Velvet Satin']`);
    // Triangular Tapestry Weave Loom product - from sub-menu
    this.triangularWeaveLoomProduct = page.locator(`//span[normalize-space()='Custom Triangular Tapestry - Weave Loom']`);
    // Hanging Tapestries category - hover over this to reveal sub-menu
    this.hangingTapestryCategory = page.locator(`span:has-text("Custom Hanging Tapestries")`);
    // Hanging Tapestry Velvet Satin product - from sub-menu
    this.hangingTapestryProduct = page.locator(`//span[normalize-space()='Custom Hanging Tapestry - Velvet Satin']`);
    // Hanging Tapestry Weave Loom product - from sub-menu
    this.hangingWeaveLoomProduct = page.locator(`//span[normalize-space()='Custom Hanging Tapestry - Weave Loom']`);
    // Weave Loom product
    this.weaveLoomProduct = page.getByText('Custom Wall Tapestry - Weave Loom', { exact: true });
    // Pillows menu
    this.pillowsMenu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Pillows' });
    // Throw Pillows category in dropdown - use role-based selector to avoid strict mode violation
    this.throwPillowsCategory = page.getByRole('link', { name: /^Throw Pillows$/ }).first();
    // Custom Square Throw Pillow product in submenu
    this.customSquareThrowPillow = page.getByRole('link', { name: 'Custom Square Throw Pillow' }).first();
    // Custom Rectangle Throw Pillow product in submenu
    this.customRectangleThrowPillow = page.getByRole('link', { name: 'Custom Rectangle Throw Pillow' }).first();
    // Custom Round Throw Pillow product in submenu
    this.customRoundThrowPillow = page.getByRole('link', { name: 'Custom Round Throw Pillow' }).first();
    // Cushions category in dropdown - use href attribute for reliable matching
    this.cushionsCategory = page.locator('a[href="/cushions"]').first();
    // Square Seat Cushion product in submenu - look for link with title containing Square Seat Cushion
    this.squareSeatCushion = page.locator('a[href*="square-seat"]').first();
    // Round Seat Cushion product in submenu
    this.roundSeatCushion = page.locator('a[href*="round-seat"]').first();
    // Rectangle Seat Cushion product in submenu
    this.rectangleSeatCushion = page.locator('a[href*="rectangle-seat"]').first();
    // Bed Pillows category in dropdown
    this.bedPillowsCategory = page.locator('a[href*="/bed-pillows"]').first();
    // Bed Pillow product in submenu
    this.bedPillow = page.getByText('Bed Pillow', { exact: true });
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

  /** Hover the Tapestries menu to open dropdown, hover over Custom Panoramic Tapestries category to reveal sub-menu, then click the Velvet Satin product */
  async navigateToPanoramicTapestryProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.panoramicTapestryCategory.isVisible().catch(() => false);
    console.log(`Category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.panoramicTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Category still not visible, trying force hover...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
      isCategoryVisible = await this.panoramicTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the category to be visible
    try {
      await this.panoramicTapestryCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Custom Panoramic Tapestries" category found and visible');
    } catch (e) {
      console.log('⚠️ Category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll category into view if needed
    try {
      await this.panoramicTapestryCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll category into view');
    }
    
    // Hover over the category to reveal sub-menu
    await this.panoramicTapestryCategory.hover();
    console.log('⏳ Hovered over "Custom Panoramic Tapestries" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for product to become visible in sub-menu
    try {
      await this.panoramicTapestryProduct.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Panoramic Tapestry - Velvet Satin visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Product did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.panoramicTapestryProduct.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled product into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.panoramicTapestryProduct.click();
    console.log('✅ Clicked Custom Panoramic Tapestry - Velvet Satin from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/panoramic-tapestry-p|tapestry-p/i, { timeout: 30000 });
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

  /** Hover the Tapestries menu to open dropdown, hover over Custom Panoramic Tapestries category to reveal sub-menu, then click the Weave Loom product */
  async navigateToPanoramicWeaveLoomProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.panoramicTapestryCategory.isVisible().catch(() => false);
    console.log(`Category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.panoramicTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Category still not visible, trying force hover...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
      isCategoryVisible = await this.panoramicTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the category to be visible
    try {
      await this.panoramicTapestryCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Custom Panoramic Tapestries" category found and visible');
    } catch (e) {
      console.log('⚠️ Category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll category into view if needed
    try {
      await this.panoramicTapestryCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll category into view');
    }
    
    // Hover over the category to reveal sub-menu
    await this.panoramicTapestryCategory.hover();
    console.log('⏳ Hovered over "Custom Panoramic Tapestries" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for product to become visible in sub-menu
    try {
      await this.panoramicWeaveLoomProduct.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Panoramic Tapestry - Weave Loom visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Product did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.panoramicWeaveLoomProduct.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled product into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.panoramicWeaveLoomProduct.click();
    console.log('✅ Clicked Custom Panoramic Tapestry - Weave Loom from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/panoramic-tapestry-p|weave-loom-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Panoramic Tapestry Weave Loom PDP successfully');
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Triangular Tapestries category to reveal sub-menu, then click the Velvet Satin product */
  async navigateToTriangularTapestryProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.triangularTapestryCategory.isVisible().catch(() => false);
    console.log(`Category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.triangularTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Category still not visible, trying force hover...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
      isCategoryVisible = await this.triangularTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the category to be visible
    try {
      await this.triangularTapestryCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Custom Triangular Tapestries" category found and visible');
    } catch (e) {
      console.log('⚠️ Category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll category into view if needed
    try {
      await this.triangularTapestryCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll category into view');
    }
    
    // Hover over the category to reveal sub-menu
    await this.triangularTapestryCategory.hover();
    console.log('⏳ Hovered over "Custom Triangular Tapestries" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for product to become visible in sub-menu
    try {
      await this.triangularTapestryProduct.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Triangular Tapestry - Velvet Satin visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Product did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.triangularTapestryProduct.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled product into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.triangularTapestryProduct.click();
    console.log('✅ Clicked Custom Triangular Tapestry - Velvet Satin from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/triangular-tapestry-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Triangular Tapestry PDP successfully');
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Triangular Tapestries category to reveal sub-menu, then click the Weave Loom product */
  async navigateToTriangularWeaveLoomProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.triangularTapestryCategory.isVisible().catch(() => false);
    console.log(`Category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.triangularTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Category still not visible, trying force hover...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
      isCategoryVisible = await this.triangularTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the category to be visible
    try {
      await this.triangularTapestryCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Custom Triangular Tapestries" category found and visible');
    } catch (e) {
      console.log('⚠️ Category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll category into view if needed
    try {
      await this.triangularTapestryCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll category into view');
    }
    
    // Hover over the category to reveal sub-menu
    await this.triangularTapestryCategory.hover();
    console.log('⏳ Hovered over "Custom Triangular Tapestries" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for product to become visible in sub-menu
    try {
      await this.triangularWeaveLoomProduct.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Triangular Tapestry - Weave Loom visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Product did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.triangularWeaveLoomProduct.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled product into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.triangularWeaveLoomProduct.click();
    console.log('✅ Clicked Custom Triangular Tapestry - Weave Loom from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/triangular-tapestry-p|weave-loom-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Triangular Tapestry Weave Loom PDP successfully');
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Hanging Tapestries category to reveal sub-menu, then click the Velvet Satin product */
  async navigateToHangingTapestryProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.hangingTapestryCategory.isVisible().catch(() => false);
    console.log(`Category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.hangingTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Category still not visible, trying force hover...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
      isCategoryVisible = await this.hangingTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the category to be visible
    try {
      await this.hangingTapestryCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Custom Hanging Tapestries" category found and visible');
    } catch (e) {
      console.log('⚠️ Category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll category into view if needed
    try {
      await this.hangingTapestryCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll category into view');
    }
    
    // Hover over the category to reveal sub-menu
    await this.hangingTapestryCategory.hover();
    console.log('⏳ Hovered over "Custom Hanging Tapestries" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for product to become visible in sub-menu
    try {
      await this.hangingTapestryProduct.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Hanging Tapestry - Velvet Satin visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Product did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.hangingTapestryProduct.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled product into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.hangingTapestryProduct.click();
    console.log('✅ Clicked Custom Hanging Tapestry - Velvet Satin from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/hanging-tapestry-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Hanging Tapestry PDP successfully');
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Hanging Tapestries category to reveal sub-menu, then click the Weave Loom product */
  async navigateToHangingWeaveLoomProduct() {
    // Ensure the top-level menu is visible
    await this.menu.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Tapestries menu found');

    // 1. Initial Clean Hover on Tapestries menu
    await this.menu.hover();
    console.log('⏳ Hovering over Tapestries menu...');
    await this.page.waitForTimeout(3000); // Wait for dropdown to appear

    // 2. Try to find the category, if not visible, perform jitter hover
    let isCategoryVisible = await this.hangingTapestryCategory.isVisible().catch(() => false);
    console.log(`Category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Category not visible, trying jitter hover...');
      const box = await this.menu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.menu.hover();
        await this.page.waitForTimeout(3000);
      }
      isCategoryVisible = await this.hangingTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Category still not visible, trying force hover...');
      await this.menu.hover({ force: true });
      await this.page.waitForTimeout(3000);
      isCategoryVisible = await this.hangingTapestryCategory.isVisible().catch(() => false);
      console.log(`Category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the category to be visible
    try {
      await this.hangingTapestryCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Custom Hanging Tapestries" category found and visible');
    } catch (e) {
      console.log('⚠️ Category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll category into view if needed
    try {
      await this.hangingTapestryCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll category into view');
    }
    
    // Hover over the category to reveal sub-menu
    await this.hangingTapestryCategory.hover();
    console.log('⏳ Hovered over "Custom Hanging Tapestries" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for product to become visible in sub-menu
    try {
      await this.hangingWeaveLoomProduct.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Hanging Tapestry - Weave Loom visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Product did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.hangingWeaveLoomProduct.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled product into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.hangingWeaveLoomProduct.click();
    console.log('✅ Clicked Custom Hanging Tapestry - Weave Loom from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/hanging-tapestry-p|weave-loom-p|tapestry-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Hanging Tapestry Weave Loom PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Throw Pillows category to reveal sub-menu, then click the Custom Square Throw Pillow product */
  async navigateToPillowProduct() {
    // Ensure the Pillows menu is visible - this is quick check
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Initial Hover on Pillows menu - immediately
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(1000); // Quick wait for dropdown animation

    // 2. Wait for Throw Pillows category to be visible
    try {
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 3000 });
      console.log('✅ "Throw Pillows" category found and visible');
    } catch (e) {
      console.log('⚠️ Throw Pillows not visible yet, trying again...');
      await this.pillowsMenu.hover();
      await this.page.waitForTimeout(1000);
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 3000 });
    }
    
    // 3. Hover over the Throw Pillows category to reveal sub-menu
    await this.throwPillowsCategory.hover();
    console.log('⏳ Hovered over "Throw Pillows" category');
    await this.page.waitForTimeout(1000); // Quick wait for sub-menu animation
    
    // 4. Wait for Custom Square Throw Pillow product to be visible in sub-menu
    try {
      await this.customSquareThrowPillow.waitFor({ state: 'visible', timeout: 3000 });
      console.log('✅ Custom Square Throw Pillow visible in sub-menu');
    } catch (e) {
      console.log(`⚠️ Product not visible: ${e.message.split('\n')[0]}`);
      console.log('⏳ Retrying hover...');
      await this.throwPillowsCategory.hover();
      await this.page.waitForTimeout(1000);
      await this.customSquareThrowPillow.waitFor({ state: 'visible', timeout: 3000 });
    }
    
    // 5. Click the product immediately
    await this.customSquareThrowPillow.click();
    console.log('✅ Clicked Custom Square Throw Pillow from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/throw-pillow-p|pillow-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Custom Square Throw Pillow PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Throw Pillows category to reveal sub-menu, then click the Custom Rectangle Throw Pillow product */
  async navigateToRectangleThrowPillowProduct() {
    // Ensure the Pillows menu is visible - this is quick check
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Initial Hover on Pillows menu - immediately
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(1000); // Quick wait for dropdown animation

    // 2. Wait for Throw Pillows category to be visible
    try {
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 3000 });
      console.log('✅ "Throw Pillows" category found and visible');
    } catch (e) {
      console.log('⚠️ Throw Pillows not visible yet, trying again...');
      await this.pillowsMenu.hover();
      await this.page.waitForTimeout(1000);
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 3000 });
    }
    
    // 3. Hover over the Throw Pillows category to reveal sub-menu
    await this.throwPillowsCategory.hover();
    console.log('⏳ Hovered over "Throw Pillows" category');
    await this.page.waitForTimeout(1000); // Quick wait for sub-menu animation
    
    // 4. Wait for Custom Rectangle Throw Pillow product to be visible in sub-menu
    try {
      await this.customRectangleThrowPillow.waitFor({ state: 'visible', timeout: 3000 });
      console.log('✅ Custom Rectangle Throw Pillow visible in sub-menu');
    } catch (e) {
      console.log(`⚠️ Product not visible: ${e.message.split('\n')[0]}`);
      console.log('⏳ Retrying hover...');
      await this.throwPillowsCategory.hover();
      await this.page.waitForTimeout(1000);
      await this.customRectangleThrowPillow.waitFor({ state: 'visible', timeout: 3000 });
    }
    
    // 5. Click the product immediately
    await this.customRectangleThrowPillow.click();
    console.log('✅ Clicked Custom Rectangle Throw Pillow from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/throw-pillow-p|pillow-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Custom Rectangle Throw Pillow PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Throw Pillows category to reveal sub-menu, then click the Custom Round Throw Pillow product */
  async navigateToRoundThrowPillowProduct() {
    // Ensure the Pillows menu is visible
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Hover on Pillows menu
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(2000);

    // 2. Wait for Throw Pillows category to be visible
    try {
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ "Throw Pillows" category found');
    } catch (e) {
      console.log('⚠️ Throw Pillows not visible, retrying...');
      await this.pillowsMenu.hover();
      await this.page.waitForTimeout(2000);
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 5000 });
    }
    
    // 3. Hover over Throw Pillows category
    await this.throwPillowsCategory.hover();
    console.log('⏳ Hovered over "Throw Pillows" category');
    await this.page.waitForTimeout(2000);
    
    // 4. Wait for Custom Round Throw Pillow to be visible
    try {
      await this.customRoundThrowPillow.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Custom Round Throw Pillow visible in sub-menu');
    } catch (e) {
      console.log(`⚠️ Product not visible: ${e.message.split('\n')[0]}`);
      console.log('⏳ Retrying hover...');
      await this.throwPillowsCategory.hover();
      await this.page.waitForTimeout(2000);
      await this.customRoundThrowPillow.waitFor({ state: 'visible', timeout: 5000 });
    }
    
    // 5. Scroll product into view
    try {
      await this.customRoundThrowPillow.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Custom Round Throw Pillow into view');
    } catch (e) {
      console.log('⚠️ Could not scroll product into view');
    }
    
    // 6. Wait before clicking
    await this.page.waitForTimeout(1000);
    
    // 7. Click the product
    try {
      console.log('⏳ Clicking Custom Round Throw Pillow...');
      await this.customRoundThrowPillow.click();
      console.log('✅ Clicked Custom Round Throw Pillow from sub-menu');
    } catch (e) {
      console.log(`⚠️ Click failed: ${e.message.split('\n')[0]}`);
      console.log('⏳ Taking screenshot for debugging...');
      await this.page.screenshot({ path: 'round-pillow-debug.png', fullPage: true });
      throw new Error('Custom Round Throw Pillow could not be clicked');
    }

    // Confirm navigation to PDP
    await this.page.waitForURL(/throw-pillow-p|pillow-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Custom Round Throw Pillow PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Cushions category in dropdown to reveal sub-menu, then click the Square Seat Cushion product */
  async navigateToSquareSeatCushionProduct() {
    // Ensure the Pillows menu is visible
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Initial Hover on Pillows menu
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(2000); // Wait for dropdown to appear

    // 2. Try to find the Cushions category, if not visible, perform jitter hover
    let isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
    console.log(`Cushions category visibility check (attempt 1): ${isCategoryVisible}`);
    
    if (!isCategoryVisible) {
      console.log('⚠️ Cushions category not visible, trying jitter hover...');
      const box = await this.pillowsMenu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.pillowsMenu.hover();
        await this.page.waitForTimeout(2000);
      }
      isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
      console.log(`Cushions category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Cushions category still not visible, trying force hover...');
      await this.pillowsMenu.hover({ force: true });
      await this.page.waitForTimeout(2000);
      isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
      console.log(`Cushions category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the Cushions category to be visible
    try {
      await this.cushionsCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Cushions" category found and visible');
    } catch (e) {
      console.log('⚠️ Cushions category did not become visible within timeout, attempting to hover anyway');
    }
    
    // Scroll Cushions category into view if needed
    try {
      await this.cushionsCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Cushions category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Cushions category into view');
    }
    
    // Hover over the Cushions category to reveal sub-menu
    await this.cushionsCategory.hover();
    console.log('⏳ Hovered over "Cushions" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear
    
    // Wait for Square Seat Cushion to become visible in sub-menu
    try {
      await this.squareSeatCushion.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Square Seat Cushion visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Square Seat Cushion did not become visible, but attempting to click anyway');
    }
    
    // Scroll product into view
    try {
      await this.squareSeatCushion.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Square Seat Cushion into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Square Seat Cushion into view');
    }
    
    // Add small delay before clicking
    await this.page.waitForTimeout(500);
    
    // Click the product
    await this.squareSeatCushion.click();
    console.log('✅ Clicked Square Seat Cushion from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/cushion-p|seat-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Square Seat Cushion PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Cushions category in dropdown to reveal sub-menu, then click the Round Seat Cushion product */
  async navigateToRoundSeatCushionProduct() {
    // Ensure the Pillows menu is visible
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Initial Hover on Pillows menu
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(2000); // Wait for dropdown to appear

    // 2. Try to find the Cushions category, if not visible, perform jitter hover
    let isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
    console.log(`Cushions category visibility check (attempt 1): ${isCategoryVisible}`);

    if (!isCategoryVisible) {
      console.log('⚠️ Cushions category not visible, trying jitter hover...');
      const box = await this.pillowsMenu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.pillowsMenu.hover();
        await this.page.waitForTimeout(2000);
      }
      isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
      console.log(`Cushions category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Cushions category still not visible, trying force hover...');
      await this.pillowsMenu.hover({ force: true });
      await this.page.waitForTimeout(2000);
      isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
      console.log(`Cushions category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the Cushions category to be visible
    try {
      await this.cushionsCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Cushions" category found and visible');
    } catch (e) {
      console.log('⚠️ Cushions category did not become visible within timeout, attempting to hover anyway');
    }

    // Scroll Cushions category into view if needed
    try {
      await this.cushionsCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Cushions category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Cushions category into view');
    }

    // Hover over the Cushions category to reveal sub-menu
    await this.cushionsCategory.hover();
    console.log('⏳ Hovered over "Cushions" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear

    // Wait for Round Seat Cushion to become visible in sub-menu
    try {
      await this.roundSeatCushion.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Round Seat Cushion visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Round Seat Cushion did not become visible, but attempting to click anyway');
    }

    // Scroll product into view
    try {
      await this.roundSeatCushion.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Round Seat Cushion into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Round Seat Cushion into view');
    }

    // Add small delay before clicking
    await this.page.waitForTimeout(500);

    // Click the product
    await this.roundSeatCushion.click();
    console.log('✅ Clicked Round Seat Cushion from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/cushion-p|seat-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Round Seat Cushion PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Cushions category in dropdown to reveal sub-menu, then click the Rectangle Seat Cushion product */
  async navigateToRectangleSeatCushionProduct() {
    // Ensure the Pillows menu is visible
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Initial Hover on Pillows menu
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(2000); // Wait for dropdown to appear

    // 2. Try to find the Cushions category, if not visible, perform jitter hover
    let isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
    console.log(`Cushions category visibility check (attempt 1): ${isCategoryVisible}`);

    if (!isCategoryVisible) {
      console.log('⚠️ Cushions category not visible, trying jitter hover...');
      const box = await this.pillowsMenu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.pillowsMenu.hover();
        await this.page.waitForTimeout(2000);
      }
      isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
      console.log(`Cushions category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Cushions category still not visible, trying force hover...');
      await this.pillowsMenu.hover({ force: true });
      await this.page.waitForTimeout(2000);
      isCategoryVisible = await this.cushionsCategory.isVisible().catch(() => false);
      console.log(`Cushions category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the Cushions category to be visible
    try {
      await this.cushionsCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Cushions" category found and visible');
    } catch (e) {
      console.log('⚠️ Cushions category did not become visible within timeout, attempting to hover anyway');
    }

    // Scroll Cushions category into view if needed
    try {
      await this.cushionsCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Cushions category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Cushions category into view');
    }

    // Hover over the Cushions category to reveal sub-menu
    await this.cushionsCategory.hover();
    console.log('⏳ Hovered over "Cushions" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear

    // Wait for Rectangle Seat Cushion to become visible in sub-menu
    try {
      await this.rectangleSeatCushion.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Rectangle Seat Cushion visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Rectangle Seat Cushion did not become visible, but attempting to click anyway');
    }

    // Scroll product into view
    try {
      await this.rectangleSeatCushion.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Rectangle Seat Cushion into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Rectangle Seat Cushion into view');
    }

    // Add small delay before clicking
    await this.page.waitForTimeout(500);

    // Click the product
    await this.rectangleSeatCushion.click();
    console.log('✅ Clicked Rectangle Seat Cushion from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/cushion-p|seat-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Rectangle Seat Cushion PDP successfully');
  }

  /** Hover the Pillows menu to open dropdown, hover over Bed Pillows category to reveal sub-menu, then click the Bed Pillow product */
  async navigateToBedPillowProduct() {
    // Ensure the Pillows menu is visible
    await this.pillowsMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Pillows menu found');

    // 1. Initial Hover on Pillows menu
    await this.pillowsMenu.hover();
    console.log('⏳ Hovering over Pillows menu...');
    await this.page.waitForTimeout(2000); // Wait for dropdown to appear

    // 2. Try to find the Bed Pillows category, if not visible, perform jitter hover
    let isCategoryVisible = await this.bedPillowsCategory.isVisible().catch(() => false);
    console.log(`Bed Pillows category visibility check (attempt 1): ${isCategoryVisible}`);

    if (!isCategoryVisible) {
      console.log('⚠️ Bed Pillows category not visible, trying jitter hover...');
      const box = await this.pillowsMenu.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await this.pillowsMenu.hover();
        await this.page.waitForTimeout(2000);
      }
      isCategoryVisible = await this.bedPillowsCategory.isVisible().catch(() => false);
      console.log(`Bed Pillows category visibility check (attempt 2): ${isCategoryVisible}`);
    }

    // 3. Final attempt with force hover
    if (!isCategoryVisible) {
      console.log('⚠️ Bed Pillows category still not visible, trying force hover...');
      await this.pillowsMenu.hover({ force: true });
      await this.page.waitForTimeout(2000);
      isCategoryVisible = await this.bedPillowsCategory.isVisible().catch(() => false);
      console.log(`Bed Pillows category visibility check (attempt 3): ${isCategoryVisible}`);
    }

    // Wait for the Bed Pillows category to be visible
    try {
      await this.bedPillowsCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Bed Pillows" category found and visible');
    } catch (e) {
      console.log('⚠️ Bed Pillows category did not become visible within timeout, attempting to hover anyway');
    }

    // Scroll Bed Pillows category into view if needed
    try {
      await this.bedPillowsCategory.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Bed Pillows category into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Bed Pillows category into view');
    }

    // Hover over the Bed Pillows category to reveal sub-menu
    await this.bedPillowsCategory.hover();
    console.log('⏳ Hovered over "Bed Pillows" category');
    await this.page.waitForTimeout(2500); // Wait for sub-menu to appear

    // Wait for Bed Pillow product to become visible in sub-menu
    try {
      await this.bedPillow.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Bed Pillow visible in sub-menu');
    } catch (e) {
      console.log('⚠️ Bed Pillow did not become visible, but attempting to click anyway');
    }

    // Scroll product into view
    try {
      await this.bedPillow.scrollIntoViewIfNeeded();
      console.log('✅ Scrolled Bed Pillow into view');
    } catch (e) {
      console.log('⚠️ Could not scroll Bed Pillow into view');
    }

    // Add small delay before clicking
    await this.page.waitForTimeout(500);

    // Click the product
    await this.bedPillow.click();
    console.log('✅ Clicked Bed Pillow from sub-menu');

    // Confirm navigation to PDP
    await this.page.waitForURL(/bed-pillow-p|pillow-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Bed Pillow PDP successfully');
  }
}

module.exports = { HomePage };