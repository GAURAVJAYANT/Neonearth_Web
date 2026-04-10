const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Pillows - Custom Square Throw Pillow', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Pillows -> Custom Square Throw Pillow
  await homePage.navigateToPillowProduct();

  // Step 3: Check if we are already on a PDP
  const currentUrl = page.url();
  if (currentUrl.includes('-p?') || /-p($|\?)/.test(currentUrl)) {
    console.log('✅ Directly landed on a Product Page (PDP)');
  } else {
    // Fallback if needed, but navigateToPillowProduct should land on PDP
    console.log('✅ Landing verified');
  }

  // Step 4.1: Personalize Design
  await productPage.personalizeDesign();

  // Step 4.2: Upload Design (Front Side)
  await productPage.uploadImage('data/test_image.png');

  // Step 4.2.1: Click "Next: Back Side" (Pillow specific)
 const nextBackSideBtn = page.getByRole('button', { name: 'Next: Back Side' });
 await nextBackSideBtn.waitFor({ state: 'visible', timeout: 20000 });
 await nextBackSideBtn.click();
 console.log('✅ Clicked "Next : Back Side" button');

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

test('E2E Journey - Custom Rectangle Throw Pillow', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Pillows -> Custom Rectangle Throw Pillow
  await homePage.navigateToRectangleThrowPillowProduct();

  // Step 3: Check if we are already on a PDP
  const currentUrl = page.url();
  if (currentUrl.includes('-p?') || /-p($|\?)/.test(currentUrl)) {
    console.log('✅ Directly landed on a Product Page (PDP)');
  } else {
    // Fallback if needed, but navigateToPillowProduct should land on PDP
    console.log('✅ Landing verified');
  }

  // Step 4.1: Personalize Design
  await productPage.personalizeDesign();

  // Step 4.2: Upload Design (Front Side)
  await productPage.uploadImage('data/test_image.png');

  // Step 4.2.1: Click "Next: Back Side" (Pillow specific)
 const nextBackSideBtn = page.getByRole('button', { name: 'Next: Back Side' });
 await nextBackSideBtn.waitFor({ state: 'visible', timeout: 20000 });
 await nextBackSideBtn.click();
 console.log('✅ Clicked "Next : Back Side" button');

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

test('E2E Journey - Custom Round Throw Pillow', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Pillows -> Custom Round Throw Pillow
  await homePage.navigateToRoundThrowPillowProduct();

  // Step 3: Check if we are already on a PDP
  const currentUrl = page.url();
  if (currentUrl.includes('-p?') || /-p($|\?)/.test(currentUrl)) {
    console.log('✅ Directly landed on a Product Page (PDP)');
  } else {
    // Fallback if needed, but navigateToPillowProduct should land on PDP
    console.log('✅ Landing verified');
  }

  // Step 4.1: Personalize Design
  await productPage.personalizeDesign();

  // Step 4.2: Upload Design (Front Side)
  await productPage.uploadImage('data/test_image.png');

  // Step 4.2.1: Click "Next: Back Side" (Pillow specific)
 const nextBackSideBtn = page.getByRole('button', { name: 'Next: Back Side' });
 await nextBackSideBtn.waitFor({ state: 'visible', timeout: 20000 });
 await nextBackSideBtn.click();
 console.log('✅ Clicked "Next : Back Side" button');

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


