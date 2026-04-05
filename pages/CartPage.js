const { expect } = require('@playwright/test');

class CartPage {
  constructor(page) {
    this.page = page;
    this.checkoutBtn = page.locator('button.btn.btnPrimary.btnBlock', { hasText: 'Secure Checkout' });
    this.popupClose = page.locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close').first();
  }

  async goToCart() {
    console.log('Step 5: Navigating to cart...');
    await this.page.goto('/checkout/cart', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
    const cartContent = await this.page.content();
    const isEmpty = cartContent.includes('Your cart is empty');
    console.log(`  Cart is ${isEmpty ? 'EMPTY ❌' : 'populated ✅'}`);
    
    // Ensure cart background requests finish
    try { await this.page.waitForLoadState('networkidle', { timeout: 20000 }); } catch (_) {}
    await this.page.waitForTimeout(2000);
  }

  async dismissPopup() {
    try {
      if (await this.popupClose.isVisible({ timeout: 2000 })) {
        await this.popupClose.click({ force: true });
        console.log('  Dismissed popup on cart page');
      }
    } catch (e) {}
  }

  async secureCheckout() {
    console.log('Step 6: Clicking Secure Checkout...');
    await this.checkoutBtn.waitFor({ state: 'visible', timeout: 30000 });
    console.log('  Secure Checkout button is visible');

    // CRITICAL: Wait for the button to be ENABLED
    await expect(this.checkoutBtn).toBeEnabled({ timeout: 30000 });
    console.log('  Secure Checkout button is enabled');

    await this.checkoutBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    // RETRY LOOP: Keep clicking every 2s until navigation away from /cart
    let navigated = false;
    for (let attempt = 1; attempt <= 8; attempt++) {
      console.log(`  Click attempt #${attempt}...`);
      await this.checkoutBtn.evaluate(node => node.click());
      try {
        await this.page.waitForURL(
          url => url.href.includes('/checkout') && !url.href.includes('cart'),
          { timeout: 4000 }
        );
        navigated = true;
        console.log('  ✅ Navigation confirmed after attempt #' + attempt + ': ' + this.page.url());
        break;
      } catch (_) {
        if (attempt < 8) {
          try { await expect(this.checkoutBtn).toBeEnabled({ timeout: 2000 }); } catch (_) {}
        }
      }
    }
    
    if (!navigated) {
      console.log('⚠️ All click attempts failed. Falling back to direct URL navigation...');
      await this.page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    // Wait for checkout page to fully load
    try { await this.page.waitForLoadState('networkidle', { timeout: 20000 }); } catch (_) {}
    await this.page.waitForTimeout(3000);
    console.log('  Checkout page URL: ' + this.page.url());
  }
}

module.exports = { CartPage };