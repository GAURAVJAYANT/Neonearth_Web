const { HomePage } = require('./HomePage');

/**
 * RugsHomePage — owns all Rugs & Mats locators and navigation methods.
 * Extends the shared HomePage base (CONFIG, open(), _navigate() engine).
 *
 * Usage in tests:
 *   const { RugsHomePage } = require('../pages/RugsHomePage');
 *   const homePage = new RugsHomePage(page);
 *   await homePage.navigateToRugsProduct();
 */
class RugsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // --- Rugs & Mats Menu Locator ---
    this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Rugs & Mats"))');

    // --- Rugs Category Locators ---
    this.categories = {
      HallwayRunners: page.getByText('Hallway Runners', { exact: true }),
    };

    // --- Rugs Product Locators ---
    this.products = {
      rectangleRug: page.locator('span.product-text', { hasText: 'Rectangle Rug' }),
      squareRug: page.locator(`span:has-text("Square Rug")`),
      roundRug: page.locator(`span:has-text("Round Rug")`),
      ovalRug: page.locator(`span:has-text("Oval Rug")`),
      RunnerLuxeGrain: page.getByRole('link', { name: 'Runner - Luxe Grain', exact: false }).first(),
    };
  }

  /** Navigate to: Rugs & Mats → Rectangle Rug */
  async navigateToRugsProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.rectangleRug,
      urlPattern: /rug-p/i,
      name: "Rectangle Rug"
    });
  }

  /** Navigate to: Rugs & Mats → Square Rug */
  async navigateToSquareRugProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.squareRug,
      urlPattern: /rug-p/i,
      name: "Square Rug"
    });
  }

  /** Navigate to: Rugs & Mats → Round Rug */
  async navigateToRoundRugProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.roundRug,
      urlPattern: /rug-p/i,
      name: "Round Rug"
    });
  }

  /** Navigate to: Rugs & Mats → Oval Rug */
  async navigateToOvalRugProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.ovalRug,
      urlPattern: /rug-p/i,
      name: "Oval Rug"
    });
  }

  /** Navigate to: Rugs & Mats → Hallway Runners → Runner - Luxe Grain */
  async navigateToHallwayRunnersProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HallwayRunners,
      product: this.products.RunnerLuxeGrain,
      urlPattern: /runner-p|hallway-runners-p|rugs-p/i,
      name: "Hallway Runners"
    });
  }
}

module.exports = { RugsHomePage };
