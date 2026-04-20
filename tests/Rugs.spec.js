const { test, expect } = require('@playwright/test');
const { RugsHomePage } = require('../pages/RugsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

test('E2E Journey - Rugs & Mats - Area Rugs', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToRugsProduct();
  await expect(page).toHaveURL(/rug-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Area Rug');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await expect(page).toHaveURL(/success/i, { timeout: 180000 });
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});


test('E2E Journey - Square Rug', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToSquareRugProduct();
  await expect(page).toHaveURL(/rug-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Square Rug');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await expect(page).toHaveURL(/success/i, { timeout: 180000 });
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});



test('E2E Journey - Round Rug', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToRoundRugProduct();
  await expect(page).toHaveURL(/rug-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Round Rug');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await expect(page).toHaveURL(/success/i, { timeout: 180000 });
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});



test('E2E Journey - Oval Rug', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToOvalRugProduct();
  await expect(page).toHaveURL(/rug-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Oval Rug');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await expect(page).toHaveURL(/success/i, { timeout: 180000 });
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});



test('E2E Journey - Runner - Luxe Grain', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToHallwayRunnersProduct();
  await expect(page).toHaveURL(/runner-p|hallway-runners-p|rugs-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Runner Luxe Grain');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await expect(page).toHaveURL(/success/i, { timeout: 180000 });
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});

test('E2E Journey - Runner - Silken Plush', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToRunnerSilkenPlushProduct();
 // await expect(page).toHaveURL();
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Runner Silken Plush');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await expect(page).toHaveURL(/success/i, { timeout: 180000 });
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});

test('E2E Journey - Runner - Nature Loom', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new RugsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToRunnerNatureLoomProduct();
 // await expect(page).toHaveURL();
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Runner Silken Plush');

  // ── Step 3: Personalize & Upload ───────────────────────────────────
  await productPage.personalizeDesign();
  await expect(productPage.uploadYourDesignBtn).toBeVisible();
  await productPage.uploadImage('data/test_image.png');
  await expect(productPage.previewBtn).toBeVisible({ timeout: 150000 });

  // ── Step 4: Preview & Add to Cart ──────────────────────────────────
  await productPage.previewAndAddToCart();

  // ── Step 5: Cart page ──────────────────────────────────────────────
  await cartPage.goToCart();
  await expect(page).toHaveURL(/checkout\/cart/i);
  await expect(page.getByRole('button', { name: /remove/i }).first()).toBeVisible();
  await expect(page.locator('.cart-empty, .message.info.empty')).not.toBeVisible();
  await cartPage.dismissPopup();

  // ── Step 6: Checkout page ──────────────────────────────────────────
  await cartPage.secureCheckout();
  await checkoutPage.waitForCheckoutToLoad();
  await expect(page).toHaveURL(/onepagecheckout/i);
  await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
  await expect(page.locator('iframe[src*="stripe"]').first()).toBeVisible();

  // ── Step 7: Payment & Order ────────────────────────────────────────
  await checkoutPage.fillStripePayment({ cvc: '123' });
  await checkoutPage.placeOrder();

  // ── Step 8: Order success ──────────────────────────────────────────
  await checkoutPage.verifySuccess();

  console.log('Waiting briefly to view order number...');
  await page.waitForTimeout(3000);
  await cartPage.dismissPopup();
  await checkoutPage.printOrderHash();

  console.log('✅ All steps complete. Browser closing.');
  await page.waitForTimeout(2000);
});