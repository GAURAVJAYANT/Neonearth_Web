


// tests/NewPillows.spec.js

const { test } = require('@playwright/test');
const pillowsData = require('../data/pillowsData');

const { PillowHomePage } = require('../pages/PillowHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { completeFlow } = require('../flows/completeFlow');

const fileType = require('../data/fileList');


test.describe('Pillows E2E', () => {
  test.setTimeout(600000);

  // Select a File from list of Files 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
  const fileForThisTest = fileType[2];

  // Run all Fabrics categories + products
  pillowsData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `Pillows - ${cat.category} → ${product}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product} (file: ${fileForThisTest})`
          );

          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new PillowHomePage(page),
            productPage,
            cartPage: new CartPage(page),
            checkoutPage: new CheckoutPage(page),
            item: {
              category: cat.category,
              product: product
            },
            file: fileForThisTest,
          });

          console.log(
            `✅ Completed: ${cat.category} → ${product} (file: ${fileForThisTest})`
          );
        }
      );
    });
  });
});