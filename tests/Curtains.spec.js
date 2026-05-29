// tests/Curtains.spec.js

const { test } = require('@playwright/test');
const curtainsData = require('../data/curtainsData');

const { CurtainsHomePage } = require('../pages/CurtainsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

const fileType = require('../data/fileList');


test.describe('Curtains E2E', () => {
  test.describe.configure({ retries: 2 });
  test.setTimeout(300000);

  const fileForThisTest = fileType[2];


  curtainsData
    .filter(cat => !cat.category.includes('Custom Drapes'))
    .forEach((cat) => {
      cat.products.forEach((product) => {
        test(`Curtain - ${cat.category} -> ${product}`, async ({ page }) => {
          console.log(`Running: ${cat.category} -> ${product}`);

          const waitForFullLoadBeforePersonalize =
            (cat.category === 'Blackout Curtains' && product === '100% Blackout') ||
            cat.category === 'Sheer Curtains' ||
            cat.category === 'Indoor Roller Shades';

          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new CurtainsHomePage(page),
            productPage,
            cartPage: new CartPage(page),
            checkoutPage: new CheckoutPage(page),
            item: {
              category: cat.category,
              product,
              waitForFullLoadBeforePersonalize
            },
            file: fileForThisTest
          });

          console.log(`Completed: ${cat.category} -> ${product}`);
        });
      });
    });
});
