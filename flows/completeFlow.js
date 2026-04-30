// ── Environment detection ────────────────────────────────────────────────────
// Read BASE_URL from .env. If it contains the production domain,
// the test will stop safely after reaching the checkout page.
const BASE_URL = process.env.BASE_URL || 'https://ne.signsigma.com/';
const IS_PRODUCTION = BASE_URL.includes('www.neonearth.com');

// ── Global Flow Watchdog ─────────────────────────────────────────────────────
// Maximum time allowed for the ENTIRE test flow (menu nav + upload + checkout).
// If ANY step hangs silently beyond this limit, the watchdog throws an error
// which forces Playwright to FAIL the test immediately and trigger a retry.
// Set to 4 minutes — generous enough for slow uploads, strict enough to catch hangs.
const FLOW_TIMEOUT_MS = 4 * 60 * 1000; // 4 minutes

async function _runFlow({ page, homePage, productPage, cartPage, checkoutPage, item }) {

  await homePage.open();

  // 🔥 Dynamic navigation (menu hover + product click)
  await homePage.navigate(item.category, item.product);

  // PDP — Personalize + Upload
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
  if (IS_PRODUCTION) {
    console.log('');
    console.log('🛡️  PRODUCTION ENV DETECTED — Order placement is BLOCKED.');
    console.log(`✅  Checkout page reached and verified for: ${item.category} → ${item.product}`);
    console.log('    Test marked as PASSED. No order was placed.');
    console.log('');
    return;
  }
  // ── END SAFETY GUARD ────────────────────────────────────────────────────

  // Staging only: complete the full payment flow
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();
  await checkoutPage.verifySuccess();

  console.log(`✅ Done: ${item.category} → ${item.product}`);
}

async function completeFlow({ page, homePage, productPage, cartPage, checkoutPage, item }) {
  // ── WATCHDOG: Race the flow against a hard timeout ──────────────────────
  // If the flow gets stuck (e.g. a locator never appears, screen freezes),
  // this timeout fires after 4 minutes, throws a clear error, and lets
  // Playwright's retry mechanism immediately start a fresh attempt.
  const watchdog = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(
        `❌ FLOW_TIMEOUT: "${item.category} → ${item.product}" exceeded ${FLOW_TIMEOUT_MS / 60000} minutes. ` +
        `Test is stuck — failing now to trigger retry.`
      )),
      FLOW_TIMEOUT_MS
    )
  );

  await Promise.race([
    _runFlow({ page, homePage, productPage, cartPage, checkoutPage, item }),
    watchdog
  ]);
}

module.exports = { completeFlow };
