const { test } = require('@playwright/test');
const NewWallArtsData = require('../data/NewWallArtsData');

const { NewWallArtsHomePage } = require('../pages/NewWallArtsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { completeFlow } = require('../flows/completeFlow');
const fileList = require('../data/fileList');

const wallArtsCases = NewWallArtsData.flatMap((categoryData, categoryIndex) =>
  categoryData.products.map((product, productIndex) => ({
    category: categoryData.category,
    product,
    categoryIndex,
    productIndex
  }))
);

test.describe('All New Wall Arts E2E', () => {
  test.setTimeout(350000);
  
  const fileForThisTest = fileList[2];
  

  for (const { category, product, categoryIndex, productIndex } of wallArtsCases) {
    test(`New Wall Arts - ${category} -> ${product.name} #${categoryIndex + 1}.${productIndex + 1}`, async ({ page }) => {
      console.log(`Running: ${category} -> ${product.name}`);

      await completeFlow({
        page,
        homePage: new NewWallArtsHomePage(page),
        productPage: new ProductPage(page),
        cartPage: new CartPage(page),
        checkoutPage: new CheckoutPage(page),
        item: {
          ...product,
          category,
          product: product.name
        },
        file: fileForThisTest
      });

      console.log(`Completed: ${category} -> ${product.name}`);
    });
  }
});
