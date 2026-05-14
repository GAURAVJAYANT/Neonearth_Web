const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to cart directly...');
  await page.goto('https://ne.signsigma.com/checkout/cart'); // Using staging URL
  await page.waitForTimeout(5000);

  console.log('Searching for plus/increase elements...');
  const elements = await page.locator('button, a, span, div, i').all();
  for (const el of elements) {
    const text = await el.innerText().catch(() => '');
    const className = await el.getAttribute('class').catch(() => '');
    const html = await el.evaluate(node => node.outerHTML).catch(() => '');
    
    if (text.includes('+') || className.includes('plus') || className.includes('qty') || html.includes('quantity')) {
       console.log(`Tag: ${await el.evaluate(node => node.tagName)}, Text: "${text}", Class: "${className}"`);
    }
  }

  await browser.close();
})();
