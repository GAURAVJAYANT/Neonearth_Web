// tests/openWebsite.spec.js
const { test, expect } = require('@playwright/test');

test('Open NeonEarth Website - Hover and Click Velvet Satin', async ({ page }) => {
  // Open website
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 90000 
  });

  await expect(page).toHaveURL('/');
  console.log('✅ Website opened successfully');

  // Step 1: Target Tapestries nav menu using exact HTML structure
  const menu = page.locator('nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text', { hasText: 'Tapestries' });
  await menu.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Tapestries menu found');

  // Step 2: Hover using boundingBox for precise mouse movement
  const menuBox = await menu.boundingBox();
  await page.mouse.move(menuBox.x + menuBox.width / 2, menuBox.y + menuBox.height / 2);
  await page.waitForTimeout(800); // Wait for dropdown to animate open
  console.log('✅ Mouse hovered over Tapestries');

  // Step 3: Wait for dropdown to appear
  const dropdown = page.locator('div.dropdown.open div.mega-menu-container');
  await dropdown.waitFor({ state: 'visible', timeout: 9000 });
  console.log('✅ Dropdown is visible');

  // Step 4: Click "Custom Wall Tapestry - Velvet Satin" using span.product-text
  const velvetSatin = page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' });
  await velvetSatin.waitFor({ state: 'visible', timeout: 9000 });
  await velvetSatin.click();
  console.log('✅ Clicked Custom Wall Tapestry - Velvet Satin');

  // Step 5: Assert navigation to product page
  await expect(page).toHaveURL(/custom-wall-tapestry-p/i);
  console.log('✅ Navigated to Velvet Satin product page');

  // Take screenshot
  await page.screenshot({ path: 'screenshots/velvet-satin-page.png' });
  console.log('✅ Screenshot saved');

  await page.waitForTimeout(2000);

  const personalisebtn = page.getByRole('img', { name: 'paintBrush' });
  await personalisebtn.waitFor({ state: 'visible', timeout: 10000 });
  await personalisebtn.click();
  console.log('✅ Clicked Personalise this Design');

  await page.waitForTimeout(8000);

  const uploadbtn = page.getByRole('button', { name: 'Personalize this Design' });
  await uploadbtn.waitFor({ state: 'visible', timeout: 40000 });
  await uploadbtn.click();
  console.log('✅ Clicked Personalize this Design');

  await page.waitForTimeout(4000);

  const uploadYourDesignBtn = page.getByRole('button', { name: 'Upload Your Design' });
  await uploadYourDesignBtn.waitFor({ state: 'visible', timeout: 20000 });
  await uploadYourDesignBtn.click();
  console.log('✅ Clicked Upload Your Design');

  await page.waitForTimeout(4000);

  const uploadfile = page.getByText('Browse Files');
  await uploadfile.waitFor({ state: 'visible', timeout: 50000 });
  
  // Use Promise.all to catch the filechooser event triggered by the click
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    uploadfile.click(),
  ]);
  
  const testImagePath = 'data/test_image.png';
  await fileChooser.setFiles(testImagePath);
  console.log(`✅ File uploaded successfully from: ${testImagePath}`);

  // Processing the Custom Design often takes a VERY long time on test servers
  await page.waitForTimeout(5000);

  const previewbtn = page.getByRole('button', { name: 'Preview' });
  await previewbtn.waitFor({ state: 'visible', timeout: 150000 }); // Wait up to 2.5 minutes
  await previewbtn.click();
  console.log('✅ Clicked preview button');

  await page.waitForTimeout(8000);

  const addtocartbtn = page.getByRole('button', { name: 'Add To Cart ($25.22)' }).nth(2);
  await addtocartbtn.waitFor({ state: 'visible', timeout: 10000 });
  await addtocartbtn.click();
  console.log('✅ Clicked add to cart button');

  // Let ATC processing completely finish. If we navigate away too early, the cart will remain empty.
  try {
      await page.waitForLoadState('networkidle', { timeout: 30000 });
  } catch (_) {}
  // Additional explicit wait for the backend session to update
  await page.waitForTimeout(8000);

  // New Code

  // Step 5: Go to Cart page and verify item is there
  console.log('Step 5: Navigating to cart...');
  await page.goto('/checkout/cart', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const cartContent = await page.content();
  const isEmpty = cartContent.includes('Your cart is empty');
  console.log(`  Cart is ${isEmpty ? 'EMPTY ❌' : 'populated ✅'}`);
  await page.waitForTimeout(2000);

  // Ensure cart background requests finish before trying to check out
  try { await page.waitForLoadState('networkidle', { timeout: 20000 }); } catch (_) {}
  await page.waitForTimeout(2000);

  // Dismiss any popups that might cover the Secure Checkout button
  try {
    const popupClose = page.locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close').first();
    if (await popupClose.isVisible({ timeout: 2000 })) {
      await popupClose.click({ force: true });
      console.log('  Dismissed popup on cart page');
    }
  } catch (e) {}

  // Step 6: Proceed to Secure Checkout
  console.log('Step 6: Clicking Secure Checkout...');

  // Locate the Secure Checkout button by its exact class and text
  const checkoutBtn = page.locator('button.btn.btnPrimary.btnBlock', { hasText: 'Secure Checkout' });
  await checkoutBtn.waitFor({ state: 'visible', timeout: 30000 });
  console.log('  Secure Checkout button is visible');

  // CRITICAL: Wait for the button to be ENABLED — it's temporarily disabled while
  // the cart recalculates shipping costs after page load
  await expect(checkoutBtn).toBeEnabled({ timeout: 30000 });
  console.log('  Secure Checkout button is enabled');

  await checkoutBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // RETRY LOOP: Keep clicking every 2s until the page actually navigates away from /cart
  // This handles the intermittent case where a single click is swallowed by the UI
  let navigated = false;
  for (let attempt = 1; attempt <= 8; attempt++) {
    console.log(`  Click attempt #${attempt}...`);
    await checkoutBtn.evaluate(node => node.click());
    try {
      await page.waitForURL(
        url => url.href.includes('/checkout') && !url.href.includes('cart'),
        { timeout: 4000 }
      );
      navigated = true;
      console.log('  ✅ Navigation confirmed after attempt #' + attempt + ': ' + page.url());
      break;
    } catch (_) {
      // Not navigated yet — loop again
      if (attempt < 8) {
        // Re-check the button is still enabled before next attempt
        try { await expect(checkoutBtn).toBeEnabled({ timeout: 2000 }); } catch (_) {}
      }
    }
  }
  if (!navigated) {
    console.log('⚠️ All click attempts failed. Falling back to direct URL navigation...');
    await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  // Wait for checkout page to fully load before filling form
  try { await page.waitForLoadState('networkidle', { timeout: 20000 }); } catch (_) {}
  await page.waitForTimeout(3000);
  console.log('  Checkout page URL: ' + page.url());

  // Step 7: Fill in shipping details using ID-based locators (most reliable)
  // The form starts with First Name — email field only appears for new guest sessions
  console.log('Step 7: Filling shipping form...');

  // Email — optional, only shown for guest sessions (skip gracefully if absent)
  try {
    const emailInput = page.locator('#email');
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.triple_click?.() ?? await emailInput.click({ clickCount: 3 });
      await emailInput.fill('test@yopmail.com');
      console.log('  Filled email');
    } else {
      console.log('  Email field not present (guest session already tracked)');
    }
  } catch (e) { console.log('  Email field skipped: ' + e.message.split('\n')[0]); }

  // First Name
  const fNameInput = page.locator('#firstname');
  await fNameInput.waitFor({ state: 'visible', timeout: 20000 });
  await fNameInput.click({ clickCount: 3 });
  await fNameInput.fill('Gaurav');
  console.log('  Filled First Name');

  // Last Name
  const lNameInput = page.locator('#lastname');
  await lNameInput.waitFor({ state: 'visible', timeout: 5000 });
  await lNameInput.click({ clickCount: 3 });
  await lNameInput.fill('Jayant');
  console.log('  Filled Last Name');

  // Mobile Number
  const phoneInput = page.locator('#telephone');
  await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
  await phoneInput.click({ clickCount: 3 });
  await phoneInput.fill('88888888888');
  console.log('  Filled Mobile Number');

  // Company Name (optional)
  try {
    const companyInput = page.locator('#company');
    if (await companyInput.isVisible({ timeout: 2000 })) {
      await companyInput.click({ clickCount: 3 });
      await companyInput.fill('QA Automation');
    }
  } catch (e) {}

  // Step 8: Fill in address
  console.log('Step 8: Filling address...');
  const addressInput = page.locator('#street_1, input[name="street[0]"], #street0').first();
  await addressInput.waitFor({ state: 'visible', timeout: 10000 });
  await addressInput.click({ clickCount: 3 });
  await addressInput.fill('123 Main Street');
  console.log('  Filled Address');
  await page.waitForTimeout(1000);

  // Apartment (optional)
  try {
    const aptInput = page.locator('#street_2, input[name="street[1]"], #street1').first();
    if (await aptInput.isVisible({ timeout: 2000 })) {
      await aptInput.click({ clickCount: 3 });
      await aptInput.fill('hno 31');
    }
  } catch (e) {}

  // Postcode — clear any auto-detected value then fill
  const postcodeInput = page.locator('#postcode');
  await postcodeInput.waitFor({ state: 'visible', timeout: 5000 });
  await postcodeInput.click({ clickCount: 3 });
  await postcodeInput.fill('10001');
  await postcodeInput.press('Tab');
  console.log('  Filled Postcode');
  await page.waitForTimeout(1000);

  // City — clear any auto-detected value then fill
  const cityInput = page.locator('#city');
  await cityInput.waitFor({ state: 'visible', timeout: 5000 });
  await cityInput.click({ clickCount: 3 });
  await cityInput.fill('New York');
  console.log('  Filled City');
  await page.waitForTimeout(1000);

  // Step 9: Fill Stripe payment fields (dynamic iframe name — use prefix match)
  console.log('Step 9: Filling Stripe payment info...');
  try {
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4111 1111 1111 1111');
    await stripeFrame.getByRole('textbox', { name: /Expiration date/i }).fill('12 / 27');
    await stripeFrame.getByRole('textbox', { name: /Security code/i }).fill('123');
    console.log('  Stripe fields filled successfully');
  } catch (e) {
    console.log(`  Stripe iframe error: ${e.message.split('\n')[0]}`);
  }

  // Step 10: Place order
  console.log('Step 10: Clicking Pay Now...');
  await page.getByRole('button', { name: /Pay Now/i }).click();
  
  // Wait dynamically for the checkout success page (payment processing can take 10-20 seconds on test servers)
  console.log('  Waiting for payment processing and success redirect...');
  try {
    await page.waitForURL(/success/i, { timeout: 120000 });
  } catch (e) {
    console.log('  Timeout waiting for success URL. Current URL:', page.url());
  }

  // Step 11: Verify success
  const finalUrl = page.url();
  console.log(`  Final URL: ${finalUrl}`);
  expect(finalUrl).toContain('success');
  console.log('✅ Journey Complete! Order placed successfully.');
  // 🔥 FINAL WAIT (IMPORTANT)
  console.log('Waiting 30 seconds to view order number...');
  await page.waitForTimeout(20000);

  // Step 12: Close any popup that appeared after order placement
  console.log('Step 12: Closing any popup if visible...');
  try {
    const popupClose = page.locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close').first();
    if (await popupClose.isVisible({ timeout: 3000 })) {
      await popupClose.click({ force: true });
      console.log('  Popup closed successfully.');
    } else {
      console.log('  No popup visible.');
    }
  } catch (e) {
    console.log('  No popup to close or already closed.');
  }

  // Step 13: Print text of all span elements whose text starts with '#'
  console.log('Step 13: Printing span elements starting with "#"...');
  try {
    const hashSpans = page.locator('//span[starts-with(normalize-space(), \"#\")]');
    const count = await hashSpans.count();
    console.log(`  Found ${count} span(s) starting with '#':`);
    for (let i = 0; i < count; i++) {
      const text = await hashSpans.nth(i).innerText();
      console.log(`  [${i + 1}] ${text.trim()}`);
    }
  } catch (e) {
    console.log(`  Could not retrieve hash spans: ${e.message.split('\n')[0]}`);
  }

  // Step 14: Wait 10 seconds before browser closes
  console.log('Waiting 10 seconds before browser closes...');
  await page.waitForTimeout(10000);
  console.log('✅ All steps complete. Browser closing.');


  // Wait 20 seconds then browser auto closes
  await page.waitForTimeout(20000);
  console.log('✅ 20 seconds done – browser closing');

});
