const { test } = require('@playwright/test');
const { chromium } = require('playwright');
const { NewTapestryHomePage } = require('../pages/NewTapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://ne.signsigma.com/tapestries/custom-tapestry');
  
  // click personalize
  await page.getByRole('button', { name: /Personalize Design/i }).first().waitFor({ state: 'visible', timeout: 60000 }).catch(e => console.log("Timeout personalize:", e.message));
  await page.getByRole('button', { name: /Personalize Design/i }).first().click();
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await fileInput.setInputFiles('data/test_image.png');
  await page.waitForTimeout(4000);
  await page.getByRole('button', { name: /Add to Cart/i }).first().click();
  await page.waitForURL('**/checkout/cart', { timeout: 30000 });
  
  await page.waitForTimeout(5000);
  
  const cartPage = new CartPage(page);
  await cartPage.handleCoupons();
  
  const price1 = await cartPage.getCartPrice();
  const disc1 = await cartPage.getDiscountPrice();
  console.log("Qty 1:", price1, disc1);
  
  await cartPage.updateQuantity(2);
  const price2 = await cartPage.getCartPrice();
  const disc2 = await cartPage.getDiscountPrice();
  console.log("Qty 2:", price2, disc2);
  
  const subtotalHtml = await page.locator('.summaryTotal').innerHTML().catch(() => '');
  console.log("Subtotal HTML:", subtotalHtml);
  
  await browser.close();
})();
