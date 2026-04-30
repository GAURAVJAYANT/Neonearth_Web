// pages/CurtainsPDP.js

const { SmartPage } = require('./SmartPage');
const { validateAddToCartApi } = require('../utils/helpers/apiValidator');

class CurtainsPDP extends SmartPage {
  constructor(page) {
    super(page);

    this.addToCartBtn = page.getByRole('button', {
      name: /Add To Cart/i
    });
  }

  async addToCart() {
    console.log('Step: Click Add To Cart');

    // -----------------------------------
    // Step 1 → First Add To Cart click
    // -----------------------------------

    const firstAtc = this.addToCartBtn.first();

    await firstAtc.waitFor({
      state: 'visible',
      timeout: 20000
    });

    await firstAtc.scrollIntoViewIfNeeded();
    await this.waitForStability(firstAtc);

    await firstAtc.click({ force: true });

    console.log('✅ First Add To Cart clicked');

    // Give DOM time to refresh
    await this.page.waitForTimeout(3000);

    // -----------------------------------
    // Step 2 → Price sync
    // -----------------------------------

    const price = this.page.locator(
      'div.quantity-section span.price, .price-info .price, .product-info-price .price, span.price'
    )
    .filter({ visible: true })
    .first();

    try {
      await price.waitFor({
        state: 'visible',
        timeout: 10000
      });

      await price.click({ force: true });

      console.log('✅ Price sync completed');
    } catch (e) {
      console.log(
        '⚠️ Price sync not found, proceeding...'
      );
    }

    // Wait again after price sync
    await this.page.waitForTimeout(2000);

    // -----------------------------------
    // Step 3 → Re-fetch final Add To Cart
    // IMPORTANT FIX
    // -----------------------------------

    const refreshedButtons =
      await this.page.getByRole('button', {
        name: /Add To Cart/i
      }).all();

    let finalAtc = null;

    for (const btn of refreshedButtons) {
      const visible = await btn.isVisible().catch(() => false);

      if (visible) {
        finalAtc = btn;
      }
    }

    if (!finalAtc) {
      throw new Error(
        'Final Add To Cart button not found'
      );
    }

    await finalAtc.scrollIntoViewIfNeeded();
    await this.waitForStability(finalAtc);

    console.log(
      'Step: Final Add To Cart click (API validation)'
    );

    await validateAddToCartApi(
      this.page,
      async () => {
        await finalAtc.click({ force: true });
      }
    );

    console.log(
      '✅ Product successfully added to cart'
    );
  }
}

module.exports = { CurtainsPDP };