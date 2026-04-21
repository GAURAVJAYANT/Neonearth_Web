const { HomePage } = require('./HomePage');

class WallArtsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // --- Wall Arts Menu Locator ---
    this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Wall Arts"))');

    // --- Wall Arts Category Locators ---
    this.categories = {
      CustomWallpapers: page.getByText('Custom Wallpapers', { exact: true }),
      
    };

    // --- Wall Arts Product Locators ---
    this.products = {
      customWallpaper: page.getByRole('link', { name: 'Wallpaper - Luxe Smooth', exact: false }).first(),
      
    };
  }

  

  /** Navigate to: Rugs & Mats → Square Rug */
  async navigateToCustomWallpaperProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.customWallpaper,
      urlPattern: /custom-wallpaper-p/i,
      name: "Custom Wallpaper"
    });
  }
}

module.exports = { WallArtsHomePage };
