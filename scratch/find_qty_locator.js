const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to a product and add to cart to reach the cart page with items
  console.log('Navigating to a product...');
  await page.goto('https://www.neonearth.com/custom-wall-tapestries/wall-tapestry-velvet-satin.html');
  
  // Click personalize (approximate)
  console.log('Finding personalize button...');
  const personalize = page.locator('button:has-text("Personalize")').first();
  if (await personalize.isVisible()) {
    await personalize.click();
    await page.waitForTimeout(5000);
    
    console.log('Finding Add to Cart button...');
    const atc = page.locator('button:has-text("Add to Cart")').first();
    await atc.click({ force: true });
    await page.waitForTimeout(5000);
  }

  console.log('Navigating to cart...');
  await page.goto('https://www.neonearth.com/checkout/cart');
  await page.waitForTimeout(5000);

  console.log('Listing buttons on cart page...');
  const buttons = await page.locator('button, a, input').all();
  for (const btn of buttons) {
    const text = await btn.innerText().catch(() => '');
    const value = await btn.getAttribute('value').catch(() => '');
    const className = await btn.getAttribute('class').catch(() => '');
    const id = await btn.getAttribute('id').catch(() => '');
    console.log(`Tag: ${await btn.evaluate(node => node.tagName)}, Text: "${text}", Value: "${value}", Class: "${className}", ID: "${id}"`);
  }

  await browser.close();
})();
