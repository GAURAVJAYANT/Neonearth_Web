// tests/Fabrics.spec.js

const { test } = require('@playwright/test');
const fabricsData = require('../data/FabricsData');

const { FabricsHomePage } = require('../pages/FabricsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('Fabrics E2E', () => {
  test.setTimeout(600000);

  test('Warmup - Initialize browser and menu', async ({ page }) => {
    const homePage = new FabricsHomePage(page);
    await homePage.open();
    
    // Actually trigger the menu to "warm up" the Javascript/CSS
    await homePage.menu.waitFor({ state: 'visible', timeout: 15000 });
    await homePage.menu.hover();
    await page.waitForTimeout(2000);
    
    console.log('🔥 Warmup complete: Menu initialized and site is ready.');
  });

  // Run all Fabrics categories + products
  fabricsData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `Fabric - ${cat.category} → ${product}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product}`
          );

          // Fabrics uses ProductPage only
          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new FabricsHomePage(page),
            productPage,
            cartPage: new CartPage(page),
            checkoutPage: new CheckoutPage(page),
            item: {
              category: cat.category,
              product: product
            }
          });

          console.log(
            `✅ Completed: ${cat.category} → ${product}`
          );
        }
      );
    });
  });
});