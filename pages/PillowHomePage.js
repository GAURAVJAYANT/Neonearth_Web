const { HomePage } = require('./HomePage');

/**
 * PillowHomePage — owns all Pillow locators and navigation methods.
 * Extends the shared HomePage base (CONFIG, open(), _navigate() engine).
 *
 * Usage in tests:
 *   const { PillowHomePage } = require('../pages/PillowHomePage');
 *   const homePage = new PillowHomePage(page);
 *   await homePage.navigateToPillowProduct();
 */
class PillowHomePage extends HomePage {
  constructor(page) {
    super(page);

    // --- Pillow Menu Locator ---
    this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Pillows"))');

    // --- Pillow Category Locators ---
    this.categories = {
      throwPillows: page.getByRole('link', { name: /^Throw Pillows$/ }).first(),
      cushions: page.locator('a[href="/cushions"]').first(),
      bedPillows: page.locator('a[href*="/bed-pillows"]').first(),
    };

    // --- Pillow Product Locators ---
    this.products = {
      squareThrowPillow: page.getByRole('link', { name: 'Custom Square Throw Pillow' }).first(),
      rectangleThrowPillow: page.getByRole('link', { name: 'Custom Rectangle Throw Pillow' }).first(),
      roundThrowPillow: page.getByRole('link', { name: 'Custom Round Throw Pillow' }).first(),
      squareSeatCushion: page.locator('a[href*="square-seat"]').first(),
      roundSeatCushion: page.locator('a[href*="round-seat"]').first(),
      rectangleSeatCushion: page.locator('a[href*="rectangle-seat"]').first(),
      bedPillow: page.getByText('Bed Pillow', { exact: true }),
    };
  }

  /** Navigate to: Pillows → Throw Pillows → Custom Square Throw Pillow */
  async navigateToPillowProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.throwPillows,
      product: this.products.squareThrowPillow,
      urlPattern: /throw-pillow-p|pillow-p/i,
      name: "Square Throw Pillow"
    });
  }

  /** Navigate to: Pillows → Throw Pillows → Custom Rectangle Throw Pillow */
  async navigateToRectangleThrowPillowProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.throwPillows,
      product: this.products.rectangleThrowPillow,
      urlPattern: /throw-pillow-p|pillow-p/i,
      name: "Rectangle Throw Pillow"
    });
  }

  /** Navigate to: Pillows → Throw Pillows → Custom Round Throw Pillow */
  async navigateToRoundThrowPillowProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.throwPillows,
      product: this.products.roundThrowPillow,
      urlPattern: /throw-pillow-p|pillow-p/i,
      name: "Round Throw Pillow"
    });
  }

  /** Navigate to: Pillows → Cushions → Square Seat Cushion */
  async navigateToSquareSeatCushionProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.cushions,
      product: this.products.squareSeatCushion,
      urlPattern: /cushion-p|seat-p/i,
      name: "Square Seat Cushion"
    });
  }

  /** Navigate to: Pillows → Cushions → Round Seat Cushion */
  async navigateToRoundSeatCushionProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.cushions,
      product: this.products.roundSeatCushion,
      urlPattern: /cushion-p|seat-p/i,
      name: "Round Seat Cushion"
    });
  }

  /** Navigate to: Pillows → Cushions → Rectangle Seat Cushion */
  async navigateToRectangleSeatCushionProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.cushions,
      product: this.products.rectangleSeatCushion,
      urlPattern: /cushion-p|seat-p/i,
      name: "Rectangle Seat Cushion"
    });
  }

  /** Navigate to: Pillows → Bed Pillows → Bed Pillow */
  async navigateToBedPillowProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.bedPillows,
      product: this.products.bedPillow,
      urlPattern: /bed-pillow-p|pillow-p/i,
      name: "Bed Pillow"
    });
  }
}

module.exports = { PillowHomePage };
