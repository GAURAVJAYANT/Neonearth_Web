const { test } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Custom Wall Tapestry Velvet Satin', async ({ page }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  await homePage.open();
  await homePage.navigateToProduct();

  // Step 4.1: Personalize Design
  await productPage.personalizeDesign();

  // Step 4.2: Upload Design
  await productPage.uploadImage('data/test_image.png');

  // Step 4.3: Preview and Add To Cart
  await productPage.previewAndAddToCart();

  // Step 5: Navigate to Cart
  await cartPage.goToCart();
  await cartPage.dismissPopup();

  // Step 6: Secure Checkout
  await cartPage.secureCheckout();

  // Step 7: Fill Shipping Details
  await checkoutPage.fillShippingDetails({
    email: 'test@yopmail.com',
    firstName: 'Gaurav',
    lastName: 'Jayant',
    phone: '88888888888',
    address: '123 Main Street',
    city: 'New York',
    postcode: '10001'
  });

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
    cardNumber: '4111 1111 1111 1111',
    expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting 30 seconds to view order number...');
  await page.waitForTimeout(20000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('Waiting 10 seconds before browser closes...');
  await page.waitForTimeout(10000);
  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(20000);
});