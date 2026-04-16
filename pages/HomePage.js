const { expect } = require('@playwright/test');
const { SmartPage } = require('./SmartPage');

class HomePage extends SmartPage {
  constructor(page) {
    super(page);
    
    // Systematic Configuration
    this.CONFIG = {
      WAIT_INITIAL: 5000,
      WAIT_JITTER: 5000,
      WAIT_SUBMENU: 2500,
      WAIT_PDP_LOAD: 30000,
      RETRIES: 2,
      TIMEOUT_VISIBLE: 15000
    };

    // --- Locators: Main Menus ---
    this.menus = {
      tapestries: page.locator('nav.header-navigation-bar li.top-level-item span.label-text', { hasText: 'Tapestries' }),
      rugs: page.locator('nav.header-navigation-bar li.top-level-item span.label-text', { hasText: 'Rugs & Mats' }),
      pillows: page.locator('nav.header-navigation-bar li.top-level-item span.label-text', { hasText: 'Pillows' })
    };

    // --- Locators: Categories ---
    this.categories = {
      panoramic: page.locator('span:has-text("Custom Panoramic Tapestries")'),
      triangular: page.locator('span:has-text("Custom Triangular Tapestries")'),
      hanging: page.locator('span:has-text("Custom Hanging Tapestries")'),
      throwPillows: page.getByRole('link', { name: /^Throw Pillows$/ }).first(),
      cushions: page.locator('a[href="/cushions"]').first(),
      bedPillows: page.locator('a[href*="/bed-pillows"]').first()
    };

    // --- Locators: Products ---
    this.products = {
      tapestryVelvet: page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' }),
      tapestryWeave: page.getByText('Custom Wall Tapestry - Weave Loom', { exact: true }),
      panoramicVelvet: page.locator("//span[normalize-space()='Custom Panoramic Tapestry - Velvet Satin']"),
      panoramicWeave: page.locator("//span[normalize-space()='Custom Panoramic Tapestry - Weave Loom']"),
      triangularVelvet: page.locator("//span[normalize-space()='Custom Triangular Tapestry - Velvet Satin']"),
      triangularWeave: page.locator("//span[normalize-space()='Custom Triangular Tapestry - Weave Loom']"),
      hangingVelvet: page.locator("//span[normalize-space()='Custom Hanging Tapestry - Velvet Satin']"),
      hangingWeave: page.locator("//span[normalize-space()='Custom Hanging Tapestry - Weave Loom']"),
      rectangleRug: page.locator('span.product-text', { hasText: 'Rectangle Rug' }),
      squareThrowPillow: page.getByRole('link', { name: 'Custom Square Throw Pillow' }).first(),
      rectangleThrowPillow: page.getByRole('link', { name: 'Custom Rectangle Throw Pillow' }).first(),
      roundThrowPillow: page.getByRole('link', { name: 'Custom Round Throw Pillow' }).first(),
      squareSeatCushion: page.locator('a[href*="square-seat"]').first(),
      roundSeatCushion: page.locator('a[href*="round-seat"]').first(),
      rectangleSeatCushion: page.locator('a[href*="rectangle-seat"]').first(),
      bedPillow: page.getByText('Bed Pillow', { exact: true })
    };

    // --- Deprecated Locators (for backwards compatibility if any strings are used) ---
    this.menu = this.menus.tapestries;
    this.product = this.products.tapestryVelvet;
    this.rugsMenu = this.menus.rugs;
    this.rectangleRugProduct = this.products.rectangleRug;
    this.panoramicTapestryCategory = this.categories.panoramic;
    this.panoramicTapestryProduct = this.products.panoramicVelvet;
    this.panoramicWeaveLoomProduct = this.products.panoramicWeave;
    this.triangularTapestryCategory = this.categories.triangular;
    this.triangularTapestryProduct = this.products.triangularVelvet;
    this.triangularWeaveLoomProduct = this.products.triangularWeave;
    this.hangingTapestryCategory = this.categories.hanging;
    this.hangingTapestryProduct = this.products.hangingVelvet;
    this.hangingWeaveLoomProduct = this.products.hangingWeave;
    this.weaveLoomProduct = this.products.tapestryWeave;
    this.pillowsMenu = this.menus.pillows;
    this.throwPillowsCategory = this.categories.throwPillows;
    this.customSquareThrowPillow = this.products.squareThrowPillow;
    this.customRectangleThrowPillow = this.products.rectangleThrowPillow;
    this.customRoundThrowPillow = this.products.roundThrowPillow;
    this.cushionsCategory = this.categories.cushions;
    this.squareSeatCushion = this.products.squareSeatCushion;
    this.roundSeatCushion = this.products.roundSeatCushion;
    this.rectangleSeatCushion = this.products.rectangleSeatCushion;
    this.bedPillowsCategory = this.categories.bedPillows;
    this.bedPillow = this.products.bedPillow;
  }

