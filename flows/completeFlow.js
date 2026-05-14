// ── Environment detection ────────────────────────────────────────────────────
// Read BASE_URL from .env. If it contains the production domain,
// the test will stop safely after reaching the checkout page.
const BASE_URL = process.env.BASE_URL || 'https://ne.signsigma.com/';
const IS_PRODUCTION = BASE_URL.includes('www.neonearth.com');

// ── Global Flow Watchdog ─────────────────────────────────────────────────────
// Maximum time allowed for the ENTIRE test flow (menu nav + upload + checkout).
const FLOW_TIMEOUT_MS = 10 * 60 * 1000; // Increased to 10 minutes for quantity loops

async function _runFlow({ page, homePage, productPage, cartPage, checkoutPage, item }) {

  await homePage.open();

  // 🔥 Dynamic navigation
  await homePage.navigate(item.category, item.product);

  // ── PRICE: Capture initial price after PDP load ────────────────────────
  let initialPriceString = await productPage.getPriceFromPDP();
  console.log('================================================');
  console.log(`Product        : ${item.product}`);
  console.log(`Initial Price  : ${initialPriceString}`);
  console.log('================================================');

  // ── CUSTOM OPTIONS ──────────────────────────────────────────────────
  if (item.customOptions) {
    console.log('⏳ Settle time before custom options...');
    await page.waitForTimeout(5000); 
    await productPage.handleCustomOptions(item.customOptions);

    const finalPriceString = await productPage.getPriceFromPDP();
    console.log('================================================');
    console.log(`Product        : ${item.product}`);
    console.log(`Price (Before) : ${initialPriceString}`);
    console.log(`Price (After)  : ${finalPriceString}`);
    console.log('================================================');
    
    initialPriceString = finalPriceString;
  }

  // PDP — Personalize + Upload
  await productPage.personalizeDesign();
  await productPage.uploadImage('data/test_image.png');

  // Add to cart
  if (!item.skipAddToCart) {
    await productPage.addToCart();
  }

  // Cart
  await cartPage.goToCart();
  await cartPage.dismissPopup();

  if (item.applyCoupon) {
    await cartPage.handleCoupons();
    
    // ── QUANTITY CHANGE LOOP: 2, 4, 6, 8 ─────────────────────────────
    const targetQuantities = [2, 4, 6, 8];
    
    console.log('--- STARTING QUANTITY TEST LOOP ---');
    
    for (const qty of targetQuantities) {
      await cartPage.updateQuantity(qty);
      
      const currentPriceStr = await cartPage.getCartPrice();
      const discountStr = await cartPage.getDiscountPrice();
      
      // Parse numbers for calculation (remove $ and ,)
      const unitPrice = parseFloat(currentPriceStr.replace(/[^0-9.]/g, '')) || 0;
      const discountVal = parseFloat(discountStr.replace(/[^0-9.]/g, '')) || 0;
      const totalBeforeDiscount = unitPrice * qty;
      
      let discountPercent = 0;
      if (totalBeforeDiscount > 0) {
        discountPercent = (discountVal / totalBeforeDiscount) * 100;
      }
      
      console.log(`Qty: ${qty} | Product Price (Unit): ${currentPriceStr} | Discount: ${discountStr} | Percent: ${discountPercent.toFixed(2)}%`);
    }
    console.log('--- ENDING QUANTITY TEST LOOP ---');
  }

  // ── PRICE ASSERTION ──────────────────────────────────────────────────
  const cartPrice = await cartPage.getCartPrice();
  console.log('------------------------------------------------');
  console.log(`PDP Price      : ${initialPriceString}`);
  console.log(`Cart Price     : ${cartPrice}`);

  if (initialPriceString === cartPrice) {
    console.log('✅ price matched');
  } else {
    console.log('❌ price not match');
  }
  console.log('------------------------------------------------');

  // Checkout
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();

  // 🛡️ PRODUCTION SAFETY GUARD
  if (IS_PRODUCTION) {
    console.log('');
    console.log('🛡️  PRODUCTION ENV DETECTED — Order placement is BLOCKED.');
    return;
  }

  // Staging only
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();
  await checkoutPage.verifySuccess();

  console.log(`✅ Done: ${item.category} → ${item.product}`);
}

async function completeFlow({ page, homePage, productPage, cartPage, checkoutPage, item }) {
  const watchdog = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(
        `❌ FLOW_TIMEOUT: "${item.category} → ${item.product}" exceeded ${FLOW_TIMEOUT_MS / 60000} minutes.`
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