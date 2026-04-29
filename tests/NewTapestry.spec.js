// tests/NewTapestry.spec.js

const { test } = require('@playwright/test');
const NewTapestryData = require('../data/NewTapestryData');

const { NewTapestryHomePage } = require('../pages/NewTapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('New Tapestry E2E', () => {
  test.setTimeout(600000);

  // ── WARMUP TEST ──
  // Ensures the mega menu scripts are initialized before running real tests
  test('Warmup - Initialize Mega Menu', async ({ page }) => {
    console.log('🚀 Running warmup to initialize mega menu...');
    const homePage = new NewTapestryHomePage(page);
    await homePage.open();
    await homePage.menu.waitFor({ state: 'visible' });
    await homePage.menu.hover();
    await page.waitForTimeout(3000);
    console.log('✅ Warmup complete.');
  });

  // Run all Tapestry categories + products
  NewTapestryData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `New Tapestry - ${cat.category} → ${product}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product}`
          );

          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new NewTapestryHomePage(page),
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
