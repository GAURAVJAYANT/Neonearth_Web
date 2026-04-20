const { expect } = require('@playwright/test');
const { SmartPage } = require('./SmartPage');
const { measurePagePerformance, savePerformanceReport } = require('../utils/helpers/performanceHelper');

class CheckoutPage extends SmartPage {
  constructor(page) {
    super(page);
    this.fNameInput = page.locator('#firstname');
    this.lNameInput = page.locator('#lastname');
    this.phoneInput = page.locator('#telephone');
    this.addressInput = page.locator('#street_1, input[name="street[0]"], #street0').first();
    this.aptInput = page.locator('#street_2, input[name="street[1]"], #street1').first();
    this.postcodeInput = page.locator('#postcode');
    this.cityInput = page.locator('#city');
    this.payNowBtn = page.getByRole('button', { name: /Pay Now/i });
  }

  async fillShippingDetails(details) {
    console.log('Step: Filling Shipping Details...');
    const { firstName, lastName, phone, address, city, postcode, email } = details;
    
    // Email — optional
    try {
      const emailInput = this.page.locator('#email');
      if (await emailInput.isVisible({ timeout: 5000 })) {
        await this.smartFill(emailInput, email || 'test@yopmail.com');
        console.log('  Filled email');
      }
    } catch (e) {}

    // Personal Details
    await this.smartFill(this.fNameInput, firstName || 'Gaurav');
    await this.smartFill(this.lNameInput, lastName || 'Jayant');
    await this.smartFill(this.phoneInput, phone || '88888888888');

    // Address Details
    await this.smartFill(this.addressInput, address || '123 Main Street');
    
    try {
      if (await this.aptInput.isVisible({ timeout: 2000 })) {
        await this.smartFill(this.aptInput, 'hno 31');
      }
    } catch (e) {}

    await this.smartFill(this.postcodeInput, postcode || '10001');
    await this.smartFill(this.cityInput, city || 'New York');
  }

  async fillStripePayment({ cvc = '123' }) {
    const cvcString = String(cvc);
    console.log(`Filling CVC for saved card: ${cvcString}`);

    // Robust Scroll to Payment Method
    await this.smartAssertVisible(this.page.getByRole('heading', { name: 'Payment Method' }));
    
    // Wait for at least one Stripe iframe to be present
    await this.page.waitForSelector('iframe[src*="stripe"]', { state: 'attached', timeout: 30000 });
    await this.page.waitForTimeout(2000); // Stripe iframe transition settle time

    // Try multiple known Stripe CVC iframe title patterns
    const cvcFrameSelectors = [
      'iframe[title*="Secure CVC input frame"]',
      'iframe[title*="CVC"]',
      'iframe[title*="cvc"]',
      'iframe[title*="security code"]',
      'iframe[title*="CVV"]',
    ];

    let cvcInput = null;
    for (const selector of cvcFrameSelectors) {
      try {
        const frame = this.page.frameLocator(selector);
        const input = frame.locator('input[name="cvc"]');
        if (await input.isVisible({ timeout: 5000 })) {
          cvcInput = input;
          console.log(`  ✅ CVC iframe matched via: ${selector}`);
          break;
        }
      } catch {}
    }

    // Fallback: scan ALL Stripe iframes
    if (!cvcInput) {
      console.log('  Trying fallback: scanning all stripe iframes for cvc input...');
      cvcInput = this.page.frameLocator('iframe[src*="stripe"]').locator('input[name="cvc"]').first();
    }

    // Fill CVC using smartFill principle (adapted for frame locator)
    await cvcInput.waitFor({ state: 'visible', timeout: 10000 });
    await cvcInput.click({ clickCount: 3 });
    await cvcInput.fill(cvcString);
    console.log('✅ CVC entered successfully');
  }

