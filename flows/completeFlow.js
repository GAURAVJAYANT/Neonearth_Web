const BASE_URL = process.env.BASE_URL;
const IS_PRODUCTION = BASE_URL.includes('www.neonearth.com');
const FLOW_TIMEOUT_MS = 10 * 60 * 1000;

function isPriceMatch(actualAmount, expectedAmount, tolerance = 0.01) {
  return Math.abs(actualAmount - expectedAmount) <= tolerance;
}

async function logPdpCartPriceCheck(cartPage, pdpPriceString) {
  const cartPriceString = await cartPage.getCartPrice();
  const pdpPrice = cartPage.parseMoney(pdpPriceString);
  const cartPrice = cartPage.parseMoney(cartPriceString);
  const matched = isPriceMatch(cartPrice, pdpPrice);

  console.log('------------------------------------------------');
  console.log(`PDP Price      : ${pdpPriceString}`);
  console.log(`Cart Price     : ${cartPriceString}`);
  console.log(`Price Status   : ${matched ? 'matched' : 'not matched'}`);
  console.log('------------------------------------------------');

  return {
    cartPriceString,
    cartPrice,
    matched
  };
}

async function logDiscountSnapshot(cartPage, qty, baseUnitPrice = 0) {
  const currentPriceStr = await cartPage.getCartPrice();
  const subtotalStr = await cartPage.getSubtotalPrice();
  const discountStr = await cartPage.getDiscountPrice();
  const discountPercent = cartPage.calculateDiscountPercent(subtotalStr, discountStr, currentPriceStr);
  const subtotal = cartPage.parseMoney(subtotalStr);
  const expectedSubtotal = baseUnitPrice > 0 ? baseUnitPrice * qty : 0;
  const quantityPriceMatched = expectedSubtotal > 0 && subtotal > 0
    ? isPriceMatch(subtotal, expectedSubtotal)
    : false;

  console.log(`Qty: ${qty} | Product Price: ${currentPriceStr} | Subtotal: ${subtotalStr} | Discount: ${discountStr} | Discount Percent: ${discountPercent.toFixed(2)}%`);

  if (expectedSubtotal > 0) {
    console.log(`Qty: ${qty} | Expected Subtotal: ${expectedSubtotal.toFixed(2)} | Actual Subtotal: ${subtotalStr} | Quantity Price Status: ${quantityPriceMatched ? 'matched' : 'not matched'}`);
  }
}

async function _runFlow({ page, homePage, productPage, cartPage, checkoutPage, item, file }) {
  await homePage.open();
  await homePage.navigate(item.category, item.product);

  let initialPriceString = await productPage.getPriceFromPDP();
  console.log('================================================');
  console.log(`Product        : ${item.product}`);
  console.log(`Initial Price  : ${initialPriceString}`);
  console.log('================================================');

  if (item.customOptions) {
    console.log('Settle time before custom options...');
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

  if (!item.skipPersonalizeUpload) {
    if (item.waitForFullLoadBeforePersonalize) {
      await page.waitForLoadState('load', { timeout: 60000 }).catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      if (typeof productPage.waitForOverlays === 'function') {
        await productPage.waitForOverlays();
      }
    }

    await productPage.personalizeDesign();
    await productPage.uploadImage(file);

    await productPage.skipNextSideButton();
    // await productPage.uploadImage('data/test_image.png', {
    //   handleNextBackSide: !!item.handleNextBackSide
    // });
  }

  if (!item.skipAddToCart) {
    await productPage.addToCart();
  }

  await cartPage.goToCart();
  await cartPage.dismissPopup();
  const cartPriceCheck = await logPdpCartPriceCheck(cartPage, initialPriceString);
  const baseUnitPrice = cartPriceCheck.cartPrice;

  if (item.applyCoupon) {
    await cartPage.handleCoupons();
    await logDiscountSnapshot(cartPage, 1, baseUnitPrice);
    
    // Log shipping price for quantity 1 (only if checking shipping)
    if (item.selectStandardShippingAfterQuantity) {
      const shippingPrice1 = await cartPage.getShippingPrice();
      const subtotalStr1 = await cartPage.getSubtotalPrice();
      const subtotal1 = cartPage.parseMoney(subtotalStr1);
      const displayPrice1 = subtotal1 > 99 ? 'Free' : shippingPrice1;
      console.log(`Qty: 1 | Shipping: ${displayPrice1}`);
    }

    const targetQuantities = [2, 4, 6, 8];
    console.log('--- STARTING QUANTITY TEST LOOP ---');

    for (const qty of targetQuantities) {
      await cartPage.updateQuantity(qty);
      await logDiscountSnapshot(cartPage, qty, baseUnitPrice);
      
      // Log shipping price for each quantity (only if checking shipping)
      if (item.selectStandardShippingAfterQuantity) {
        const shippingPrice = await cartPage.getShippingPrice();
        const subtotalStr = await cartPage.getSubtotalPrice();
        const subtotal = cartPage.parseMoney(subtotalStr);
        const displayPrice = subtotal > 99 ? 'Free' : shippingPrice;
        const status = subtotal > 99 ? '✓ FREE' : '✗ NOT FREE';
        console.log(`Qty: ${qty} | Shipping: ${displayPrice} | Status: ${status} (Total: $${subtotal})`);
      }
    }

    console.log('--- ENDING QUANTITY TEST LOOP ---');

    // Final summary check at quantity 8
    if (item.selectStandardShippingAfterQuantity) {
      const subtotalStr = await cartPage.getSubtotalPrice();
      const subtotal = cartPage.parseMoney(subtotalStr);
      if (subtotal > 99) {
        console.log(`  ✓ FREE SHIPPING - Total ($${subtotal}) exceeds $99`);
      } else {
        console.log(`  ✗ SHIPPING IS NOT FREE - Total ($${subtotal}) does not exceed $99`);
      }
    }
  }

  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();

  if (IS_PRODUCTION) {
    console.log('');
    console.log('PRODUCTION ENV DETECTED - Order placement is BLOCKED.');
    return;
  }

  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();
  await checkoutPage.verifySuccess();

  console.log(`Done: ${item.category} -> ${item.product}`);
}

async function completeFlow({ page, homePage, productPage, cartPage, checkoutPage, item, file }) {
  const watchdog = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(
        `FLOW_TIMEOUT: "${item.category} -> ${item.product}" exceeded ${FLOW_TIMEOUT_MS / 60000} minutes.`
      )),
      FLOW_TIMEOUT_MS
    )
  );

  await Promise.race([
    _runFlow({ page, homePage, productPage, cartPage, checkoutPage, item, file }),
    watchdog
  ]);
}

module.exports = { completeFlow };
