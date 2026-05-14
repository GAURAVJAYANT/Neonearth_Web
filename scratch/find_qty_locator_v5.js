const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to staging product...');
  await page.goto('https://ne.signsigma.com/custom-wall-tapestries/wall-tapestry-velvet-satin.html');
  
  console.log('Adding to cart...');
  const atc = page.locator('button#product-addtocart-button').first(); // Common Magento ID
  if (await atc.isVisible()) {
      await atc.click();
      await page.waitForTimeout(5000);
  } else {
      // Try personalize first
      const p = page.locator('button:has-text("Personalize")').first();
      await p.click();
      await page.waitForTimeout(5000);
      await page.locator('button:has-text("Add to Cart")').first().click();
      await page.waitForTimeout(5000);
  }

  console.log('Navigating to cart...');
  await page.goto('https://ne.signsigma.com/checkout/cart');
  await page.waitForTimeout(5000);

  console.log('Dumping interactive elements...');
  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, input, span, div.qty'))
      .map(el => ({
        tag: el.tagName,
        text: el.innerText,
        class: el.className,
        id: el.id,
        title: el.getAttribute('title') || '',
        label: el.getAttribute('aria-label') || ''
      }))
      .filter(e => /qty|plus|\+|inc|add/i.test(e.text + e.class + e.id + e.title + e.label));
  });

  console.log(JSON.stringify(elements, null, 2));

  await browser.close();
})();
