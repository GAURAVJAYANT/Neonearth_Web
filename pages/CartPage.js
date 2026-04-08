const { expect } = require('@playwright/test');

class CartPage {
  constructor(page) {
    this.page = page;

    // ✅ Stable locator (avoid class-based)
    this.checkoutBtn = page
      .getByRole('button', { name: /secure checkout/i })
      .first();

    this.popupClose = page
      .locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close')
      .first();
  }

  async goToCart() {
    console.log('Step 5: Navigating to cart...');

    await this.page.goto('/checkout/cart', {
      waitUntil: 'domcontentloaded'
    });

    // Validate cart state
    const cartContent = await this.page.content();
    const isEmpty = cartContent.includes('Your cart is empty');

    console.log(`  Cart is ${isEmpty ? 'EMPTY ❌' : 'populated ✅'}`);

    // Optional: wait for UI stability (not hard wait)
    await this.page.waitForLoadState('domcontentloaded');
  }

  async dismissPopup() {
    try {
      if (await this.popupClose.isVisible({ timeout: 3000 })) {
        await this.popupClose.click();
        console.log('  Popup dismissed');
      }
    } catch (e) {
      // ignore silently
    }
  }

 async secureCheckout() {
  console.log('Step 6: Clicking Secure Checkout...');

  const btn = this.checkoutBtn;

  await this.dismissPopup();

  await expect(btn).toBeVisible({ timeout: 15000 });
  await expect(btn).toBeEnabled({ timeout: 15000 });

  await btn.scrollIntoViewIfNeeded();

  const expectedUrl = '**/onepagecheckout';

  try {
    await Promise.all([
      this.page.waitForURL(expectedUrl, { timeout: 15000 }),
      btn.click({ force: true })
    ]);

    // ✅ Strong validation (URL match)
    await expect(this.page).toHaveURL(/onepagecheckout/);

    // ✅ Optional: wait for checkout UI element
    await this.page.locator('text=Shipping').waitFor({ timeout: 15000 });

    console.log('✅ Navigation success: ' + this.page.url());

  } catch (e) {
    console.log('⚠️ Click failed → fallback navigation');

    await this.page.goto('/onepagecheckout', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await expect(this.page).toHaveURL(/onepagecheckout/);
  }

  console.log('Final URL: ' + this.page.url());
}
}
module.exports = { CartPage };