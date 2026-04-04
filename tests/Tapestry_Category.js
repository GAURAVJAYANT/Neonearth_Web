// tests/openWebsite.spec.js
const { test, expect } = require('@playwright/test');

test('Open NeonEarth Website - Hover and Click Velvet Satin', async ({ page }) => {
  // Open website
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
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
  await dropdown.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ Dropdown is visible');

  // Step 4: Click "Custom Wall Tapestry - Velvet Satin" using span.product-text
  const velvetSatin = page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' });
  await velvetSatin.waitFor({ state: 'visible', timeout: 5000 });
  await velvetSatin.click();
  console.log('✅ Clicked Custom Wall Tapestry - Velvet Satin');

  // Step 5: Assert navigation to product page
  await expect(page).toHaveURL(/custom-wall-tapestry-p/i);
  console.log('✅ Navigated to Velvet Satin product page');

  // Take screenshot
  await page.screenshot({ path: 'screenshots/velvet-satin-page.png' });
  console.log('✅ Screenshot saved');

  await page.waitForTimeout(2000);

  const personalisebtn = page.getByRole('button', { name: 'Personalise this Design' });
  await personalisebtn.waitFor({ state: 'visible', timeout: 10000 });
  await personalisebtn.click();
  console.log('✅ Clicked Personalise this Design');

  await page.waitForTimeout(8000);

  const uploadbtn = page.getByRole('button', { name: 'plus Upload Your Design' });
  await uploadbtn.waitFor({ state: 'visible', timeout: 10000 });
  await uploadbtn.click();
  console.log('✅ Clicked Upload');

  await page.waitForTimeout(8000);

  const uploadfile = page.getByText('Browse Files');
  await uploadfile.waitFor({ state: 'visible', timeout: 10000 });
  
  // Use Promise.all to catch the filechooser event triggered by the click
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    uploadfile.click(),
  ]);
  
  const testImagePath = 'data/test_image.png';
  await fileChooser.setFiles(testImagePath);
  console.log(`✅ File uploaded successfully from: ${testImagePath}`);

  await page.waitForTimeout(13000);

  const previewbtn = page.getByRole('button', { name: 'Preview' });
  await previewbtn.waitFor({ state: 'visible', timeout: 10000 });
  await previewbtn.click();
  console.log('✅ Clicked preview button');

  await page.waitForTimeout(8000);

  const addtocartbtn = page.getByRole('button', { name: 'Add To Cart ($25.22)' }).nth(2);
  await addtocartbtn.waitFor({ state: 'visible', timeout: 10000 });
  await addtocartbtn.click();
  console.log('✅ Clicked add to cart button');

  await page.waitForTimeout(4000);

  // New Code

  // Step 5: Go to Cart page and verify item is there
  console.log('Step 5: Navigating to cart...');
  await page.goto('/checkout/cart', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const cartContent = await page.content();
  const isEmpty = cartContent.includes('Your cart is empty');
  console.log(`  Cart is ${isEmpty ? 'EMPTY ❌' : 'populated ✅'}`);

  // Step 6: Proceed to Secure Checkout
  console.log('Step 6: Clicking Secure Checkout...');
  const checkoutBtn = page.getByRole('button', { name: /Secure Checkout/i });
  await checkoutBtn.waitFor({ state: 'visible', timeout: 15000 });
  await checkoutBtn.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Step 7: Fill in shipping details
  // Explicitly wait for the form locators to be visible before filling to prevent race conditions
  console.log('Step 7: Filling shipping form...');
  const emailInput = page.getByRole('textbox', { name: /email address/i });
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill('test@yopmail.com');

  const fNameInput = page.getByRole('textbox', { name: /First Name/i });
  await fNameInput.waitFor({ state: 'visible', timeout: 5000 });
  await fNameInput.fill('Gaurav');

  const lNameInput = page.getByRole('textbox', { name: /Last Name/i });
  await lNameInput.waitFor({ state: 'visible', timeout: 5000 });
  await lNameInput.fill('Jayant');

  const phoneInput = page.getByRole('textbox', { name: /Mobile Number/i });
  await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
  await phoneInput.fill('88888888888');

  try { 
    const companyInput = page.getByRole('textbox', { name: /Company Name/i });
    if (await companyInput.isVisible({ timeout: 2000 })) {
      await companyInput.fill('QA Automation'); 
    }
  } catch (e) {}

  // Step 8: Fill in address with autocomplete
  console.log('Step 8: Filling address...');
  const addressInput = page.getByRole('textbox', { name: 'Address*', exact: true });
  await addressInput.waitFor({ state: 'visible', timeout: 10000 });
  await addressInput.fill('New York');
  await page.waitForTimeout(2000);
  
  try {
    await page.getByText('New YorkNY, USA').click({ timeout: 5000 });
    console.log('  Selected autocomplete suggestion');
    await page.waitForTimeout(1500);
  } catch (e) {
    console.log('  Autocomplete not available, continuing...');
  }
  
  try { 
    const aptInput = page.getByRole('textbox', { name: /Apartment/i });
    if (await aptInput.isVisible({ timeout: 2000 })) {
      await aptInput.fill('hno 31'); 
    }
  } catch (e) {}

  const postcodeInput = page.getByRole('textbox', { name: /Postcode/i });
  await postcodeInput.waitFor({ state: 'visible', timeout: 5000 });
  await postcodeInput.fill('10001');

  const cityInput = page.getByRole('textbox', { name: /City/i });
  await cityInput.waitFor({ state: 'visible', timeout: 5000 });
  await cityInput.fill('New York');
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
    const hashSpans = page.locator('//span[starts-with(normalize-space(), \'#\')]');
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
  console.log('✅ 20 seconds done — browser closing');

  
});

test('Open NeonEarth Website - ', async ({ page }) => {
  // Open website
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
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
  await dropdown.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ Dropdown is visible');

  // Step 4: Click "Custom Wall Tapestry - Velvet Satin" using span.product-text
  const velvetSatin = page.locator('span.product-text', { hasText: 'Custom Wall Tapestry - Velvet Satin' });
  await velvetSatin.waitFor({ state: 'visible', timeout: 5000 });
  await velvetSatin.click();
  console.log('✅ Clicked Custom Wall Tapestry - Velvet Satin');

  // Step 5: Assert navigation to product page
  await expect(page).toHaveURL(/custom-wall-tapestry-p/i);
  console.log('✅ Navigated to Velvet Satin product page');
});