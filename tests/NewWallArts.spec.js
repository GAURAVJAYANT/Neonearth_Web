// tests/Fabrics.spec.js

const { test } = require('@playwright/test');
const NewWallArtsData = require('../data/NewWallArtsData');

const { NewWallArtsHomePage } = require('../pages/NewWallArtsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('All New Wall Arts E2E', () => {
  test.setTimeout(600000);

  // Run all Wall Arts categories + products
  NewWallArtsData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `New Wall Arts - ${cat.category} → ${product.name}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product.name}`
          );

          // NewTapestry uses ProductPage only
          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new NewWallArtsHomePage(page),
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