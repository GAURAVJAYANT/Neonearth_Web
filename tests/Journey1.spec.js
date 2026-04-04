const { test, expect } = require('@playwright/test');

test('Open NeonEarth Website - Full Journey with Cache Clear', async ({ page, context }) => {

  // 🔥 STEP 0: CLEAR CACHE (IMPORTANT)
  await context.clearCookies();
  await context.clearPermissions();

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  console.log('✅ Cache cleared successfully');

  // Open website
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });

  await expect(page).toHaveURL('/');
  console.log('✅ Website opened successfully');

  // Step 1: Menu
  const menu = page.locator(
    'nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text',
    { hasText: 'Tapestries' }
  );

  await menu.waitFor({ state: 'visible', timeout: 10000 });

  const menuBox = await menu.boundingBox();
  await page.mouse.move(
    menuBox.x + menuBox.width / 2,
    menuBox.y + menuBox.height / 2
  );

  await page.waitForTimeout(800);

  // Step 2: Dropdown
  const dropdown = page.locator('div.dropdown.open div.mega-menu-container');
  await dropdown.waitFor({ state: 'visible', timeout: 5000 });

  // Step 3: Click Product
  const velvetSatin = page.locator('span.product-text', {
    hasText: 'Custom Wall Tapestry - Velvet Satin',
  });

  await velvetSatin.waitFor({ state: 'visible', timeout: 5000 });
  await velvetSatin.click();

  await expect(page).toHaveURL(/custom-wall-tapestry-p/i);

  // Screenshot
  await page.screenshot({ path: 'screenshots/velvet-satin-page.png' });

  // Step 4: Personalise
  const personalisebtn = page.getByRole('button', { name: 'Personalise this Design' });
  await personalisebtn.waitFor({ state: 'visible', timeout: 10000 });
  await personalisebtn.click();

  await page.waitForTimeout(8000);

  // Upload
  const uploadbtn = page.getByRole('button', { name: 'plus Upload Your Design' });
  await uploadbtn.click();

  await page.waitForTimeout(8000);

  const uploadfile = page.getByText('Browse Files');

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    uploadfile.click(),
  ]);

  await fileChooser.setFiles('data/test_image.png');

  await page.waitForTimeout(13000);

  // Preview
  await page.getByRole('button', { name: 'Preview' }).click();

  await page.waitForTimeout(8000);

  // Add to Cart
  const addtocartbtn = page.getByRole('button', { name: 'Add To Cart ($25.22)' }).nth(2);
  await addtocartbtn.click();

  await page.waitForTimeout(4000);

  // Cart
  await page.goto('/checkout/cart', { waitUntil: 'domcontentloaded' });

  const cartContent = await page.content();
  console.log(cartContent.includes('Your cart is empty') ? '❌ Cart Empty' : '✅ Cart OK');

  // Checkout
  await page.getByRole('button', { name: /Secure Checkout/i }).click();
  await page.waitForLoadState('domcontentloaded');

  // Form Fill
  await page.getByRole('textbox', { name: /email/i }).fill('test@yopmail.com');
  await page.getByRole('textbox', { name: /First Name/i }).fill('Gaurav');
  await page.getByRole('textbox', { name: /Last Name/i }).fill('Jayant');
  await page.getByRole('textbox', { name: /Mobile/i }).fill('8888888888');

  // Address
  const addressInput = page.getByRole('textbox', { name: 'Address*', exact: true });
  await addressInput.fill('New York');

  try {
    await page.getByText('New YorkNY, USA').click();
  } catch {}

  await page.getByRole('textbox', { name: /Postcode/i }).fill('10001');
  await page.getByRole('textbox', { name: /City/i }).fill('New York');

  // Stripe Payment
  try {
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4111 1111 1111 1111');
    await stripeFrame.getByRole('textbox', { name: /Expiration/i }).fill('12 / 27');
    await stripeFrame.getByRole('textbox', { name: /Security code/i }).fill('123');

  } catch (e) {
    console.log('Stripe error:', e.message);
  }

  // Pay Now
  await page.getByRole('button', { name: /Pay Now/i }).click();

  try {
    await page.waitForURL(/success/i, { timeout: 120000 });
  } catch {}

  const finalUrl = page.url();
  expect(finalUrl).toContain('success');

  console.log('✅ Order placed successfully');

  // Order number print
  const hashSpans = page.locator('//span[starts-with(normalize-space(), "#")]');
  const count = await hashSpans.count();

  for (let i = 0; i < count; i++) {
    console.log(await hashSpans.nth(i).innerText());
  }

  await page.waitForTimeout(10000);

});