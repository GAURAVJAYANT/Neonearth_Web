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
    this.subtotalPrice = page.locator("//div[@class='summaryTotal']//span[contains(text(), 'Subtotal')]/following-sibling::span");
    this.discountPrice = page.locator("//div[@class='summaryTotal']//span[text()='Discount']/following-sibling::span");
    this.shippingPrice = page.locator("//span[@class='summaryLabel' and contains(., 'Standard Shipping')]/following-sibling::span");
    this.quantityInput = page.locator("input[name='quantity']");
    this.orderSummaryHeading = page.getByText('Order Summary', { exact: true });
    this.standardShippingOption = page
      .locator('.shipping-option:has(input#shipping_standard), [role="radio"]:has(input#shipping_standard)')
      .first();
  }

  parseMoney(priceText) {
    if (!priceText || priceText === 'N/A') {
      return 0;
    }

    const normalized = priceText
      .replace(/,/g, '')
      .replace(/[^\d.-]/g, '');

    const value = parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
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

    console.log(`  Cart is ${isEmpty ? 'EMPTY' : 'populated'}`);

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
      console.log(`Click attempt #${attempt}...`);

      // Re-dismiss popups that may have appeared between attempts
      await this.dismissPopup();

      // Check if button entered "Processing" - wait it out
      const btnText = await btn.innerText().catch(() => '');
      if (btnText.toLowerCase().includes('processing')) {
        console.log('Button is processing, waiting...');
        await this.page.waitForTimeout(3000);
        continue;
      }

      try {
        await Promise.all([
          this.page.waitForURL(url => url.pathname.includes('/onepagecheckout'), { timeout: 10000 }),
          btn.click({ force: true })
        ]);

        navigated = true;
        console.log('Navigation confirmed on attempt #' + attempt);
        break;

      } catch (e) {
        // Navigation might have happened even if Promise.all threw
        if (this.page.url().includes('onepagecheckout')) {
          navigated = true;
          console.log('Navigation detected in catch on attempt #' + attempt);
          break;
        }
        console.log(`Attempt #${attempt} timed out. Retrying...`);
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
    console.log('Final URL verified: ' + this.page.url());
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

  async getSubtotalPrice() {
    try {
      await this.subtotalPrice.waitFor({ state: 'visible', timeout: 5000 });
      return (await this.subtotalPrice.innerText()).trim();
    } catch (e) {
      return 'N/A';
    }
  }

  calculateDiscountPercent(subtotalText, discountText, fallbackBaseText = '0') {
    const subtotal = this.parseMoney(subtotalText);
    const fallbackBase = this.parseMoney(fallbackBaseText);
    const discount = Math.abs(this.parseMoney(discountText));
    const baseAmount = subtotal > 0 ? subtotal : fallbackBase;

    if (baseAmount <= 0 || discount <= 0) {
      return 0;
    }

    return (discount / baseAmount) * 100;
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
    
    try {
      await this.waitForLoaderSilence(15000, 1000); // Reduced timeout to 15 seconds
    } catch (e) {
      console.log(`  ⚠️  Loader did not settle, continuing anyway: ${e.message}`);
    }
  }

  async getShippingPrice() {
    try {
      console.log('  Getting shipping price...');
      
      // First, check if the locator is visible
      const isVisible = await this.shippingPrice.isVisible({ timeout: 3000 }).catch(() => false);
      if (!isVisible) {
        console.log('  ⚠️  Shipping price not visible, trying to wait...');
        await this.shippingPrice.waitFor({ state: 'visible', timeout: 5000 }).catch((e) => {
          console.log(`  ⚠️  Timeout waiting for shipping price: ${e.message}`);
        });
      }
      
      const shippingText = (await this.shippingPrice.innerText()).trim();
      console.log(`  ✓ Shipping price found: ${shippingText}`);
      return shippingText;
    } catch (e) {
      console.log(`  ⚠️  Error getting shipping price: ${e.message}`);
      return 'N/A';
    }
  }

  async checkShippingStatus() {
    try {
      console.log('  Checking shipping status...');
      
      const subtotalStr = await this.getSubtotalPrice();
      const subtotal = this.parseMoney(subtotalStr);
      const freeShippingThreshold = 99;

      console.log(`    Subtotal: ${subtotalStr} (Parsed: $${subtotal})`);

      if (subtotal > freeShippingThreshold) {
        console.log(`    ✓ FREE SHIPPING - Total ($${subtotal}) exceeds $${freeShippingThreshold}`);
        return true;
      } else {
        console.log(`    ✗ SHIPPING IS NOT FREE - Total ($${subtotal}) does not exceed $${freeShippingThreshold}`);
        return false;
      }
    } catch (e) {
      console.log(`    Warning: Could not check shipping status - ${e.message}`);
      return null;
    }
  }

  async selectStandardShipping() {
    console.log('  Changing shipping option to Standard...');

    await this.page.waitForTimeout(1500);

    const clickedChangeHere = await this.clickPriorityShippingChangeHere();
    if (!clickedChangeHere) {
      throw new Error('Could not find visible "Change Here" link for Priority Shipping.');
    }

    await this.page.waitForTimeout(1500);
    const selectedStandard = await this.clickStandardShippingOption();
    if (!selectedStandard) {
      throw new Error('Could not find visible Standard shipping option.');
    }

    await expect(this.page.locator('input#shipping_standard')).toBeChecked({ timeout: 10000 });
    await this.page.waitForTimeout(2000);
    
    try {
      await this.waitForLoaderSilence(15000, 1000); // Reduced timeout to 15 seconds
    } catch (e) {
      console.log(`  ⚠️  Loader did not settle, continuing anyway: ${e.message}`);
    }
    
    console.log('  Standard shipping selected');
  }

  async clickPriorityShippingChangeHere() {
    const changeHereLocators = [
      this.page.locator('span.summaryLabel', { hasText: 'Priority Shipping' }).locator('.change-here').first(),
      this.page.locator('.summaryLabel:has-text("Priority Shipping")').getByText('Change Here', { exact: true }).first(),
      this.page.locator('xpath=//*[contains(@class,"summaryLabel") and contains(normalize-space(.),"Priority Shipping")]//*[contains(@class,"change-here") or normalize-space()="Change Here"]').first(),
      this.page.locator('xpath=//*[contains(normalize-space(.),"Priority Shipping")]/following::*[normalize-space()="Change Here"][1]').first(),
    ];

    for (const locator of changeHereLocators) {
      if (await this.clickIfVisible(locator)) {
        console.log('  Clicked Priority Shipping Change Here');
        return true;
      }
    }

    return await this.page.evaluate(() => {
      const labels = [...document.querySelectorAll('.summaryLabel, span, div')]
        .filter((element) => element.textContent && element.textContent.includes('Priority Shipping'));

      for (const label of labels) {
        const changeHere = label.querySelector('.change-here')
          || [...label.querySelectorAll('*')].find((element) => element.textContent && element.textContent.trim() === 'Change Here');

        if (changeHere) {
          changeHere.scrollIntoView({ block: 'center', inline: 'center' });
          changeHere.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
          changeHere.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
          changeHere.click();
          return true;
        }
      }

      return false;
    });
  }

  async clickStandardShippingOption() {
    const standardOptionLocators = [
      this.standardShippingOption,
      this.page.locator('.shipping-option', { has: this.page.locator('input#shipping_standard') }).first(),
      this.page.locator('label[for="shipping_standard"]').first(),
      this.page.getByRole('radio', { name: /standard/i }).first(),
    ];

    for (const locator of standardOptionLocators) {
      if (await this.clickIfVisible(locator)) {
        console.log('  Clicked Standard shipping option');
        return true;
      }
    }

    return await this.page.evaluate(() => {
      const input = document.querySelector('input#shipping_standard');
      if (!input) {
        return false;
      }

      const clickable = input.closest('.shipping-option')
        || document.querySelector('label[for="shipping_standard"]')
        || input;

      clickable.scrollIntoView({ block: 'center', inline: 'center' });
      clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      clickable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      clickable.click();
      input.checked = true;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
  }

  async clickIfVisible(locator) {
    const visible = await locator.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      return false;
    }

    await locator.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await locator.click({ timeout: 10000 }).catch(async () => {
      await locator.click({ force: true });
    });
    return true;
  }

  async handleCoupons() {
    console.log('Step 5.5: Handling available coupons...');

    try {
      // 1. Click Available Offers
      await this.availableOffers.waitFor({ state: 'visible', timeout: 15000 });
      await this.availableOffers.scrollIntoViewIfNeeded();
      await this.waitForStability(this.availableOffers);
      await this.availableOffers.click({ timeout: 10000 }).catch(async () => {
        await this.availableOffers.click({ force: true });
      });
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
        console.log('No coupons found in "Available Offers" section.');
      }

      // ── PRINT PRODUCT DETAILS ──────────────────────────────────────
      const productName = await this.productNameInCart.first().innerText().catch(() => 'N/A');
      const productPrice = await this.productPriceInCart.first().innerText().catch(() => 'N/A');

      console.log("Product Name:", productName);
      console.log("Product Price:", productPrice);

    } catch (e) {
      console.log('Failed to handle coupons: ' + e.message);
      throw e;
    }
  }
}

module.exports = { CartPage };