  async open() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Systematic Navigation Engine
   * @private
   */
  async _navigate({ menu, category = null, product, urlPattern, name }) {
    console.log(`🚀 Starting navigation to: ${name}`);
    
    // 1. Ensure Main Menu is visible
    await menu.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
    
    // 2. Target Visibility Loop
    // We try multiple times to hover until the target (category or product) is visible
    const target = category || product;
    let isTargetReady = false;
    
    for (let i = 0; i < this.CONFIG.RETRIES; i++) {
        console.log(`⏳ Attempt ${i+1}: Hovering over menu for ${name}...`);
        await menu.hover();
        
        // Wait for target to appear - we use a shorter localized timeout for the loop
        try {
            await target.waitFor({ state: 'visible', timeout: 5000 });
            isTargetReady = true;
            break;
        } catch (e) {
            console.log(`⚠️ ${name} target not visible yet, trying jitter hover...`);
            const box = await menu.boundingBox();
            if (box) {
                // Jitter: Move slightly away and back
                await this.page.mouse.move(box.x - 30, box.y + box.height / 2);
                await this.page.waitForTimeout(500);
                await menu.hover();
            }
            // Wait for stability after jitter
            await this.page.waitForTimeout(this.CONFIG.WAIT_JITTER);
            isTargetReady = await target.isVisible();
            if (isTargetReady) break;
        }
    }

    if (!isTargetReady) {
        // One final force hover if still not visible
        console.log(`🚨 Final Attempt: Force hovering...`);
        await menu.hover({ force: true });
        await this.page.waitForTimeout(this.CONFIG.WAIT_INITIAL);
    }

    // 3. Handle Sub-Category (if present)
    if (category) {
      await category.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
      await category.scrollIntoViewIfNeeded();
      await category.hover();
      console.log(`⏳ Hovered over intermediate category: ${name}`);
      // Wait for product to appear after category hover
      try {
          await product.waitFor({ state: 'visible', timeout: 5000 });
      } catch (e) {
          console.log(`⚠️ Product not visible after category hover, retrying category hover...`);
          await category.hover();
          await this.page.waitForTimeout(2000);
      }
    }

    // 4. Final Product Selection
    await product.waitFor({ state: 'visible', timeout: this.CONFIG.TIMEOUT_VISIBLE });
    await product.scrollIntoViewIfNeeded();
    
    // Safety delay to ensure the menu isn't still animating
    await this.page.waitForTimeout(1000); 
    
    await product.click();
    console.log(`✅ Clicked product for: ${name}`);

    // 5. URL Verification
    if (urlPattern) {
      await this.page.waitForURL(urlPattern, { timeout: this.CONFIG.WAIT_PDP_LOAD });
      console.log(`✨ Successfully navigated to ${name} PDP`);
    }
  }

