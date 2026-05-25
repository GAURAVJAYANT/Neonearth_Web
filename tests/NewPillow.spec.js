// tests/NewPillow.spec.js

const { test } = require('@playwright/test');
const NewPillowData = require('../data/NewPillowData');

const { NewPillowHomePage } = require('../pages/NewPillowHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('All Product Pillow E2E', () => {
  test.describe.configure({ retries: 2 });
  test.setTimeout(600000);

  NewPillowData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(`New Pillow - ${cat.category} -> ${product.name}`, async ({ page }) => {
        console.log(`Running: ${cat.category} -> ${product.name}`);

        await completeFlow({
          page,
          homePage: new NewPillowHomePage(page),
          productPage: new ProductPage(page),
          cartPage: new CartPage(page),
          checkoutPage: new CheckoutPage(page),
          item: {
            ...product,
            category: cat.category,
            product: product.name,
            applyCoupon: true,
          },
        });

        console.log(`Completed: ${cat.category} -> ${product.name}`);
      });
    });
  });
});
