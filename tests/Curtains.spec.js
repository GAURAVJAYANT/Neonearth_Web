// tests/Curtain.spec.js

const { test } = require('@playwright/test');
const curtainsData = require('../data/curtainsData');

const { CurtainsHomePage } = require('../pages/CurtainsHomePage');
const { CurtainsPDP } = require('../pages/CurtainsPDP');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('Curtains E2E', () => {
  test.setTimeout(600000);

  // Run all curtain categories one by one
  for (const cat of curtainsData) {
    for (const product of cat.products) {
      test(
        `Curtain - ${cat.category} → ${product}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product}`
          );

          await completeFlow({
            page,

            homePage: new CurtainsHomePage(page),
            productPage: new CurtainsPDP(page),
            cartPage: new CartPage(page),
            checkoutPage: new CheckoutPage(page),

            item: {
              category: cat.category,
              product: product
            }
          });

          console.log(
            `✅ Completed: ${cat.category} → ${product}`
          );
        }
      );
    }
  }
});