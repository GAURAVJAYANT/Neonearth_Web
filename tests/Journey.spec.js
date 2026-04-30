const { test } = require('@playwright/test');
const { TapestryHomePage } = require('../pages/TapestryHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Custom Wall Tapestry Velvet Satin', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey - Custom Panoramic Tapestries', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToPanoramicTapestryProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey - Custom Wall Tapestry Weave Loom', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToWeaveLoomProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey - Custom Panoramic Tapestry - Weave Loom', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToPanoramicWeaveLoomProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey -Custom Triangular Tapestry - Velvet Satin', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToTriangularTapestryProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey -Custom Triangular Tapestry - Weave Loom', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToTriangularWeaveLoomProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey -Custom Hanging Tapestry - Velvet Satin', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToHangingTapestryProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey -Custom Hanging Tapestry - Weave Loom', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new TapestryHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1 - 4: Open Website and Navigate to Product
  console.log('Step: Starting journey with preserved session...');
  await homePage.open();
  await homePage.navigateToHangingWeaveLoomProduct();

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

  await checkoutPage.waitForCheckoutToLoad();

  // Step 7: Fill Shipping Details

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
//   cardNumber: '4111 1111 1111 1111',
//   expiry: '12 / 27',
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); // Can use same popup dismisser for success page

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});






 