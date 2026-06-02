
// tests/NewPillows.spec.js

const { test } = require('../utils/fixtures');
const pillowsData = require('../data/pillowsData');
const { completeFlow } = require('../flows/completeFlow');

const fileType = require('../data/fileList');


test.describe('Pillows E2E', () => {
  test.setTimeout(600000);

  // Select a File from list of Files 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
  const fileForThisTest = fileType[0];

  // Run all Fabrics categories + products
  pillowsData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `Pillows - ${cat.category} → ${product}`,
        async ({ page, newPillowHomePage, productPage, cartPage, checkoutPage }) => {
          console.log(
            `Running: ${cat.category} → ${product} (file: ${fileForThisTest})`
          );

          await completeFlow({
            page,
            homePage: newPillowHomePage,
            productPage,
            cartPage,
            checkoutPage,
            item: {
              category: cat.category,
              product: product,
              applyCoupon: true,
              selectStandardShippingAfterQuantity: true,
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
