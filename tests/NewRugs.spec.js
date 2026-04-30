// tests/NewRugs.spec.js

const { test } = require('@playwright/test');
const NewRugsData = require('../data/NewRugsData');

const { NewRugsHomePage } = require('../pages/NewRugsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('New Rugs E2E', () => {
  test.setTimeout(600000);

  // Run all Rugs categories + products
  NewRugsData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `New Rugs - ${cat.category} → ${product.name}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product.name}`
          );

          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new NewRugsHomePage(page),
            productPage,
            cartPage: new CartPage(page),
            checkoutPage: new CheckoutPage(page),
            item: {
              category: cat.category,
              product: product.name
            }
          });

          console.log(
            `✅ Completed: ${cat.category} → ${product.name}`
          );
        }
      );
    });
  });
});