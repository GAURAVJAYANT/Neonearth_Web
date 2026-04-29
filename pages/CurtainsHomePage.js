// pages/CurtainsHomePage.js

const { HomePage } = require('./HomePage');

class CurtainsHomePage extends HomePage {
  constructor(page) {
    super(page);

    // Main Curtains menu
    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Curtains"))'
    );
  }

  async navigate(categoryName, productName) {
    // ----------------------------------
    // Step 1 → Prepare Search Names
    // ----------------------------------
    let searchCategory = categoryName;

    // Special handling for Sheer Curtains naming convention
    if (categoryName.includes('Sheer')) {
      searchCategory = 'Sheer Curtains Best ›';
    }

    // ----------------------------------
    // Step 2 → Execute Smart Navigation
    // ----------------------------------
    // If Custom Drapes is the category, we skip the category hover part 
    // by passing null (the base class will handle it if we modify it slightly, 
    // or we just use the logic as is).
    
    await this.smartMegaMenuNavigate({
      menu: this.menu,
      categoryName: searchCategory,
      productName
    });
  }
}

module.exports = { CurtainsHomePage };