const { test, expect } = require('@playwright/test');

const { PillowHomePage } = require('../pages/PillowHomePage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const fileType = require('../data/fileList');

const BASE_URL = process.env.BASE_URL || 'https://ne.signsigma.com/';
const IS_PRODUCTION = BASE_URL.includes('www.neonearth.com');

const item = {
    product: "Square Throw Pillow",
    category: "Throw Pillows",
}



test('Edit Case - Upload Different Design for Both Side', async ({ page }) => {
    test.setTimeout(200000);
    const front = fileType[1]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const back = fileType[0]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const homePage = new PillowHomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Open Website
    await homePage.open();
    console.log("✅ Website opened successfully");

    // Step 2: Navigate to Pillow -> Custom Square Throw Pillow
    await homePage.navigate(item.category, item.product);

    if (item.customOptions) {
        console.log('⏳ Settle time before custom options...');
        await page.waitForTimeout(5000);
        await productPage.handleCustomOptions(item.customOptions);
    }

    // PDP — Personalize + Upload
    await productPage.personalizeDesign();
    await productPage.uploadImage(front);

    await productPage.skipNextSideButton();

    // await page.getByRole('button', { name: 'Upload New' || "Change Design" }).click();
    await page.getByRole('button', { name: /Upload New|Change Design/ }).click();
    // await page.getByRole('button', { name: 'Upload Your Design' }).click();
    // Temporarily reassign locators to skip button click and target the active "Browse Files" button in this call only
    const originalBtn = productPage.uploadYourDesignBtn;
    const originalFileText = productPage.uploadFileText;
    productPage.uploadYourDesignBtn = page.locator('#non-existent-button-to-skip-click');
    productPage.uploadFileText = page.getByText('Browse Files').last();

    await productPage.uploadImage(back);

    // Restore original locators
    productPage.uploadYourDesignBtn = originalBtn;
    productPage.uploadFileText = originalFileText;


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

})


test('Edit Case - Change Size & Quantity', async ({ page }) => {
    test.setTimeout(300000);
    const front = fileType[1]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    // const back = fileType[0]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const homePage = new PillowHomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Open Website
    await homePage.open();
    console.log("✅ Website opened successfully");

    // Step 2: Navigate to Pillow -> Custom Square Throw Pillow
    await homePage.navigate(item.category, item.product);

    if (item.customOptions) {
        console.log('⏳ Settle time before custom options...');
        await page.waitForTimeout(5000);
        await productPage.handleCustomOptions(item.customOptions);
    }

    // PDP — Personalize + Upload
    await productPage.personalizeDesign();
    await productPage.uploadImage(front);

    await productPage.skipNextSideButton();

    // await page.getByRole('button', { name: 'Upload New' || "Change Design" }).click();
    // // await page.getByRole('button', { name: 'Upload Your Design' }).click();
    // await productPage.uploadImage(back);


    // Add to cart (unless explicitly skipped)
    if (!item.skipAddToCart) {
        await productPage.addToCart();
    }

    // Cart
    await cartPage.goToCart();
    await cartPage.dismissPopup();

    await page.getByRole('button', { name: "Edit" }).first().click();
    await page.waitForTimeout(5000); // Or use await page.waitForSelector(...) for a faster, dynamic wait
    // Click the customization options dropdown/trigger
    // await page.getByAltText('Open customization options').click();
    await page.locator('.popup-content > .sc-78443d8a-0 > .showSelectBox > .sc-872f786b-0').click();
    const sizeOptions = await page.locator('#breadcrumLayout > div.filterContainer > div:nth-child(3) > div.sc-6d6ebfd8-2.eKDcsO > div > div > div.popup-content > div > div.sc-b92d13e2-0.cRFlLG > div.sc-b92d13e2-4.ivUrlL > div')
        .evaluateAll(elements =>
            elements.map(el => el.textContent.trim())
        );
    console.log("The Available Size Option are: ", sizeOptions);
    await page.waitForTimeout(5000);

    for (const option of sizeOptions) {

        await page.locator(`div[title="${option}"]`).last().click();

        await page.waitForTimeout(5000);

        const price = await page
            .getByRole('button', { name: /Confirm/i })
            .last()
            .textContent();

        const ActualPrice = price.split(' ')[1];

        console.log(`The Price of Size: ${option} is : ${ActualPrice}`);

        await page.waitForTimeout(5000);

        if (option == 'Custom Size') {
            await page.getByRole('button', { name: /confirm/i }).last().click();
        }
    }

    await productPage.skipNextSideButton();

    // Add to cart (unless explicitly skipped)
    await page.getByRole('button', { name: "Preview" }).click();
    await page.getByRole('button', { name: "plus", exact: true }).click();

    await page.getByRole('button', { name: "Confirm Changes" }).last().click();

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

})


test('Edit Case - Change Design', async ({ page }) => {
    test.setTimeout(300000);
    const front = fileType[2]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const back = fileType[3]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const homePage = new PillowHomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Open Website
    await homePage.open();
    console.log("✅ Website opened successfully");

    // Step 2: Navigate to Pillow -> Custom Square Throw Pillow
    await homePage.navigate(item.category, item.product);

    if (item.customOptions) {
        console.log('⏳ Settle time before custom options...');
        await page.waitForTimeout(5000);
        await productPage.handleCustomOptions(item.customOptions);
    }

    // PDP — Personalize + Upload
    await productPage.personalizeDesign();
    await productPage.uploadImage(front);

    await productPage.skipNextSideButton();

    // await page.getByRole('button', { name: 'Upload New' || "Change Design" }).click();
    // // await page.getByRole('button', { name: 'Upload Your Design' }).click();
    // await productPage.uploadImage(back);


    // Add to cart (unless explicitly skipped)
    if (!item.skipAddToCart) {
        await productPage.addToCart();
    }

    // Cart
    await cartPage.goToCart();
    await cartPage.dismissPopup();

    await page.getByRole('button', { name: "Edit" }).first().click();
    await page.waitForTimeout(5000); // Or use await page.waitForSelector(...) for a faster, dynamic wait

    // await page.getByRole('button', { name: 'Upload New' || "Change Design" }).click();
    await page.getByRole('button', { name: /Upload New|Change Design/ }).click();
    // await page.getByRole('button', { name: 'Upload Your Design' }).click();
    // Temporarily reassign locators to skip button click and target the active "Browse Files" button in this call only
    const originalBtn = productPage.uploadYourDesignBtn;
    const originalFileText = productPage.uploadFileText;
    productPage.uploadYourDesignBtn = page.locator('#non-existent-button-to-skip-click');
    productPage.uploadFileText = page.getByText('Browse Files').last();

    await productPage.uploadImage(back);

    // Restore original locators
    productPage.uploadYourDesignBtn = originalBtn;
    productPage.uploadFileText = originalFileText;

    await productPage.skipNextSideButton();

    // Add to cart (unless explicitly skipped)
    await page.getByRole('button', { name: "Preview" }).click();
    await page.getByRole('button', { name: "Confirm Changes" }).last().click();

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

})


test('Add to Save for Later & Move back to Cart', async ({ page }) => {
    test.setTimeout(300000);
    const front = fileType[2]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const back = fileType[3]; // 0: test_png.png, 1: test_jpeg.jpeg, 2: test_pdf.pdf, 3: test_svg.svg
    const homePage = new PillowHomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Open Website
    await homePage.open();
    console.log("✅ Website opened successfully");

    // Step 2: Navigate to Pillow -> Custom Square Throw Pillow
    await homePage.navigate(item.category, item.product);

    if (item.customOptions) {
        console.log('⏳ Settle time before custom options...');
        await page.waitForTimeout(5000);
        await productPage.handleCustomOptions(item.customOptions);
    }

    // PDP — Personalize + Upload
    await productPage.personalizeDesign();
    await productPage.uploadImage(front);

    await productPage.skipNextSideButton();

    // await page.getByRole('button', { name: 'Upload New' || "Change Design" }).click();
    // // await page.getByRole('button', { name: 'Upload Your Design' }).click();
    // await productPage.uploadImage(back);


    // Add to cart (unless explicitly skipped)
    if (!item.skipAddToCart) {
        await productPage.addToCart();
    }

    // Cart
    await cartPage.goToCart();
    await cartPage.dismissPopup();

    await page.getByRole('button', { name: "Save for Later" }).first().click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: "Move to Cart" }).first().click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: "Save for Later" }).first().click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: "Delete" }).first().click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: "Yes, Delete" }).first().click();
    await page.waitForTimeout(5000);
    console.log("✅ Done: " + item.category + " -> " + item.product + " -> Save for Later");
    await page.close();
})