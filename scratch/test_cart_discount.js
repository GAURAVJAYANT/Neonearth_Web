const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://ne.signsigma.com/tapestries/custom-tapestry');
  
  // click personalize
  await page.getByRole('button', { name: /Personalize Design/i }).first().click();
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await fileInput.setInputFiles('data/test_image.png');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: /Add to Cart/i }).first().click();
  await page.goto('https://ne.signsigma.com/checkout/cart');
  
  await page.waitForTimeout(5000);
  
  // Handle coupons
  await page.getByText('Available Offers', { exact: true }).click();
  await page.waitForTimeout(2000);
  const code = await page.locator('span.code').first().innerText();
  await page.getByRole('textbox', { name: 'Enter Your Coupon Code' }).fill(code);
  await page.keyboard.press('Enter');
  
  await page.waitForTimeout(5000);
  
  // Print summary block
  const summaryHtml = await page.locator('.summaryTotal').innerHTML().catch(e => e.message);
  console.log("Summary HTML:", summaryHtml);
  
  // Print pricing
  const currentPriceStr = await page.locator('span.price').first().innerText();
  console.log("currentPriceStr (span.price first):", currentPriceStr);
  
  await browser.close();
})();
