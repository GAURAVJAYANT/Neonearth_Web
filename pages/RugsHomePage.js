const { HomePage } = require('./HomePage');

class RugsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // --- Rugs & Mats Menu Locator ---
    this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Rugs & Mats"))');

    // --- Rugs Category Locators ---
    this.categories = {
      HallwayRunners: page.getByText('Hallway Runners', { exact: true }),
      Doormats: page.getByText('Doormats', { exact: true }),
    };

    // --- Rugs Product Locators ---
    this.products = {
      rectangleRug: page.locator('span.product-text', { hasText: 'Rectangle Rug' }),
      squareRug: page.locator(`span:has-text("Square Rug")`),
      roundRug: page.locator(`span:has-text("Round Rug")`),
      ovalRug: page.locator(`span:has-text("Oval Rug")`),
      RunnerLuxeGrain: page.getByRole('link', { name: 'Runner - Luxe Grain', exact: false }).first(),
      runnerSilkenPlush: page.getByRole('link', { name: 'Runner - Silken Plush', exact: false }).first(),
      runnerNatureLoom: page.getByRole('link', { name: 'Runner - Nature Loom', exact: false }).first(),
      rectangleDoormat: page.getByRole('link', { name: 'Rectangle Doormat', exact: false }).first(),
      squareDoormat: page.getByRole('link', { name: 'Square Doormat', exact: false }).first(),
      roundDoormat: page.getByRole('link', { name: 'Round Doormat', exact: false }).first(),
      ovalDoormat: page.getByRole('link', { name: 'Oval Doormat', exact: false }).first(),
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

  /** Navigate to: Rugs & Mats → Hallway Runners → Runner - Silken Plush */
  async navigateToRunnerSilkenPlushProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HallwayRunners,
      product: this.products.runnerSilkenPlush,
      urlPattern: /runner-p|silken-plush-p/i,
      name: "Runner - Silken Plush"
    });
  }

  /** Navigate to: Rugs & Mats → Hallway Runners → Runner - Nature Loom */
  async navigateToRunnerNatureLoomProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HallwayRunners,
      product: this.products.runnerNatureLoom,
      urlPattern: /nature-loom-p/i,
      name: "Runner - Nature Loom"
    });
  }

  async navigateToRoundDoormatProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.Doormats,
      product: this.products.roundDoormat,
      urlPattern: /doormat-p/i,
      name: "Runner - Nature Loom"
    });
  }


  /** Navigate to: Rugs & Mats → Hallway Runners → Runner - Nature Loom */
  async navigateToSquareDoormatProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.Doormats,
      product: this.products.squareDoormat,
      urlPattern: /doormat-p/i,
      name: "Square Doormat"
    });
  }

  /** Navigate to: Rugs & Mats → Doormats → Oval Doormat */
  async navigateToOvalDoormatProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.Doormats,
      product: this.products.ovalDoormat,
      urlPattern: /doormat-p/i,
      name: "Oval Doormat"
    });
  }

  /** Navigate to: Rugs & Mats → Doormats → Rectangle Doormat */
  async navigateToRectangleDoormatProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.Doormats,
      product: this.products.rectangleDoormat,
      urlPattern: /doormat-p/i,
      name: "Rectangle Doormat"
    });
  }
}

module.exports = { RugsHomePage };
 