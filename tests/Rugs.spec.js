const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { NeonearthCategoryPage } = require('../pages/NeonearthCategoryPage');
 const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Rugs & Mats - Area Rugs', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const categoryPage = new NeonearthCategoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Rugs & Mats -> Rectangle Rug
  await homePage.navigateToRugsProduct();

  // Step 3: Navigation is handled by navigateToRugsProduct which waits for PDP
  
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

  // Step 7: Fill Shipping Details (Handled by session or predefined fields)

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); 

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey -Square Rug', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const categoryPage = new NeonearthCategoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Rugs & Mats -> Square Rug
  await homePage.navigateToSquareRugProduct();

  // Step 3: Navigation is handled by navigateToRugsProduct which waits for PDP
  
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

  // Step 7: Fill Shipping Details (Handled by session or predefined fields)

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); 

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});


test('E2E Journey -Round Rug', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const categoryPage = new NeonearthCategoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Rugs & Mats -> Round Rug
  await homePage.navigateToRoundRugProduct();

  // Step 3: Navigation is handled by navigateToRugsProduct which waits for PDP
  
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

  // Step 7: Fill Shipping Details (Handled by session or predefined fields)

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); 

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});


test('E2E Journey -Oval Rug', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const categoryPage = new NeonearthCategoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Rugs & Mats -> Oval Rug
  await homePage.navigateToOvalRugProduct();

  // Step 3: Navigation is handled by navigateToRugsProduct which waits for PDP
  
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

  // Step 7: Fill Shipping Details (Handled by session or predefined fields)

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); 

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});

test('E2E Journey -Runner - Luxe Grain', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const categoryPage = new NeonearthCategoryPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Rugs & Mats -> Oval Rug
  await homePage.navigateToHallwayRunnersProduct();

  // Step 3: Navigation is handled by navigateToRugsProduct which waits for PDP
  
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

  // Step 7: Fill Shipping Details (Handled by session or predefined fields)

  // Step 9: Fill Stripe Payment
  await checkoutPage.fillStripePayment({
    cvc: '123'
  });

  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting briefly to view order number...');
    await page.waitForTimeout(3000);
  await cartPage.dismissPopup(); 

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});




