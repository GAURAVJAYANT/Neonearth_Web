const { HomePage } = require('./HomePage');
class TapestryHomePage extends HomePage {
  constructor(page) {
    super(page);
 
    // --- Tapestry Menu Locator ---
    this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Tapestries"))');
 
    // --- Tapestry Category Locators ---
    this.categories = {
      panoramic: page.getByRole('link', { name: 'Custom Panoramic Tapestries', exact: false }).first(),
      triangular: page.getByRole('link', { name: 'Custom Triangular Tapestries', exact: false }).first(),
      hanging: page.getByRole('link', { name: 'Custom Hanging Tapestries', exact: false }).first(),
    };
 
    // --- Tapestry Product Locators ---
    this.products = {
      tapestryVelvet: page.getByRole('link', { name: 'Wall Tapestry - Velvet Satin', exact: false }).first(),
      tapestryWeave: page.getByRole('link', { name: 'Wall Tapestry - Weave Loom', exact: false }).first(),
      panoramicVelvet: page.getByRole('link', { name: 'Panoramic Tapestry - Velvet Satin', exact: false }).first(),
      panoramicWeave: page.getByRole('link', { name: 'Panoramic Tapestry - Weave Loom', exact: false }).first(),
      triangularVelvet: page.getByRole('link', { name: 'Triangular Tapestry - Velvet Satin', exact: false }).first(),
      triangularWeave: page.getByRole('link', { name: 'Triangular Tapestry - Weave Loom', exact: false }).first(),
      hangingVelvet: page.getByRole('link', { name: 'Hanging Tapestry - Velvet Satin', exact: false }).first(),
      hangingWeave: page.getByRole('link', { name: 'Hanging Tapestry - Weave Loom', exact: false }).first(),
    };
  }
 
  /** Navigate to: Tapestries → Wall Tapestry - Velvet Satin */
  async navigateToProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.tapestryVelvet,
      urlPattern: /custom-wall-tapestry-p/i,
      name: "Tapestry - Velvet Satin"
    });
  }
 
  /** Navigate to: Tapestries → Wall Tapestry - Weave Loom */
  async navigateToWeaveLoomProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.tapestryWeave,
      urlPattern: /weave-loom-p|tapestry-p/i,
      name: "Tapestry - Weave Loom"
    });
  }
 
  /** Navigate to: Tapestries → Custom Panoramic Tapestries → Velvet Satin */
  async navigateToPanoramicTapestryProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.panoramic,
      product: this.products.panoramicVelvet,
      urlPattern: /panoramic-tapestry-p|tapestry-p/i,
      name: "Panoramic Tapestry - Velvet Satin"
    });
  }
 
  /** Navigate to: Tapestries → Custom Panoramic Tapestries → Weave Loom */
  async navigateToPanoramicWeaveLoomProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.panoramic,
      product: this.products.panoramicWeave,
      urlPattern: /panoramic-tapestry-p|weave-loom-p|tapestry-p/i,
      name: "Panoramic Tapestry - Weave Loom"
    });
  }
 
  /** Navigate to: Tapestries → Custom Triangular Tapestries → Velvet Satin */
  async navigateToTriangularTapestryProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.triangular,
      product: this.products.triangularVelvet,
      urlPattern: /triangular-tapestry-p|tapestry-p/i,
      name: "Triangular Tapestry - Velvet Satin"
    });
  }
 
  /** Navigate to: Tapestries → Custom Triangular Tapestries → Weave Loom */
  async navigateToTriangularWeaveLoomProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.triangular,
      product: this.products.triangularWeave,
      urlPattern: /triangular-tapestry-p|weave-loom-p|tapestry-p/i,
      name: "Triangular Tapestry - Weave Loom"
    });
  }
 
  /** Navigate to: Tapestries → Custom Hanging Tapestries → Velvet Satin */
  async navigateToHangingTapestryProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.hanging,
      product: this.products.hangingVelvet,
      urlPattern: /hanging-tapestry-p|tapestry-p/i,
      name: "Hanging Tapestry - Velvet Satin"
    });
  }
 
  /** Navigate to: Tapestries → Custom Hanging Tapestries → Weave Loom */
  async navigateToHangingWeaveLoomProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.hanging,
      product: this.products.hangingWeave,
      urlPattern: /hanging-tapestry-p|weave-loom-p|tapestry-p/i,
      name: "Hanging Tapestry - Weave Loom"
    });
  }
}
 
module.exports = { TapestryHomePage };