const { test } = require('@playwright/test');
const NewTapestryData = require('../data/NewTapestryData');

const { NewTapestryHomePage } = require('../pages/NewTapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { completeFlow } = require('../flows/completeFlow');

const tapestryCases = NewTapestryData.flatMap((categoryData) =>
  categoryData.products.map((product) => ({
    category: categoryData.category,
    product
  }))
);

test.describe('All Product Tapestry E2E', () => {
  test.setTimeout(300000);

  for (const { category, product } of tapestryCases) {
    test(`New Tapestry - ${category} -> ${product.name}`, async ({ page }) => {
      console.log(`Running: ${category} -> ${product.name}`);

      await completeFlow({
        page,
        homePage: new NewTapestryHomePage(page),
        productPage: new ProductPage(page),
        cartPage: new CartPage(page),
        checkoutPage: new CheckoutPage(page),
        item: {
          ...product,
          category,
          product: product.name,
          applyCoupon: true
        }
      });

      console.log(`Completed: ${category} -> ${product.name}`);
    });
  }
});
