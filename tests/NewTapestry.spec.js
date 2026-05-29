const { test } = require('../utils/fixtures');
const NewTapestryData = require('../data/NewTapestryData');
const { completeFlow } = require('../flows/completeFlow');

const tapestryCases = NewTapestryData.flatMap((categoryData) =>
  categoryData.products.map((product) => ({
    category: categoryData.category,
    product
  }))
);

test.describe('All Product Tapestry E2E', () => {
  test.describe.configure({ retries: 2 });
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