  async placeOrder() {
    console.log('Step: Finalizing Checkout...');

    // Phase 0: Stabilize — wait for checkout form to be fully idle
    await this.waitForLoaderSilence(60000, 2000);

    // Phase 1: Single deliberate click on Pay Now
    // IMPORTANT: Do NOT use smartClick here — it retries on failure which causes
    // a second click while the payment loader is processing, triggering a
    // "refresh payment" error. Pay Now must be clicked exactly ONCE.
    console.log('Step 10: Clicking Pay Now (single click, no retry)...');
    const btn = this.payNowBtn;
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // brief settle after scroll
    await btn.click({ timeout: 10000 });
    console.log('  ✅ Pay Now clicked. Waiting for redirect to success page...');

    // Phase 2: Wait for the success page URL — hard block, up to 5 minutes
    try {
      await this.page.waitForURL(/success/i, { timeout: 300000 });
      console.log(`  ✅ Success page reached: ${this.page.url()}`);
    } catch (e) {
      const currentUrl = this.page.url().toLowerCase();
      const hasOrderMarkup = await this.page
        .locator('.checkout-success, .order-number')
        .first()
        .isVisible()
        .catch(() => false);

      if (!hasOrderMarkup && !currentUrl.includes('success')) {
        // Check for a payment error on the page before giving up
        const errorLoc = this.page.locator('.message-error, .message.error, .alert-danger, #payment-errors').first();
        if (await errorLoc.isVisible().catch(() => false)) {
          const errorText = await errorLoc.innerText().catch(() => 'Unknown error');
          throw new Error(`Payment failed: ${errorText}`);
        }
        throw new Error(`Checkout timed out: no success redirect within 5 minutes. URL: ${this.page.url()}`);
      }
      console.log('  ✅ Success confirmed via page markup (AJAX, no URL change).');
    }

    // Phase 3: Wait for Order ID element to render before returning
    console.log('  Waiting for Order ID to render on confirmation page...');
    const orderIdSelectors = [
      '.order-number',
      '.checkout-success p span',
      '.checkout-success strong',
      '[data-bind*="getOrderId"]',
      'p:has-text("Order #")',
      'p:has-text("Your order number")',
    ];

    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      for (const sel of orderIdSelectors) {
        if (await this.page.locator(sel).first().isVisible().catch(() => false)) {
          console.log(`  ✅ Order ID element visible via [${sel}]`);
          return; // Done — Order ID is on screen
        }
      }
      await this.page.waitForTimeout(1500);
    }

    console.warn('  ⚠️ Order ID element not found within 60s — order likely still succeeded.');
  }

  async verifySuccess() {
    console.log('Step: Verifying Order Success...');
    
    // Ensure loaders are gone and success content has arrived
    await this.waitForLoaderSilence(60000, 3000);

    const finalUrl = this.page.url();
    console.log(`  Final URL: ${finalUrl}`);
    
    // Robust success check (URL or Confirmation Message)
    const isSuccess = finalUrl.includes('success') || 
                     await this.page.locator('h1, .page-title, .checkout-success').filter({ hasText: /Thank you|Success/i }).count() > 0;
    
    if (!isSuccess) {
      console.error('  ❌ Success state not confirmed.');
      throw new Error('Success verification failed: Not on success page.');
    }
    
    console.log('✅ Journey Complete! Order placed successfully.');
  }

  async printOrderHash() {
    console.log('Step 13: Retrieving and printing Order Number...');
    
    // Scavenging locators (from specific to generic)
    const orderLocators = [
      '.order-number',
      '.checkout-success p span',
      '//span[contains(text(), "#")]',
      '//p[contains(text(), "Order #")]',
      '//strong[contains(text(), "0000")]' // Common magento pattern
    ];

    let found = false;
    for (const selector of orderLocators) {
      try {
        const loc = this.page.locator(selector).first();
        if (await loc.isVisible({ timeout: 5000 })) {
          const text = await loc.innerText();
          if (text.includes('#') || /\d{5,}/.test(text)) {
            console.log(`  ✅ Order ID scavenged via [${selector}]: ${text.trim()}`);
            found = true;
            break;
          }
        }
      } catch (e) {}
    }

    if (!found) {
      console.log('  ⚠️ Scanning all page text for Order ID...');
      const allText = await this.page.innerText('body');
      const match = allText.match(/Order\s*#?\s*([0-9A-Z-]+)/i) || allText.match(/#([0-9]{5,})/);
      if (match) {
        console.log(`  ✅ Order ID found via regex scan: ${match[0]}`);
      } else {
        console.log('  ❌ Order ID not found on page.');
      }
    }
  }

  async waitForCheckoutToLoad() {
    console.log('Waiting for checkout to stabilize...');
    const start = Date.now();

    await this.page.waitForURL(/onepagecheckout/, { timeout: 15000 });
    
    // Wait for core components
    await Promise.all([
      this.page.getByRole('heading', { name: 'Payment Method' }).waitFor({ timeout: 40000 }),
      this.page.waitForSelector('iframe[src*="stripe"]', { state: 'attached', timeout: 40000 })
    ]);

    await this.waitForLoaderSilence(30000, 2000);

    const loadTime = Date.now() - start;
    console.log(`✅ Checkout ready (took ${loadTime}ms to fully load)`);
    await measurePagePerformance(this.page, 'Checkout Page');
  }

  async verifySuccessAndReport(testName) {
    await this.verifySuccess();
    // ── Save performance report for this test run ────────────────────
    savePerformanceReport(testName || 'E2E Journey');
  }
}

module.exports = { CheckoutPage };