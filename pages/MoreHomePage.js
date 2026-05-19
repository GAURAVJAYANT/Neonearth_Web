// const { HomePage } = require('./HomePage');

// /**
//  * TapestryHomePage — owns all Tapestry locators and navigation methods.
//  * Extends the shared HomePage base (CONFIG, open(), _navigate() engine).
//  *
//  * Usage in tests:
//  *   const { TapestryHomePage } = require('../pages/TapestryHomePage');
//  *   const homePage = new TapestryHomePage(page);
//  *   await homePage.navigateToProduct();
//  */
// class MoreHomePage extends HomePage {
//   constructor(page) {
//     super(page);

//     // --- More Menu Locator ---
//     this.menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("More"))');

//     // --- More Category Locators ---
//     this.categories = {
//       lettersAndDecals: page.getByRole('link', { name: 'Letters & Decals', exact: false }).first(),
//       bedLinens: page.getByRole('link', { name: 'Bed Linens', exact: false }).first(),
//       tableLinens: page.getByRole('link', { name: 'Table Linens', exact: false }).first(),
//       mugsAndBottles: page.getByRole('link', { name: 'Mugs & Bottles', exact: false }).first(),
//       coasters: page.getByRole('Link', {name: 'Coasters', exact: false}).first()
//     };

//     // --- More Product Locators ---
//     this.products = {
//         privacyFilm: page.getByRole('link', {name: 'Privacy Film', exact: false}).first(),
//         bedRunner: page.getByRole('Link', {name: 'Custom Bed Runner', exact: false}).first(),
//         duvetCover: page.getByRole('Link', {name: 'Personalized Duvet Cover', exact: false}).first(),
//         flatBedsheet: page.getByRole('Link', {name: "Personalized Flat Bedsheet", exact: false}).first(),
//         fittedBedsheet: page.getByRole('Link', {name: "Personalized Fitted Bedsheet", exact: false}).first(),
//         tableRunner: page.getByRole('Link', {name: "Custom Table Runner", exact: false}).first(),
//         placemats: page.getByRole('link', {name: "Custom Placemats", exact: false}).first(),
//         roundTableCloth: page.getByRole('link', {name: "Custom Round Tablecloth", exact: false}).first(),
//         ovalTableCloth: page.getByRole('link', {name: "Custom Oval Tablecloth", exact: false}).first(),
//         squareRectangleTableCloth: page.getByRole('link', {name: "Custom Square/Rectangle Tablecloth", exact: false}).first(),
//         tableNapkins: page.getByRole('link', {name: "Custom Canvas Table Napkins", exact: false}).first(),
//         colaBottle: page.getByRole('link', {name: "Personalized Hot & Cold Cola Bottle", exact: false}).first(),
//         travellerBottle: page.getByRole('link', {name: "Personalized Hot & Cold Traveller Bottle", exact: false}).first(),
//         sportsBottle: page.getByRole('link', {name: "Personalized Sports Bottle", exact: false}).first(),
//         coffeeMugs: page.getByRole('link', { name: 'Custom Coffee Mugs', exact: false }).first(),
//         acrylicCoasters: page.getByRole('link', {name: "Custom Acrylic Coasters", exact: false}).first(),        
//     };
//   }

//   /** Navigate to: Letters & Decals → Pricacy Film */
//   async navigateToProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.lettersAndDecals,
//       product: this.products.privacyFilm,
//       urlPattern: /privacy-film-p/i,
//       name: "Privacy Film"
//     });
//   }

//   /** Navigate to: Bed Linens → Custom Bed Runner */
//   async navigateToBedRunnerProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.bedLinens,
//       product: this.products.bedRunner,
//       urlPattern: /custom-bed-runner-p/i,
//       name: "Custom Bed Runner"
//     });
//   }

//   /** Navigate to: Bed Linens → Personalized Duvet Cover */
//   async navigateToDuvetCoverProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.bedLinens,
//       product: this.products.duvetCover,
//       urlPattern: /personalized-duvet-cover-p/i,
//       name: "Personalized Duvet Cover"
//     });
//   }

//   /** Navigate to: Bed Linens → Personalized Flat Bedsheet */
//   async navigateToFlatBedsheetProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.bedLinens,
//       product: this.products.flatBedsheet,
//       urlPattern: /personalized-flat-bedsheet-p/i,
//       name: "Personalized Flat Bedsheet"
//     });
//   }

//   /** Navigate to: Bed Linens → Personalized Fitted Bedsheet */
//   async navigateToFittedBedsheetProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.bedLinens,
//       product: this.products.fittedBedsheet,
//       urlPattern: /personalized-fitted-bedsheet-p/i,
//       name: "Personalized Fitted Bedsheet"
//     });
//   }

//   /** Navigate to: Table Linens → Custom Table Runner */
//   async navigateToTableRunnerProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.tableLinens,
//       product: this.products.tableRunner,
//       urlPattern: /custom-table-runner-p/i,
//       name: "Custom Table Runner"
//     });
//   }