  /** Hover the Tapestries menu cleanly, wait for dropdown, then click the Velvet Satin product */
  /** Hover the Tapestries menu cleanly, wait for dropdown, then click the Velvet Satin product */
  async navigateToProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      product: this.products.tapestryVelvet,
      urlPattern: /custom-wall-tapestry-p/i,
      name: "Tapestry - Velvet Satin"
    });
  }

  /** Hover the Rugs & Mats menu cleanly, wait for dropdown, then click the Rectangle Rug product */
  async navigateToRugsProduct() {
    await this._navigate({
      menu: this.menus.rugs,
      product: this.products.rectangleRug,
      urlPattern: /rug-p/i,
      name: "Rectangle Rug"
    });
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Panoramic Tapestries category to reveal sub-menu, then click the Velvet Satin product */
  async navigateToPanoramicTapestryProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      category: this.categories.panoramic,
      product: this.products.panoramicVelvet,
      urlPattern: /panoramic-tapestry-p|tapestry-p/i,
      name: "Panoramic Tapestry - Velvet Satin"
    });
  }

  /** Hover the Tapestries menu to open dropdown, then click the Custom Wall Tapestry - Weave Loom product */
  async navigateToWeaveLoomProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      product: this.products.tapestryWeave,
      urlPattern: /weave-loom-p|tapestry-p/i,
      name: "Tapestry - Weave Loom"
    });
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Panoramic Tapestries category to reveal sub-menu, then click the Weave Loom product */
  async navigateToPanoramicWeaveLoomProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      category: this.categories.panoramic,
      product: this.products.panoramicWeave,
      urlPattern: /panoramic-tapestry-p|weave-loom-p|tapestry-p/i,
      name: "Panoramic Tapestry - Weave Loom"
    });
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Triangular Tapestries category to reveal sub-menu, then click the Velvet Satin product */
  async navigateToTriangularTapestryProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      category: this.categories.triangular,
      product: this.products.triangularVelvet,
      urlPattern: /triangular-tapestry-p|tapestry-p/i,
      name: "Triangular Tapestry - Velvet Satin"
    });
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Triangular Tapestries category to reveal sub-menu, then click the Weave Loom product */
  async navigateToTriangularWeaveLoomProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      category: this.categories.triangular,
      product: this.products.triangularWeave,
      urlPattern: /triangular-tapestry-p|weave-loom-p|tapestry-p/i,
      name: "Triangular Tapestry - Weave Loom"
    });
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Hanging Tapestries category to reveal sub-menu, then click the Velvet Satin product */
  async navigateToHangingTapestryProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      category: this.categories.hanging,
      product: this.products.hangingVelvet,
      urlPattern: /hanging-tapestry-p|tapestry-p/i,
      name: "Hanging Tapestry - Velvet Satin"
    });
  }

  /** Hover the Tapestries menu to open dropdown, hover over Custom Hanging Tapestries category to reveal sub-menu, then click the Weave Loom product */
  async navigateToHangingWeaveLoomProduct() {
    await this._navigate({
      menu: this.menus.tapestries,
      category: this.categories.hanging,
      product: this.products.hangingWeave,
      urlPattern: /hanging-tapestry-p|weave-loom-p|tapestry-p/i,
      name: "Hanging Tapestry - Weave Loom"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Throw Pillows category to reveal sub-menu, then click the Custom Square Throw Pillow product */
  async navigateToPillowProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.throwPillows,
      product: this.products.squareThrowPillow,
      urlPattern: /throw-pillow-p|pillow-p/i,
      name: "Square Throw Pillow"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Throw Pillows category to reveal sub-menu, then click the Custom Rectangle Throw Pillow product */
  async navigateToRectangleThrowPillowProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.throwPillows,
      product: this.products.rectangleThrowPillow,
      urlPattern: /throw-pillow-p|pillow-p/i,
      name: "Rectangle Throw Pillow"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Throw Pillows category to reveal sub-menu, then click the Custom Round Throw Pillow product */
  async navigateToRoundThrowPillowProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.throwPillows,
      product: this.products.roundThrowPillow,
      urlPattern: /throw-pillow-p|pillow-p/i,
      name: "Round Throw Pillow"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Cushions category in dropdown to reveal sub-menu, then click the Square Seat Cushion product */
  async navigateToSquareSeatCushionProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.cushions,
      product: this.products.squareSeatCushion,
      urlPattern: /cushion-p|seat-p/i,
      name: "Square Seat Cushion"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Cushions category in dropdown to reveal sub-menu, then click the Round Seat Cushion product */
  async navigateToRoundSeatCushionProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.cushions,
      product: this.products.roundSeatCushion,
      urlPattern: /cushion-p|seat-p/i,
      name: "Round Seat Cushion"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Cushions category in dropdown to reveal sub-menu, then click the Rectangle Seat Cushion product */
  async navigateToRectangleSeatCushionProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.cushions,
      product: this.products.rectangleSeatCushion,
      urlPattern: /cushion-p|seat-p/i,
      name: "Rectangle Seat Cushion"
    });
  }

  /** Hover the Pillows menu to open dropdown, hover over Bed Pillows category to reveal sub-menu, then click the Bed Pillow product */
  async navigateToBedPillowProduct() {
    await this._navigate({
      menu: this.menus.pillows,
      category: this.categories.bedPillows,
      product: this.products.bedPillow,
      urlPattern: /bed-pillow-p|pillow-p/i,
      name: "Bed Pillow"
    });
  }
}

module.exports = { HomePage };