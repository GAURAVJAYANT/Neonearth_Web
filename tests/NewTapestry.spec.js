const { test } = require('@playwright/test');
const NewTapestryData = require('../data/NewTapestryData');

const { NewTapestryHomePage } = require('../pages/NewTapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { completeFlow } = require('../flows/completeFlow');

test.describe('All Product Tapestry E2E', () => {
  test.describe.configure({ retries: 2 });
  test.setTimeout(300000);

  NewTapestryData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(`New Tapestry - ${cat.category} -> ${product.name}`, async ({ page }) => {
        console.log(`Running: ${cat.category} -> ${product.name}`);

        await completeFlow({
          page,
          homePage: new NewTapestryHomePage(page),
          productPage: new ProductPage(page),
          cartPage: new CartPage(page),
          checkoutPage: new CheckoutPage(page),
          item: {
            ...product,
            category: cat.category,
            product: product.name,
            applyCoupon: true
          }
        });

        console.log(`Completed: ${cat.category} -> ${product.name}`);
      });
    });
  });
});