//   /** Navigate to: Table Linens → Custom Placemats */
//   async navigateToPlacematsProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.tableLinens,
//       product: this.products.placemats,
//       urlPattern: /custom-placemats-p/i,
//       name: "Custom Placemats"
//     });
//   }

//   /** Navigate to: Table Linens → Custom Round Tablecloth */
//   async navigateToRoundTableClothProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.tableLinens,
//       product: this.products.roundTableCloth,
//       urlPattern: /custom-round-tablecloth-p/i,
//       name: "Custom Round Tablecloth"
//     });
//   }

//   /** Navigate to: Table Linens → Custom Oval Tablecloth */
//   async navigateToOvalTableClothProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.tableLinens,
//       product: this.products.ovalTableCloth,
//       urlPattern: /custom-oval-tablecloth-p/i,
//       name: "Custom Oval Tablecloth"
//     });
//   }

//   /** Navigate to: Table Linens → Custom Square/Rectangle Tablecloth */
//   async navigateToSquareRectangleTableClothProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.tableLinens,
//       product: this.products.squareRectangleTableCloth,
//       urlPattern: /custom-square-rectangle-tablecloth-p/i,
//       name: "Custom Square/Rectangle Tablecloth"
//     });
//   }

//   /** Navigate to: Table Linens → Custom Canvas Table Napkins */
//   async navigateToTableNapkinsProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.tableLinens,
//       product: this.products.tableNapkins,
//       urlPattern: /custom-canvas-table-napkins-p/i,
//       name: "Custom Canvas Table Napkins"
//     });
//   }


//   /** Navigate to: Mugs & Bottles → Personalized Hot & Cold Cola Bottle */
//   async navigateToColaBottleProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.mugsAndBottles,
//       product: this.products.colaBottle,
//       urlPattern: /personalized-hot-and-cold-cola-bottle-p/i,
//       name: "Personalized Hot & Cold Cola Bottle"
//     });
//   }

//   /** Navigate to: Mugs & Bottles → Personalized Hot & Cold Traveller Bottle */
//   async navigateToTravellerBottleProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.mugsAndBottles,
//       product: this.products.travellerBottle,
//       urlPattern: /personalized-hot-and-cold-traveller-bottle-p/i,
//       name: "Personalized Hot & Cold Traveller Bottle"
//     });
//   }

//   /** Navigate to: Mugs & Bottles → Personalized Sports Bottle */
//   async navigateToSportsBottleProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.mugsAndBottles,
//       product: this.products.sportsBottle,
//       urlPattern: /personalized-sports-bottle-p/i,
//       name: "Personalized Sports Bottle"
//     });
//   }

//   /** Navigate to: Mugs & Bottles → Custom Coffee Mugs */
//   async navigateToCoffeeMugsProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.mugsAndBottles,
//       product: this.products.coffeeMugs,
//       urlPattern: /custom-coffee-mugs-p/i,
//       name: "Custom Coffee Mugs"
//     });
//   }

//   /** Navigate to: Coasters → Custom Acrylic Coasters */
//   async navigateToAcrylicCoastersProduct() {
//     await this._navigate({
//       menu: this.menu,
//       category: this.categories.coasters,
//       product: this.products.acrylicCoasters,
//       urlPattern: /custom-acrylic-coasters-p/i,
//       name: "Custom Acrylic Coasters"
//     });
//   }


// }

// module.exports = { MoreHomePage };









const { HomePage } = require('./HomePage');

class MoreHomePage extends HomePage {
    constructor(page) {
        super(page);

        this.menu = page.locator(
            'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("More"))'
        );
    }

    async navigate(categoryName, productName) {
        // Wait for More menu
        await this.menu.waitFor({
            state: 'visible',
            timeout: 15000
        });

        // Open More dropdown
        await this.menu.hover();
        await this.page.waitForTimeout(1000);
        await this.waitForStability(this.menu);

        // -----------------------------------
        // Category Hover
        // Example: Letters & Decals
        // -----------------------------------

        const category = this.page.getByRole('link', {
            name: categoryName,
            exact: false
        }).first();

        await category.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await this.waitForStability(category);
        await category.scrollIntoViewIfNeeded();

        await category.hover({
            force: true
        });

        console.log(`Hovered category: ${categoryName}`);

        await this.page.waitForTimeout(1500);

        // -----------------------------------
        // Product Click
        // Example:
        // Letters & Decals - Privacy Film
        // -----------------------------------

        const searchName = productName.includes('-')
            ? productName.split('-').pop().trim()
            : productName;

        const product = this.page.getByRole('link', {
            name: searchName,
            exact: false
        }).first();

        await product.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await this.waitForStability(product);
        await product.scrollIntoViewIfNeeded();

        console.log(`Clicking product: ${searchName}`);

        await product.click();

        console.log(
            `✅ Navigated: ${categoryName} → ${searchName}`
        );
    }
}

module.exports = { MoreHomePage };