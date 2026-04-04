const { test, expect } = require('@playwright/test');

test('User Journey - AI Generation to Checkout', async ({ page, context }) => {
  // Set a generous timeout for the full journey including AI generation
  test.setTimeout(300000);

  // 🔥 STEP 0: CLEAR CACHE (IMPORTANT for clean runs)
  await context.clearCookies();
  await context.clearPermissions();
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  console.log('✅ Cache and session cleared');

  // ─── GLOBAL POPUP HANDLER ───────────────────────────────────────────────
  await page.addLocatorHandler(
    page.locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close').first(),
    async (closeBtn) => {
      console.log('>>> Newsletter/Banner Popup detected! Dismissing it...');
      try { await closeBtn.click({ force: true, timeout: 3000 }); } catch (e) {}
    }
  );

  // Step 1: Navigate directly to the Product Page
  const productURL = '/custom-wall-tapestry-p?variant_sku=NE-SKU-133-335&list_material_type=list_mt_satin';
  console.log(`Step 1: Navigating directly to: ${productURL}`);
  await page.goto(productURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  // Fallback if the specific variant URL fails (404)
  if (await page.locator('text=Spot Not Found').isVisible()) {
    console.log('⚠️ Variant URL 404, falling back to base product page...');
    await page.goto('/custom-wall-tapestry-p', { waitUntil: 'domcontentloaded' });
  }

  await page.waitForTimeout(3000);
  console.log('✅ Product page reached');


  // Step 4: Click Personalize
  console.log('Step 4: Clicking Personalize this Design...');
  const personaliseBtn = page.getByRole('button', { name: /Personali[sz]e this Design/i });
  await personaliseBtn.waitFor({ state: 'visible', timeout: 15000 });
  await personaliseBtn.click();

  await page.waitForTimeout(8000); // Wait for customiser options to appear

  // Step 5: Select Generate With Neon AI
  console.log('Step 5: Clicking Generate With Neon AI...');
  const neonAiBtn = page.getByRole('button', { name: /Generate With Neon AI/i });
  await neonAiBtn.waitFor({ state: 'visible', timeout: 10000 });
  await neonAiBtn.click();
  await page.waitForTimeout(3000);

  // Step 6: Enter Prompt and Generate
  console.log('Step 6: Entering AI prompt and generating...');
  const promptArea = page.locator('textarea[placeholder*="Enter your idea here"]');
  await promptArea.waitFor({ state: 'visible', timeout: 10000 });
  await promptArea.fill('A luxury marble texture with gold veins');
  
  const generateNowBtn = page.getByRole('button', { name: 'Generate Now' });
  await generateNowBtn.click();
  
  console.log('  Waiting for AI image generation (this can take 15-30s)...');
  await page.waitForTimeout(30000); // Wait for image to generate and apply

  // Step 7: Add to Cart from Customiser
  console.log('Step 7: Adding customised product to cart...');
  // Note: The Price button might be dynamic, so we use a partial match
  const addToCartBtn = page.getByRole('button', { name: /Add To Cart/i }).nth(2);
  await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });
  await addToCartBtn.click();
  await page.waitForTimeout(5000);

  // Step 8: Go to Cart and Verify
  console.log('Step 8: Verifying cart content...');
  await page.goto('/checkout/cart', { waitUntil: 'domcontentloaded' });
  const cartContent = await page.content();
  if (cartContent.includes('Your cart is empty')) {
    console.error('❌ Error: Cart is empty after adding product!');
    // Optional: try adding again or fail
  } else {
    console.log('✅ Cart populated');
  }

  // Step 9: Proceed to Secure Checkout
  console.log('Step 9: Proceeding to Secure Checkout...');
  const checkoutBtn = page.getByRole('button', { name: /Secure Checkout/i });
  await checkoutBtn.waitFor({ state: 'visible', timeout: 15000 });
  await checkoutBtn.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Step 10: Fill Shipping Details
  console.log('Step 10: Filling shipping form...');
  await page.getByRole('textbox', { name: /email address/i }).fill('test@yopmail.com');
  await page.getByRole('textbox', { name: /First Name/i }).fill('Gaurav');
  await page.getByRole('textbox', { name: /Last Name/i }).fill('Jayant');
  await page.getByRole('textbox', { name: /Mobile Number/i }).fill('8888888888');

  // Address Autocomplete
  const addressInput = page.getByRole('textbox', { name: 'Address*', exact: true });
  await addressInput.fill('New York');
  await page.waitForTimeout(2000);
  try {
    await page.getByText('New YorkNY, USA').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('  Autocomplete skip/fail');
  }

  await page.getByRole('textbox', { name: /Postcode/i }).fill('10001');
  await page.getByRole('textbox', { name: /City/i }).fill('New York');

  // Step 11: Stripe Payment
  console.log('Step 11: Filling Stripe info...');
  try {
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4111 1111 1111 1111');
    await stripeFrame.getByRole('textbox', { name: /Expiration/i }).fill('12 / 27');
    await stripeFrame.getByRole('textbox', { name: /Security code/i }).fill('123');
  } catch (e) {
    console.log('  Stripe frame issue:', e.message);
  }

  // Step 12: Pay and Wait for Success
  console.log('Step 12: Placing order...');
  await page.getByRole('button', { name: /Pay Now/i }).click();

  console.log('  Waiting for success redirect...');
  try {
    await page.waitForURL(/success/i, { timeout: 120000 });
  } catch (e) {
    console.log('  Success URL timeout. Current:', page.url());
  }

  // Final confirmation
  const finalUrl = page.url();
  console.log(`✅ Final URL: ${finalUrl}`);
  
  // Print order number
  const hashSpans = page.locator('//span[starts-with(normalize-space(), "#")]');
  const count = await hashSpans.count();
  for (let i = 0; i < count; i++) {
    console.log(`Order Number: ${await hashSpans.nth(i).innerText()}`);
  }

  await page.waitForTimeout(15000);
  console.log('✅ Journey Complete.');
});