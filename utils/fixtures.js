// utils/fixtures.js
const base = require('@playwright/test');
const { NewTapestryHomePage } = require('../pages/NewTapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

// Extend base test to inject custom page fixtures
const test = base.test.extend({
  newTapestryHomePage: async ({ page }, use) => {
    const homePage = new NewTapestryHomePage(page);
    await use(homePage);
  },
  productPage: async ({ page }, use) => {
    const pPage = new ProductPage(page);
    await use(pPage);
  },
  cartPage: async ({ page }, use) => {
    const cPage = new CartPage(page);
    await use(cPage);
  },
  checkoutPage: async ({ page }, use) => {
    const chPage = new CheckoutPage(page);
    await use(chPage);
  },
});

module.exports = {
  test,
  expect: base.expect,
};
