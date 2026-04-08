const { expect } = require('@playwright/test');

class CheckoutPage {
  constructor(page) {
    this.page = page;
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

    console.log(details);

    const { firstName, lastName, phone, address, city, postcode, email } = details;
    
    // Email — optional, only shown for guest sessions (skip gracefully if absent)
    try {
      const emailInput = this.page.locator('#email');
      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.click({ clickCount: 3 });
        await emailInput.fill(email || 'test@yopmail.com');
        console.log('  Filled email');
      } else {
        console.log('  Email field not present (guest session already tracked)');
      }
    } catch (e) {
      console.log('  Email field skipped: ' + e.message.split('\n')[0]);
    }

    // First Name
    await this.fNameInput.waitFor({ state: 'visible', timeout: 20000 });
    await this.fNameInput.click({ clickCount: 3 });
    await this.fNameInput.fill(firstName || 'Gaurav');
    console.log('  Filled First Name');

    // Last Name
    await this.lNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.lNameInput.click({ clickCount: 3 });
    await this.lNameInput.fill(lastName || 'Jayant');
    console.log('  Filled Last Name');

    // Mobile Number
    await this.phoneInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.phoneInput.click({ clickCount: 3 });
    await this.phoneInput.fill(phone || '88888888888');
    console.log('  Filled Mobile Number');

    // Address
    await this.addressInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.addressInput.click({ clickCount: 3 });
    await this.addressInput.fill(address || '123 Main Street');
    console.log('  Filled Address');
    await this.page.waitForTimeout(1000);

    // Apartment (optional)
    try {
      if (await this.aptInput.isVisible({ timeout: 2000 })) {
        await this.aptInput.click({ clickCount: 3 });
        await this.aptInput.fill('hno 31');
      }
    } catch (e) {}

    // Postcode
    await this.postcodeInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.postcodeInput.click({ clickCount: 3 });
    await this.postcodeInput.fill(postcode || '10001');
    await this.postcodeInput.press('Tab');
    console.log('  Filled Postcode');
    await this.page.waitForTimeout(1000);

    // City
    await this.cityInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.cityInput.click({ clickCount: 3 });
    await this.cityInput.fill(city || 'New York');
    console.log('  Filled City');
    await this.page.waitForTimeout(1000);
  }

  async fillStripePayment({ cvc = '123' }) {
  console.log('Filling CVC for saved card...');

  // ✅ FIXED locator
  await this.page
    .getByRole('heading', { name: 'Payment Method' })
    .scrollIntoViewIfNeeded();

  await this.page.waitForTimeout(500);

  await this.page.waitForSelector('iframe[src*="stripe"]', {
    timeout: 15000
  });

  const cvcFrame = this.page.frameLocator('iframe[title*="CVC"]');
  const cvcInput = cvcFrame.locator('input[name="cvc"]');

  await cvcInput.waitFor({ timeout: 10000 });

  try {
    await cvcInput.fill(cvc);
  } catch {
    await cvcInput.click();
    await cvcInput.pressSequentially(cvc, { delay: 50 });
  }

  console.log('✅ CVC entered successfully');
}


  async placeOrder() {
    console.log('Step 10: Clicking Pay Now...');
    await this.payNowBtn.click();
    console.log('  Waiting for payment processing and success redirect...');
    try {
      await this.page.waitForURL(/success/i, { timeout: 120000 });
    } catch (e) {
      console.log('  Timeout waiting for success URL. Current URL:', this.page.url());
    }
  }

  async verifySuccess() {
    const finalUrl = this.page.url();
    console.log(`  Final URL: ${finalUrl}`);
    expect(finalUrl).toContain('success');
    console.log('✅ Journey Complete! Order placed successfully.');
  }

  async printOrderHash() {
    console.log('Step 13: Printing span elements starting with "#"...');
    try {
      const hashSpans = this.page.locator('//span[starts-with(normalize-space(), \"#\")]');
      const count = await hashSpans.count();
      console.log(`  Found ${count} span(s) starting with '#':`);
      for (let i = 0; i < count; i++) {
        const text = await hashSpans.nth(i).innerText();
        console.log(`  [${i + 1}] ${text.trim()}`);
      }
    } catch (e) {
      console.log(`  Could not retrieve hash spans: ${e.message.split('\n')[0]}`);
    }
  }
  async waitForCheckoutToLoad() {
  console.log('Waiting for checkout to stabilize...');

  await this.page.waitForURL(/onepagecheckout/, { timeout: 15000 });

  await this.page.getByRole('heading', { name: 'Payment Method' })
    .waitFor({ timeout: 40000 });

  await this.page.waitForSelector('iframe[src*="stripe"]', {
    timeout: 40000
  });

  console.log('✅ Checkout ready');
}
}

module.exports = { CheckoutPage };