const { test, expect } = require('@playwright/test');
//const { RugsHomePage } = require('../pages/RugsHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { WallArtsHomePage } = require('../pages/WallArtsHomePage');

test('E2E Journey - Wall Arts - Custom Wallpaper', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new WallArtsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToCustomWallpaperProduct();
  await expect(page).toHaveURL(/custom-wallpaper-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Custom Wallpaper');

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
});

test('E2E Journey - Wallpaper - Stone Grain', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new WallArtsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToWallpaperStoneGrainProduct();
  await expect(page).toHaveURL(/custom-wallpaper-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Wallpaper Stone Grain');

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
});

test('E2E Journey - Wall Mural - Luxe Smooth', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new WallArtsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToWallMuralLuxeSmoothProduct();
  await expect(page).toHaveURL(/custom-wall-mural-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Wall Mural - Luxe Smooth');

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
});

test('E2E Journey - Wall Mural - Stone Grain', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new WallArtsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToWallMuralStoneGrainProduct();
  await expect(page).toHaveURL(/wall-mural-stone-grain-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Wall Mural - Stone Grain');

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
});

test('E2E Journey-Wall Mural - Timber Grain', async ({ page }) => {
  test.setTimeout(600000);
  const homePage = new WallArtsHomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // ── Step 1: Homepage load ──────────────────────────────────────────
  await homePage.open();
  await expect(page).toHaveURL('/');
  await expect(page.locator('nav.header-navigation-bar')).toBeVisible();
  console.log('✅ Homepage loaded');

  // ── Step 2: Navigate to PDP ────────────────────────────────────────
  await homePage.navigateToWallMuralTimberGrainProduct();
  await expect(page).toHaveURL(/custom-wall-mural-p/i);
  await expect(productPage.personaliseBtn).toBeVisible();
  console.log('✅ PDP loaded - Wall Mural - Timber Grain');

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
});



