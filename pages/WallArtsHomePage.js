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
      MountedCanvasPrint:page.getByRole('link', { name: 'Mounted Canvas Print', exact: false }).first(),
      FramedCanvasPrint:page.getByRole('link', { name: 'Framed Canvas Print', exact: false }).first(),
      GalleryWrappedCanvasPrint:page.getByText('Gallery Wraped Canvas Print', { exact: false }).first(),
      AcrylicPrintPremiumMetallic:page.getByRole('link', { name: 'Acrylic Print - Premium Metallic', exact: false }).first(),
      AcrylicPrintPremiumGlossy:page.locator(`span:has-text("Acrylic Print - Premium Gloss")`),
      CharcoalWoodFrame:page.getByRole('link', { name: 'Charcoal Wood Frame', exact: false }).first(),
      NaturalWoodFrame:page.getByRole('link', { name: 'Natural Wood Frame', exact: false }).first(),
//page.getByRole('link', { name: 'Drapes - Flat Panel', exact: false }).first(),

    };
  }

  /** Common navigation method for Wall Arts */
  async navigate(categoryName, productName, urlPattern = /-p($|\?)/i) {
    await this.smartMegaMenuNavigate({
      menu: this.menu,
      categoryName,
      productName,
      urlPattern
    });
  }

  /** Legacy wrappers for backward compatibility */
  async navigateToWallpaperTimberGrainProduct() { await this.navigate("Custom Wallpapers", "Wallpaper - Timber Grain"); }
  async navigateToWallpaperStoneGrainProduct() { await this.navigate("Custom Wallpapers", "Wallpaper - Stone Grain"); }
  async navigateToCustomWallpaperProduct() { await this.navigate("Custom Wallpapers", "Wallpaper - Luxe Smooth"); }
  async navigateToWallMuralLuxeSmoothProduct() { await this.navigate("Custom Wall Murals", "Wall Mural - Luxe Smooth"); }
  async navigateToWallMuralStoneGrainProduct() { await this.navigate("Custom Wall Murals", "Wall Mural - Stone Grain"); }
  async navigateToWallMuralTimberGrainProduct() { await this.navigate("Custom Wall Murals", "Wall Mural - Timber Grain"); }
  async navigateToPhotoPrintProduct() { await this.navigate("Photo And Art Prints", "Photo Print"); }
  async navigateToMountedPhotoPrintProduct() { await this.navigate("Photo And Art Prints", "Mounted Photo Print"); }
  async navigateToFramedPhotoPrint() { await this.navigate("Photo And Art Prints", "Framed Photo Print"); }
  async navigateToPosterPrint() { await this.navigate("Poster Prints", "Poster Print"); }
  async navigateToRolledCanvasPrintProduct() { await this.navigate("Canvas Prints", "Rolled Canvas Print"); }
  async navigateToMountedCanvasPrintProduct() { await this.navigate("Canvas Prints", "Mounted Canvas Print"); }
  async navigateToFramedCanvasPrint() { await this.navigate("Canvas Prints", "Framed Canvas Print"); }
  async navigateToGalleryWrappedCanvasPrint() { await this.navigate("Canvas Prints", "Gallery Wrapped Canvas Print"); }
  async navigateToAcrylicPrints() { await this.navigate("Acrylic Prints", "Acrylic Print - Premium Metallic"); }
  async navigateToAcrylicPrintPremiumGlossy() { await this.navigate("Acrylic Prints", "Acrylic Print - Premium Glossy"); }
  async navigateToCharcoalWoodFrameProduct() { await this.navigate("Hanging Canvas", "Charcoal Wood Frame"); }
  async navigateToNaturalWoodFrameProduct() { await this.navigate("Hanging Canvas", "Natural Wood Frame"); }
  async navigateToWoodFrameProduct() { await this.navigate("Hanging Canvas", "Wood Frame"); }
  async navigateToFloatingFrameProduct() { await this.navigate("Hanging Canvas", "Floating Frame"); }
}

module.exports = { WallArtsHomePage };
