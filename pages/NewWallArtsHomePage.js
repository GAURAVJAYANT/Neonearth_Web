const { HomePage } = require('./HomePage');

class NewWallArtsHomePage extends HomePage {
  constructor(page) {
    super(page);

    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Wall Arts"))'
    );
  }

  getCategoryLocator(categoryName) {
    return this.page.locator(
      `a:has(.menu-text-wrapper .menu-text:text-is("${categoryName}")), ` +
      `li:has(.menu-text-wrapper .menu-text:text-is("${categoryName}"))`
    ).filter({ visible: true }).first();
  }

  getProductLocator(productName, categoryName) {
    if (categoryName === 'Custom Wallpapers') {
      return this.getFullNameProductLocator(productName);
    }

    if (categoryName === 'Custom Wall Murals') {
      return this.getFullNameProductLocator(productName);
    }

    if (categoryName === 'Poster Prints') {
      return this.getFullNameProductLocator(productName);
    }

    if (categoryName === 'Acrylic Prints') {
      return this.getFullNameProductLocator(productName);
    }

    const searchName = this.getSearchName(productName);
    const exactProductText = new RegExp(`^${this.escapeRegExp(searchName)}$`);

    return this.page
      .locator('a:visible')
      .filter({
        has: this.page.locator('span.product-text').filter({
          hasText: exactProductText
        })
      })
      .first();
  }

  getFallbackProductLocator(productName, categoryName) {
    if (categoryName === 'Custom Wallpapers') {
      return this.getFullNameProductLocator(productName);
    }

    if (categoryName === 'Custom Wall Murals') {
      return this.getFullNameProductLocator(productName);
    }

    if (categoryName === 'Poster Prints') {
      return this.getFullNameProductLocator(productName);
    }

    if (categoryName === 'Acrylic Prints') {
      return this.getFullNameProductLocator(productName);
    }

    const searchName = this.getSearchName(productName);
    const exactProductText = new RegExp(`^${this.escapeRegExp(searchName)}$`);

    return this.page.getByRole('link', {
      name: exactProductText
    }).first();
  }

  getFullNameProductLocator(productName) {
    const exactProductName = new RegExp(`^${this.escapeRegExp(productName)}$`, 'i');

    return this.page
      .locator('a:visible')
      .filter({
        has: this.page.locator('span.product-text').filter({
          hasText: exactProductName
        })
      })
      .first();
  }

  getSearchName(productName) {
    return productName.includes('-')
      ? productName.split('-').pop().trim()
      : productName;
  }

  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async hoverWallArtsMenu() {
    await this.waitForOverlays();
    await this.menu.waitFor({ state: 'visible', timeout: 20000 });
    await this.waitForStability(this.menu);

    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.menu.hover({ force: true });
      console.log(`Opening Wall Arts mega menu, attempt ${attempt}`);

      const menuReady = await this.page
        .locator('.menu-text-wrapper .menu-text, nav.header-navigation-bar a')
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (menuReady) {
        return;
      }
    }

    throw new Error('Wall Arts mega menu did not open.');
  }

  async hoverCategoryUntilProductVisible(categoryLocator, productLocator, categoryName, productName) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await categoryLocator.waitFor({ state: 'visible', timeout: 20000 });
      await categoryLocator.scrollIntoViewIfNeeded();
      await this.waitForStability(categoryLocator);
      await categoryLocator.hover({ force: true });
      console.log(`Hovered category: ${categoryName}, attempt ${attempt}`);

      const productVisible = await productLocator
        .waitFor({ state: 'visible', timeout: 7000 })
        .then(() => true)
        .catch(() => false);

      if (productVisible) {
        await this.waitForStability(productLocator);
        return;
      }

      console.log(`Product not visible yet after hovering ${categoryName}: ${productName}`);
    }

    throw new Error(`Product link did not become visible in Wall Arts menu: ${categoryName} -> ${productName}`);
  }

  async clickProduct(productLocator, fallbackLocator, productName) {
    const visibleExactCount = await productLocator.count();
    const product = visibleExactCount > 0 ? productLocator : fallbackLocator;

    await product.waitFor({ state: 'visible', timeout: 20000 });
    await this.waitForStability(product);
    await product.scrollIntoViewIfNeeded();

    console.log(`Clicking product: ${productName}`);
    try {
      await product.click({ timeout: 10000 });
    } catch (standardClickError) {
      console.log(`Standard click failed, trying DOM click for: ${productName}`);
      try {
        await product.evaluate((element) => element.click());
      } catch (domClickError) {
        console.log(`DOM click failed, trying force click for: ${productName}`);
        await product.click({ force: true });
      }
    }
  }

  async navigate(categoryName, productName) {
    const searchName = this.getSearchName(productName);
    const product = this.getProductLocator(productName, categoryName);
    const fallbackProduct = this.getFallbackProductLocator(productName, categoryName);

    await this.hoverWallArtsMenu();

    if (categoryName) {
      const category = this.getCategoryLocator(categoryName);
      await this.hoverCategoryUntilProductVisible(category, product, categoryName, searchName);
    }

    await this.clickProduct(product, fallbackProduct, searchName);
    console.log(`Navigated: ${categoryName ? categoryName + ' -> ' : ''}${searchName}`);
  }
}

module.exports = { NewWallArtsHomePage };
