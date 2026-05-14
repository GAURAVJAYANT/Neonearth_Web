const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://ne.signsigma.com/checkout/cart');
  await page.waitForTimeout(5000);

  const plusButtons = await page.locator('button, a, span').evaluateAll(els => 
    els.filter(el => el.innerText.includes('+') || el.className.includes('plus') || el.className.includes('qty'))
       .map(el => ({ tag: el.tagName, text: el.innerText, class: el.className, html: el.outerHTML }))
  );

  console.log(JSON.stringify(plusButtons, null, 2));

  await browser.close();
})();
