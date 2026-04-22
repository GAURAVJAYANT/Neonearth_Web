const { HomePage } = require('./HomePage');

class WallArtsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // --- Wall Arts Menu Locator ---
    this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Wall Arts"))');

    // --- Wall Arts Category Locators ---
    this.categories = {
      CustomWallpapers: page.getByText('Custom Wallpapers', { exact: true }),
      CustomWallMurals: page.locator('a[title="View Custom Wall Murals"]'),
    };

    // --- Wall Arts Product Locators ---
    this.products = {
      customWallpaper: page.getByRole('link', { name: 'Wallpaper - Luxe Smooth', exact: false }).first(),
      wallpaperStoneGrain: page.getByRole('link', { name: 'Wallpaper - Stone Grain', exact: false }).first(),
      wallpaperTimberGrain: page.getByRole('link', { name: 'Wallpaper - Timber Grain', exact: false }).first(),
      //wallMuralLuxeSmooth: page.locator('a[href*="luxe_smooth"]').first(),
      WallMuralStoneGrain: page.getByRole('link', { name: 'Wall Mural - Stone Grain', exact: false }).first(), 
      WallMuralTimberGrain: page.getByRole('link', { name: 'Wall Mural - Timber Grain', exact: false }).first(),     
    };
  }

  /** Navigate to: Wall Arts → Custom Wallpaper */
  async navigateToWallpaperTimberGrainProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.wallpaperTimberGrain,
      urlPattern: /custom-wallpaper-p/i,
      name: "Wallpaper Timber Grain"
    });
  }



  /** Navigate to: Wall Arts → Custom Wallpaper */
  async navigateToWallpaperStoneGrainProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.wallpaperStoneGrain,
      urlPattern: /custom-wallpaper-p/i,
      name: "Wallpaper Stone Grain"
    });

    
  }
  

  /** Navigate to: Wall Arts → Custom Wallpaper */
  async navigateToCustomWallpaperProduct() {
    await this._navigate({
      menu: this.menu,
      product: this.products.customWallpaper,
      urlPattern: /custom-wallpaper-p/i,
      name: "Custom Wallpaper"
    });
    
  }
  /** Navigate to: Wall Arts → Custom Wallpaper */
  async navigateToWallMuralLuxeSmoothProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CustomWallMurals,
      product: this.products.wallMuralLuxeSmooth,
      urlPattern: /custom-wall-mural-p/i,
      name: "Wall Mural - Luxe Smooth"
    });
  }

  /** Navigate to: Wall Arts → Custom Wallpaper */
  async navigateToWallMuralStoneGrainProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CustomWallMurals,
      product: this.products.WallMuralStoneGrain  ,
      urlPattern: /custom-wall-mural-p/i,
      name: "Wall Mural - Stone Grain"
    });
  }

  /** Navigate to: Wall Arts → Custom Wallpaper */
  async navigateToWallMuralTimberGrainProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CustomWallMurals,
      product: this.products.WallMuralTimberGrain  ,
      urlPattern: /custom-wall-mural-p/i,
      name: "Wall Mural - Timber Grain"
    });
  }
}

module.exports = { WallArtsHomePage };
