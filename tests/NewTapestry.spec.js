const { test } = require('../utils/fixtures');
const NewTapestryData = require('../data/NewTapestryData');
const { completeFlow } = require('../flows/completeFlow');

const fileList = require('../data/fileList');

test.describe('All Product Tapestry E2E', () => {
  test.describe.configure({ retries: 2 });
  test.setTimeout(300000);


  const fileForThisTest = fileList[1];

  NewTapestryData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(`New Tapestry - ${cat.category} -> ${product.name}`, async ({ page, newTapestryHomePage, productPage, cartPage, checkoutPage }) => {
        console.log(`Running: ${cat.category} -> ${product.name}`);

        await completeFlow({
          page,
          homePage: newTapestryHomePage,
          productPage,
          cartPage,
          checkoutPage,
          item: {
            ...product,
            category: cat.category,
            product: product.name,
            applyCoupon: true
          },
          file: fileForThisTest
        });

        console.log(`Completed: ${cat.category} -> ${product.name}`);
      });
    });
  });
});
