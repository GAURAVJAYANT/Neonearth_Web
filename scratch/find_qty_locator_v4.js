const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://ne.signsigma.com/checkout/cart');
  await page.waitForTimeout(5000);

  const locators = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('button, a, input, span').forEach(el => {
      const label = el.getAttribute('aria-label') || '';
      const title = el.getAttribute('title') || '';
      const text = el.innerText || '';
      const className = el.className || '';
      if (/qty|quantity|plus|add|increase/i.test(label + title + text + className)) {
        results.push({ tag: el.tagName, text, label, title, class: className });
      }
    });
    return results;
  });

  console.log(JSON.stringify(locators, null, 2));

  await browser.close();
})();
