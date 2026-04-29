// tests/Petzone.spec.js

const { test } = require('@playwright/test');
const petZoneData = require('../data/PetZoneData');

const { PetZoneHomePage } = require('../pages/PetZonePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('Pet Zone E2E', () => {
  test.setTimeout(600000);

  test('Warmup - Initialize browser and menu', async ({ page }) => {
    const homePage = new PetZoneHomePage(page);
    await homePage.open();
    await homePage.menu.waitFor({ state: 'visible', timeout: 15000 });
    await homePage.menu.hover();
    await page.waitForTimeout(2000);
    console.log('🔥 Warmup complete: Menu initialized.');
  });

  // Run all Pet Zone categories + products
  petZoneData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `Pet Zone - ${cat.category} → ${product}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product}`
          );

          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new PetZoneHomePage(page),
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