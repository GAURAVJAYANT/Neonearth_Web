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
      PhotoAndArtPrints: page.locator('a[title="View Photo And Art Prints"]'),
      PosterPrints: page.locator('a[title="View Poster Prints"]'),
      CanvasPrints: page.locator(`span:has-text("Canvas Prints")`),
      AcrylicPrints: page.locator('a[title="View Acrylic Prints"]'),
      HangingCanvas: page.locator('span:has-text("Hanging Canvas")'),
      WoodFrame: page.locator('a[title="View Wood Frame"]'),
      FloatingFrame: page.locator('a[title="View Floating Frame"]'),
      //RolledCanvasPrint: page.locator('a[title="View Rolled Canvas Prints"]'),
      //StretchedCanvasPrint: page.locator('a[title="View Stretched Canvas Prints"]'),
      
    };

    // --- Wall Arts Product Locators ---
    this.products = {
      customWallpaper: page.getByRole('link', { name: 'Wallpaper - Luxe Smooth', exact: false }).first(),
      wallpaperStoneGrain: page.getByRole('link', { name: 'Wallpaper - Stone Grain', exact: false }).first(),
      wallpaperTimberGrain: page.getByRole('link', { name: 'Wallpaper - Timber Grain', exact: false }).first(),
      //wallMuralLuxeSmooth: page.locator('a[href*="luxe_smooth"]').first(),
      WallMuralStoneGrain: page.getByRole('link', { name: 'Wall Mural - Stone Grain', exact: false }).first(), 
      WallMuralTimberGrain: page.getByRole('link', { name: 'Wall Mural - Timber Grain', exact: false }).first(), 
      PhotoPrint:page.getByRole('link', { name: 'Photo Print', exact: false }).first(),
      MountedPhotoPrint:page.getByRole('link', { name: 'Mounted Photo Print', exact: false }).first(),
      FramedPhotoPrint:page.getByRole('link', { name: 'Framed Photo Print', exact: false }).first(),
      PosterPrint:page.locator('.mega-menu-middle-col').getByRole('link', { name: 'Poster Print' }).first(),
      RolledCanvasPrint:page.getByRole('link', { name: 'Rolled Canvas Print', exact: false }).first(),
<<<<<<< HEAD
      MountedCanvasPrint:page.getByRole('link', { name: 'Mounted Canvas Print', exact: false }).first(),
      FramedCanvasPrint:page.getByRole('link', { name: 'Framed Canvas Print', exact: false }).first(),
      GalleryWrappedCanvasPrint:page.getByText('Gallery Wraped Canvas Print', { exact: false }).first(),
      AcrylicPrintPremiumMetallic:page.getByRole('link', { name: 'Acrylic Print - Premium Metallic', exact: false }).first(),
      AcrylicPrintPremiumGlossy:page.locator(`span:has-text("Acrylic Print - Premium Gloss")`),
      //
=======
      CharcoalWoodFrame:page.getByRole('link', { name: 'Charcoal Wood Frame', exact: false }).first(),
      NaturalWoodFrame:page.getByRole('link', { name: 'Natural Wood Frame', exact: false }).first(),
>>>>>>> main


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

async navigateToPhotoPrintProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.PhotoAndArtPrints,
      product: this.products.PhotoPrint  ,
      urlPattern: /photo-print-p/i,
      name: "Photo Print"
    });
  }

  async navigateToMountedPhotoPrintProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.PhotoAndArtPrints,
      product: this.products.MountedPhotoPrint  ,
      urlPattern: /photo-print-p/i,
      name: "Mounted Photo Print"
    });
  }

  async navigateToFramedPhotoPrint() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.PhotoAndArtPrints,
      product: this.products.FramedPhotoPrint  ,
      urlPattern: /photo-print-p/i,
      name: "Framed Photo Print"
    });
  }

  async navigateToPosterPrint() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.PosterPrints,
      product: this.products.PosterPrint  ,
     // urlPattern: /poster-print-p/i,
      name: "Poster Print"
    });
  }

  async navigateToRolledCanvasPrintProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CanvasPrints,
      product: this.products.RolledCanvasPrint  ,
     // urlPattern: /poster-print-p/i,
      name: "Rolled Canvas Print"
    });
  }

  async navigateToMountedCanvasPrintProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CanvasPrints,
      product: this.products.MountedCanvasPrint  ,
     // urlPattern: /poster-print-p/i,
      name: "Mounted Canvas Print"
    });
  }

  async navigateToFramedCanvasPrint() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CanvasPrints,
      product: this.products.FramedCanvasPrint  ,
     // urlPattern: /poster-print-p/i,
      name: "Framed Canvas Print"
    });
  }

  async navigateToGalleryWrappedCanvasPrint() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.CanvasPrints,
      product: this.products.GalleryWrappedCanvasPrint  ,
     // urlPattern: /poster-print-p/i,
      name: "Gallery Wrapped Canvas Print"
    });
  }

  async navigateToAcrylicPrints() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.AcrylicPrints,
      product: this.products.AcrylicPrintPremiumMetallic,
     // urlPattern: /poster-print-p/i,
      name: "Acrylic Print - Premium Metallic"
    });
  }

  async navigateToAcrylicPrintPremiumGlossy() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.AcrylicPrints,
      product: this.products.AcrylicPrintPremiumGlossy,
     // urlPattern: /poster-print-p/i,
      name: "Acrylic Print - Premium Glossy"
    });
  }

  async navigateToCharcoalWoodFrameProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HangingCanvas,
      product: this.products.CharcoalWoodFrame  ,
     // urlPattern: /poster-print-p/i,
      name: "Charcoal Wood Frame"
    });
  }

  async navigateToNaturalWoodFrameProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HangingCanvas,
      product: this.products.NaturalWoodFrame,
     // urlPattern: /poster-print-p/i,
      name: "Natural Wood Frame"
    });
  }

  async navigateToWoodFrameProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HangingCanvas,
      product: this.products.WoodFrame,
     // urlPattern: /poster-print-p/i,
      name: "Wood Frame"
    });
  }

  async navigateToFloatingFrameProduct() {
    await this._navigate({
      menu: this.menu,
      category: this.categories.HangingCanvas,
      product: this.products.FloatingFrame,
     // urlPattern: /poster-print-p/i,
      name: "Floating Frame"


}

module.exports = { WallArtsHomePage };
