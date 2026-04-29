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

  /** Common navigation method for Pillows */
  async navigate(categoryName, productName, urlPattern = /pillow-p|cushion-p|seat-p/i) {
    await this.smartMegaMenuNavigate({
      menu: this.menu,
      categoryName,
      productName,
      urlPattern
    });
  }

  /** Legacy wrappers for backward compatibility */
  async navigateToPillowProduct() { await this.navigate("Throw Pillows", "Custom Square Throw Pillow"); }
  async navigateToRectangleThrowPillowProduct() { await this.navigate("Throw Pillows", "Custom Rectangle Throw Pillow"); }
  async navigateToRoundThrowPillowProduct() { await this.navigate("Throw Pillows", "Custom Round Throw Pillow"); }
  async navigateToSquareSeatCushionProduct() { await this.navigate("Cushions", "Square Seat Cushion"); }
  async navigateToRoundSeatCushionProduct() { await this.navigate("Cushions", "Round Seat Cushion"); }
  async navigateToRectangleSeatCushionProduct() { await this.navigate("Cushions", "Rectangle Seat Cushion"); }
  async navigateToBedPillowProduct() { await this.navigate("Bed Pillows", "Bed Pillow"); }
}

module.exports = { PillowHomePage };
