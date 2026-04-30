// pages/PetZoneHomePage.js

const { HomePage } = require('./HomePage');

class PetZoneHomePage extends HomePage {
  constructor(page) {
    super(page);

    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Pet Zone"))'
    );
  }

  async navigate(categoryName, productName) {
    await this.smartMegaMenuNavigate({
      menu: this.menu,
      categoryName,
      productName,
      urlPattern: /-p($|\?)/i // Generic product pattern
    });
  }
}

module.exports = { PetZoneHomePage };