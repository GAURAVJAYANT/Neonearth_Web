// ── Environment detection ────────────────────────────────────────────────────
// Read BASE_URL from .env. If it contains the production domain,
// the test will stop safely after reaching the checkout page.
const BASE_URL = process.env.BASE_URL || 'https://ne.signsigma.com/';
const IS_PRODUCTION = BASE_URL.includes('www.neonearth.com');

async function completeFlow({
  page,
  homePage,
  productPage,
  cartPage,
  checkoutPage,
  item
}) {

  await homePage.open();

  // 🔥 Dynamic navigation
  await homePage.navigate(item.category, item.product);

  // PDP
  await productPage.personalizeDesign();
  await productPage.uploadImage('data/test_image.png');

  // Add to cart (unless explicitly skipped)
  if (!item.skipAddToCart) {
    await productPage.addToCart();
  }

  // Cart
  await cartPage.goToCart();
  await cartPage.dismissPopup();

  // Checkout
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();

  // ── 🛡️ PRODUCTION SAFETY GUARD ──────────────────────────────────────────
  // On production (www.neonearth.com) we MUST NOT place a real order.
  // The test is considered PASSED once the checkout page loads successfully.
  if (IS_PRODUCTION) {
    console.log('');
    console.log('🛡️  PRODUCTION ENV DETECTED — Order placement is BLOCKED.');
    console.log(`✅  Checkout page reached and verified for: ${item.category} → ${item.product}`);
    console.log('    Test marked as PASSED. No order was placed.');
    console.log('');
    return; // Exit cleanly — Playwright marks the test as PASSED
  }
  // ── END SAFETY GUARD ────────────────────────────────────────────────────

  // Staging only: complete the full payment flow
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  await checkoutPage.verifySuccess();

  console.log(`✅ Done: ${item.category} → ${item.product}`);
}

module.exports = { completeFlow };