// const { test } = require('@playwright/test');
// const { MoreHomePage } = require('../pages/MoreHomePage');
// const { ProductPage } = require('../pages/ProductPage');
// const { CartPage } = require('../pages/CartPage');
// const { CheckoutPage } = require('../pages/CheckoutPage');


// test('E2E Journey - Privacy Film', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


// test('E2E Journey - Custom Bed Runner', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToBedRunnerProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


// test('E2E Journey - Personalized Duvet Cover', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToDuvetCoverProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


// test('E2E Journey - Personalized Flat Bedsheet', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToFlatBedsheetProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//   test('E2E Journey - Personalized Fitted Bedsheet', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateTofittedBedsheetProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//   test('E2E Journey - Custom Table Runner', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToTableRunnerProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//   test('E2E Journey - Custom Placemats', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToPlacematsProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//   test('E2E Journey - Custom Round TableCloth', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToRoundTableClothProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//  test('E2E Journey - Custom Oval TableCloth', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToOvalTableClothProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//  test('E2E Journey - Custom Square/Rectangle TableCloth', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToSquareRectangleTableClothProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


//  test('E2E Journey - Custom Canvas Table Napkins', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToTableNapkinsProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });

// test('E2E Journey - Personalized Hot & Cold Cola Bottle', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToColaBottleProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });

// test('E2E Journey - Personalized Hot & Cold Traveller Bottle', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToTravellerBottleProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });

// test('E2E Journey - Personalized Sports Bottle', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToSportsBottleProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


// test('E2E Journey - Custom Coffee Mugs', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToCoffeeMugsProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });


// test('E2E Journey - Custom Acrylic Coasters', async ({ page }) => {
//   test.setTimeout(600000);
//   const homePage = new MoreHomePage(page);
//   const productPage = new ProductPage(page);
//   const cartPage = new CartPage(page);
//   const checkoutPage = new CheckoutPage(page);

//   // Step 1 - 4: Open Website and Navigate to Product
//   console.log('Step: Starting journey with preserved session...');
//   await homePage.open();
//   await homePage.navigateToAcrylicCoastersProduct();

//   // Step 4.1: Personalize Design
//   await productPage.personalizeDesign();

//   // Step 4.2: Upload Design
//   await productPage.uploadImage('data/test_image.png');

//   // Step 4.3: Preview and Add To Cart
//   await productPage.previewAndAddToCart();

//   // Step 5: Navigate to Cart
//   await cartPage.goToCart();
//   await cartPage.dismissPopup();


//   // Step 6: Secure Checkout
//   await cartPage.secureCheckout();

//   await checkoutPage.waitForCheckoutToLoad();

//   // Step 7: Fill Shipping Details

//   // Step 9: Fill Stripe Payment
//   await checkoutPage.fillStripePayment({
//     //   cardNumber: '4111 1111 1111 1111',
//     //   expiry: '12 / 27',
//     cvc: '123'
//   });

//   // Step 10: Place Order
//   await checkoutPage.placeOrder();

//   // Step 11: Verify Success
//   await checkoutPage.verifySuccess();

//   // Step 12: Wait for order confirmation
//   console.log('Waiting briefly to view order number...');
//   await page.waitForTimeout(3000);
//   await cartPage.dismissPopup(); // Can use same popup dismisser for success page

//   // Step 13: Print Order Hash
//   await checkoutPage.printOrderHash();

//   console.log('✅ All steps complete. Browser closing.');
//   await page.waitForTimeout(2000);
// });









// tests/More.spec.js

const { test } = require('@playwright/test');
const moreData = require('../data/moreData');

const { MoreHomePage } = require('../pages/MoreHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const { completeFlow } = require('../flows/completeFlow');

test.describe('More E2E', () => {
  test.setTimeout(600000);

  // Run all Fabrics categories + products
  moreData.forEach((cat) => {
    cat.products.forEach((product) => {
      test(
        `More - ${cat.category} → ${product}`,
        async ({ page }) => {
          console.log(
            `Running: ${cat.category} → ${product}`
          );

          const productPage = new ProductPage(page);

          await completeFlow({
            page,
            homePage: new MoreHomePage(page),
            productPage,
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
    });
  });
});