// tests/Fabrics.spec.js

const { test } = require('@playwright/test');
const NewTapestryData = require('../data/NewTapestryData');

const { NewTapestryHomePage } = require('../pages/NewTapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('All Product Tapestry E2E', () => {
  test.setTimeout(600000);

  // Run all Fabrics categories + products
  NewTapestryData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `New Tapestry - ${cat.category} → ${product.name}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product.name}`
          );

          // NewTapestry uses ProductPage only
          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new NewTapestryHomePage(page),
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