// pages/NewTapestryHomePage.js

const { HomePage } = require('./HomePage');

class NewTapestryHomePage extends HomePage {
  constructor(page) {
    super(page);

    // Top-level Tapestries menu item
    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Tapestries"))'
    );
  }

  async navigate(categoryName, productName) {
    await this.smartMegaMenuNavigate({
      menu: this.menu,
      categoryName,
      productName
    });
  }
}

module.exports = { NewTapestryHomePage };
