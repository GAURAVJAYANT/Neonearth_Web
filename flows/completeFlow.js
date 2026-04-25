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
 // await productPage.personalizeDesign();
 // await productPage.uploadImage('data/test_image.png');

  // Add to cart
  await productPage.addToCart();

  // Cart
  await cartPage.goToCart();
  await cartPage.dismissPopup();

  // Checkout
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();

  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  await checkoutPage.verifySuccess();

  console.log(`✅ Done: ${item.category} → ${item.product}`);
}

module.exports = { completeFlow };