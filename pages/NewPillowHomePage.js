// pages/NewPillowHomePage.js

const { HomePage } = require('./HomePage');

class NewPillowHomePage extends HomePage {

  constructor(page) {
    super(page);

    // Top-level Pillow menu
    this.menu = page.locator(
      'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Pillows"))'
    );
  }

  async navigate(categoryName, productName) {

    // -----------------------------------
    // Step 1 → Open Pillow Dropdown
    // -----------------------------------

    await this.menu.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Smart hover main menu
    await this.smartHover(this.menu);

    console.log('✅ Hovered Pillows menu');

    // IMPORTANT
    // Allow mega menu animation
    await this.page.waitForTimeout(2000);

    // -----------------------------------
    // Step 2 → Category Handling
    // -----------------------------------

    if (categoryName) {

      const category = this.page.getByRole('link', {
        name: categoryName,
        exact: false
      }).first();

      await category.waitFor({
        state: 'visible',
        timeout: 15000
      });

      // Smart hover handles:
      // visibility
      // stability
      // scrolling
      // retries

      await this.smartHover(category);

      console.log(`✅ Hovered category: ${categoryName}`);

      // IMPORTANT
      // Wait for submenu render
      await this.page.waitForTimeout(2500);
    }

    // -----------------------------------
    // Step 3 → Product Locator
    // -----------------------------------

    const searchName = productName.includes('-')
      ? productName.split('-').pop().trim()
      : productName;

    const productLink = this.page.getByRole('link', {
      name: searchName,
      exact: false
    });

    const productText = this.page.locator('span.product-text', {
      hasText: searchName
    });

    const product = categoryName === 'Bed Pillows'
      ? productText.first()
      : productLink.or(productText).first();

    // Wait until visible
    await product.waitFor({
      state: 'visible',
      timeout: 15000
    });

    // Wait for stable submenu render
    await this.waitForStability(product);

    await product.scrollIntoViewIfNeeded();

    // VERY IMPORTANT
    // Hover product first
    // keeps submenu alive

    await this.smartHover(product);

    // Give menu time to stabilize
    await this.page.waitForTimeout(1000);

    console.log(`🛒 Clicking product: ${searchName}`);

    try {

      // Smart click handles:
      // overlays
      // retries
      // stability
      // intercepted clicks

      if (categoryName === 'Bed Pillows') {
        const bedPillowTarget = product.locator('xpath=ancestor::a[1]').first();
        const clickTarget = await bedPillowTarget.count()
          ? bedPillowTarget
          : product;

        await clickTarget.click({ timeout: 10000 }).catch(async () => {
          await clickTarget.click({ force: true, timeout: 10000 }).catch(async () => {
            await clickTarget.evaluate((element) => element.click());
          });
        });
      } else {
        await this.smartClick(product);
      }

    } catch (e) {

      console.log(
        '⚠️ Smart click failed, trying JS click...'
      );

      // Final fallback
      await product.evaluate(el => el.click());
    }

    // Wait navigation complete
    await this.page.waitForLoadState(
      'domcontentloaded'
    );

    console.log(
      `✅ Navigated Successfully: ${
        categoryName
          ? categoryName + ' → '
          : ''
      }${searchName}`
    );
  }
}

module.exports = { NewPillowHomePage };
