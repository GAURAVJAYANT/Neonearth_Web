// tests/Curtains.spec.js

const { test } = require('@playwright/test');
const curtainsData = require('../data/curtainsData');

const { CurtainsHomePage } = require('../pages/CurtainsHomePage');
//const { CurtainsPDP } = require('../pages/CurtainsPDP');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('Curtains E2E', () => {
  test.setTimeout(600000);


  curtainsData
    .filter(cat => !cat.category.includes('Custom Drapes'))
    .forEach((cat) => {
      cat.products.forEach((product) => {
        test(
          `Curtain - ${cat.category} → ${product}`,
          async ({ page }) => {
            console.log(
              `Running: ${cat.category} → ${product}`
            );

            let productPage;

            // Only Custom Drapes → CurtainsPDP
            if (cat.category.includes('Custom Drapes')) {
              productPage = new CurtainsPDP(page);
            }

            // Other categories → ProductPage
            else {
              productPage = new ProductPage(page);
            }

            await completeFlow({
              page,
              homePage: new CurtainsHomePage(page),
              productPage,
              cartPage: new CartPage(page),
              checkoutPage: new CheckoutPage(page),
              item: {
                category: cat.category,
                product
              }
            });

            console.log(
              `✅ Completed: ${cat.category} → ${product}`
            );
          }
        );
      });
    });
});
 