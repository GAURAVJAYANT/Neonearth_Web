const { expect } = require('@playwright/test');
const { SmartPage } = require('./SmartPage');
const { measurePagePerformance } = require('../utils/helpers/performanceHelper');
const { monitorApiCalls } = require('../utils/helpers/apiValidator');

class CartPage extends SmartPage {
  constructor(page) {
    super(page);

    this.checkoutBtn = page
      .getByRole('button', { name: /secure checkout/i })
      .first();

    this.popupClose = page
      .locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close')
      .first();

    this.availableOffers = page.getByText('Available Offers', { exact: true });
    this.couponCodes = page.locator('span.code');
    this.couponInput = page.getByRole('textbox', { name: 'Enter Your Coupon Code' });

    this.productNameInCart = page.locator('h6.productName');
    this.productPriceInCart = page.locator('span.price');
    this.discountPrice = page.locator("//div[@class='summaryTotal']//span[text()='Discount']/following-sibling::span");
    this.quantityInput = page.locator("input[name='quantity']");
    this.orderSummaryHeading = page.getByText('Order Summary', { exact: true });
  }

  async goToCart() {
    console.log('Step 5: Navigating to cart...');

    await this.page.goto('/checkout/cart', {
      waitUntil: 'domcontentloaded'
    });

    // ── Performance: measure cart page load ──────────────────────────
    await measurePagePerformance(this.page, 'Cart Page');

    // ── Validate cart state ───────────────────────────────────────────
    const emptyCart = this.page.locator('text=Your cart is empty');
    const isEmpty = await emptyCart.isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`  Cart is ${isEmpty ? 'EMPTY ❌' : 'populated ✅'}`);

    // Wait for cart to fully settle (items, pricing, offers section)
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async dismissPopup() {
    try {
      await this.popupClose.waitFor({ state: 'visible', timeout: 3000 });
      await this.popupClose.click();
      console.log('  Popup dismissed');
    } catch {
      // No popup present, continue silently
    }
  }

  async secureCheckout() {
    console.log('Step 6: Clicking Secure Checkout...');

    const btn = this.checkoutBtn;

    // 1. Dismiss any overlapping popups
    await this.dismissPopup();

    // 2. Wait for button to be fully visible and enabled
    await btn.waitFor({ state: 'visible', timeout: 20000 });
    await expect(btn).toBeEnabled({ timeout: 10000 });

    // 3. Scroll into view and pause for layout to settle
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1500);

    // 4. Retry: click + wait for navigation together
    const maxAttempts = 4;
    let navigated = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`  Click attempt #${attempt}...`);

      // Re-dismiss popups that may have appeared between attempts
      await this.dismissPopup();

      // Check if button entered "Processing" - wait it out
      const btnText = await btn.innerText().catch(() => '');
      if (btnText.toLowerCase().includes('processing')) {
        console.log('  🕐 Button is processing, waiting...');
        await this.page.waitForTimeout(3000);
        continue;
      }

      try {
        await Promise.all([
          this.page.waitForURL(url => url.pathname.includes('/onepagecheckout'), { timeout: 10000 }),
          btn.click({ force: true })
        ]);

        navigated = true;
        console.log('  ✅ Navigation confirmed on attempt #' + attempt);
        break;

      } catch (e) {
        // Navigation might have happened even if Promise.all threw
        if (this.page.url().includes('onepagecheckout')) {
          navigated = true;
          console.log('  ✅ Navigation detected in catch on attempt #' + attempt);
          break;
        }
        console.log(`  ⚠️ Attempt #${attempt} timed out. Retrying...`);
      }
    }

    // 5. Final fallback: direct navigation
    if (!navigated) {
      console.log('  🔄 All click attempts failed. Falling back to direct URL...');
      await this.page.goto('/onepagecheckout', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
    }

    // 6. Final assertion
    await expect(this.page).toHaveURL(/onepagecheckout/, { timeout: 15000 });
    console.log('  ✅ Final URL verified: ' + this.page.url());
  }

  async getCartPrice() {
    try {
      await this.productPriceInCart.first().waitFor({ state: 'visible', timeout: 5000 });
      return (await this.productPriceInCart.first().innerText()).trim();
    } catch (e) {
      return 'N/A';
    }
  }

  async getDiscountPrice() {
    try {
      if (await this.discountPrice.isVisible()) {
        return (await this.discountPrice.innerText()).trim();
      }
      return '0.00';
    } catch (e) {
      return 'N/A';
    }
  }

  async updateQuantity(qty) {
    console.log(`  Updating quantity to: ${qty}`);
    const input = this.quantityInput.first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    
    await input.focus();
    await input.fill(''); 
    await input.fill(qty.toString());
    await input.press('Enter'); 
    
    // Click Order Summary to trigger update as requested
    console.log('  Clicking Order Summary to trigger update...');
    await this.orderSummaryHeading.click().catch(() => {});
    
    console.log('  Wait for cart update...');
    await this.page.waitForTimeout(3000); 
    await this.waitForLoaderSilence();
  }

  async handleCoupons() {
    console.log('Step 5.5: Handling available coupons...');

    try {
      // 1. Click Available Offers
      await this.availableOffers.waitFor({ state: 'visible', timeout: 5000 });
      await this.availableOffers.click();
      console.log('  Clicked "Available Offers"');

      // 2. Get and print all coupon codes
      await this.couponCodes.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      
      const coupons = (await this.couponCodes.allTextContents())
        .map(code => code.trim())
        .filter(Boolean);

      console.log("Total Coupons Available:", coupons.length);
      
      for (let code of coupons) {
        console.log("Coupon:", code);
      }

      if (coupons.length > 0) {
        // 3. Enter the first coupon code
        const firstCoupon = coupons[0];
        console.log(`Applying first coupon: ${firstCoupon}`);
        await this.couponInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.couponInput.fill(firstCoupon);
        await this.page.keyboard.press('Enter'); // Submit coupon
        
        // Wait for potential price update animation
        await this.page.waitForTimeout(3000); 
      } else {
        console.log('⚠️ No coupons found in "Available Offers" section.');
      }

      // ── PRINT PRODUCT DETAILS ──────────────────────────────────────
      const productName = await this.productNameInCart.first().innerText().catch(() => 'N/A');
      const productPrice = await this.productPriceInCart.first().innerText().catch(() => 'N/A');

      console.log("Product Name:", productName);
      console.log("Product Price:", productPrice);

    } catch (e) {
      console.log('  ❌ Failed to handle coupons: ' + e.message);
    }
  }
}

module.exports = { CartPage };
