const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://ne.signsigma.com/');
  const menu = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Pillows"))');
  await menu.waitFor({ state: 'visible' });
  await menu.hover();
  await page.waitForTimeout(2000);
  const dropdown = page.locator('nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Pillows")) >> xpath=..//div[contains(@class, "megamenu") or contains(@class, "dropdown")]');
  const count = await dropdown.count();
  console.log(`Found ${count} dropdown(s)`);
  if (count > 0) {
    const className = await dropdown.first().getAttribute('class');
    console.log(`Dropdown class: ${className}`);
    const isVisible = await dropdown.first().isVisible();
    console.log(`Dropdown visible: ${isVisible}`);
  }
  await browser.close();
})();
