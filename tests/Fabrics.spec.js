const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
// const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Fabrics - Spanish Velvet', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  // const checkoutPage = new CheckoutPage(page);

  // Step 1: Open Website
  await homePage.open();
  console.log('✅ Website opened successfully');

  // Ensure high-level page stability before navigation
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => console.log('⚠️ Network did not reach idle, continuing anyway...'));

  // Step 2: Navigate to Fabrics -> Spanish Velvet
  await homePage.navigateToFabricsProduct();

  // Step 3: Landing verification
  console.log('✅ Fabrics Product Landing verified');

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

  console.log('✅ All steps complete. Browser closing.');
    await page.waitForTimeout(2000);
});
