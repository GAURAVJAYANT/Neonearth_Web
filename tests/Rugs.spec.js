const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { NeonearthCategoryPage } = require('../pages/NeonearthCategoryPage');
// const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Rugs & Mats - Area Rugs', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const categoryPage = new NeonearthCategoryPage(page);
  // const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Step 2: Navigate to Rugs & Mats -> Rectangle Rug
  await homePage.navigateToRugsProduct();

  // Step 3: Check if we are already on a PDP or need to select from Category page
  const currentUrl = page.url();
  if (currentUrl.includes('-p?') || /-p($|\?)/.test(currentUrl)) {
    console.log('✅ Directly landed on a Product Page (PDP)');
  } else {
    console.log('ℹ️ Landed on Category Page, selecting first product...');
    const products = await categoryPage.getProductsData();
    if (products.length === 0) {
      throw new Error('No products found in the category');
    }
    console.log(`✅ Selecting: "${products[0].name}"`);
    await page.goto(products[0].url);
    console.log('✅ Navigated to Rug PDP');
  }

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

  // Step 7: Select Amazon Pay
  try {
    console.log('Step 7: Selecting Alexa/Amazon Pay...');
    // Switch into the Stripe Payment Element iframe first
    const paymentFrame = page.frameLocator('iframe[title="Secure payment input frame"]');

    // Click the Amazon Pay accordion button
    const amazonPayBtn = paymentFrame.locator('[data-value="amazon_pay"]');

    await amazonPayBtn.waitFor({ state: 'visible', timeout: 15000 });
    await amazonPayBtn.click();
    console.log('  ✅ Amazon Pay selected');
  } catch (e) {
    console.log(`  ❌ Amazon Pay selection failed: ${e.message.split('\n')[0]}`);
    throw new Error(`Amazon Pay option could not be clicked: ${e.message}`);
  }

  /*
  // Step 9: Fill Stripe Payment (Optional/Commented as per user request in Journey.spec)
  await checkoutPage.fillStripePayment({
    cardNumber: '4111 1111 1111 1111',
    expiry: '12 / 27',
    cvc: '123'
  });
  */

  /*
  // Step 10: Place Order
  await checkoutPage.placeOrder();

  // Step 11: Verify Success
  await checkoutPage.verifySuccess();

  // Step 12: Wait for order confirmation
  console.log('Waiting 30 seconds to view order number...');
  await page.waitForTimeout(20000);
  await cartPage.dismissPopup(); 

  // Step 13: Print Order Hash
  await checkoutPage.printOrderHash();
  */

  console.log('Waiting 10 seconds before browser closes...');
  await page.waitForTimeout(10000);
  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(20000);
});
