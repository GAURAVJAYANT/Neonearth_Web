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

  /** Common navigation method for Rugs */
  async navigate(categoryName, productName, urlPattern = /rug-p|doormat-p|runner-p/i) {
    await this.smartMegaMenuNavigate({
      menu: this.menu,
      categoryName,
      productName,
      urlPattern
    });
  }

  /** Legacy wrappers for backward compatibility if needed */
  async navigateToRugsProduct() { await this.navigate(null, "Rectangle Rug"); }
  async navigateToSquareRugProduct() { await this.navigate(null, "Square Rug"); }
  async navigateToRoundRugProduct() { await this.navigate(null, "Round Rug"); }
  async navigateToOvalRugProduct() { await this.navigate(null, "Oval Rug"); }
  async navigateToRunnerSilkenPlushProduct() { await this.navigate("Hallway Runners", "Runner - Silken Plush"); }
  async navigateToRunnerNatureLoomProduct() { await this.navigate("Hallway Runners", "Runner - Nature Loom"); }
  async navigateToRoundDoormatProduct() { await this.navigate("Doormats", "Round Doormat"); }
  async navigateToSquareDoormatProduct() { await this.navigate("Doormats", "Square Doormat"); }
  async navigateToOvalDoormatProduct() { await this.navigate("Doormats", "Oval Doormat"); }
  async navigateToRectangleDoormatProduct() { await this.navigate("Doormats", "Rectangle Doormat"); }
}

module.exports = { RugsHomePage };
