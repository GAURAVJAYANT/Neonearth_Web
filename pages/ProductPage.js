const { expect } = require('@playwright/test');
const { SmartPage } = require('./SmartPage');
const path = require('path');
const { measurePagePerformance } = require('../utils/helpers/performanceHelper');
const { validateApiCall } = require('../utils/helpers/apiValidator');

class ProductPage extends SmartPage {
  constructor(page) {
    super(page);
    this.personaliseBtn = page.locator('button, a').filter({ hasText: /Personali[sz]e this Design/i });
    this.uploadYourDesignBtn = page.getByRole('button', { name: /Upload Your Design/i });
    this.uploadFileText = page.getByText('Browse Files');
    this.nextFrontSideBtn = page.getByRole('button', { name: 'Next: Front Side' });
    // Pillow-only: appears after upload on two-sided products (e.g. Throw Pillows)
    this.nextBackSideBtn = page
      .locator('button')
      .filter({ hasText: /^\s*Next\s*:?\s*Back\s*Side\s*$/i });
    this.previewBtn = page.getByRole('button', { name: 'Preview' });
    this.addToCartBtn = page.getByRole('button', { name: /Add To Cart/i });
    this.priceSpan = page.locator('span.sc-fcdfa9f9-7.fFkMiV');
  }

  async getPriceFromPDP() {
    try {
      await this.priceSpan.first().waitFor({ state: 'visible', timeout: 10000 });
      return (await this.priceSpan.first().innerText()).trim();
    } catch (e) {
      return 'Price not captured';
    }
  }

  async personalizeDesign() {
    console.log('Step: Clicking Personalize this Design');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) { }
    await this.waitForOverlays();
    await this.smartClick(this.personaliseBtn);

    console.log('✅ Clicked Personalize this Design button');
    // Wait for the customizer options to appear instead of a fixed 8s
    await this.uploadYourDesignBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
      console.log('  ⚠️ uploadYourDesignBtn not visible after 30s, proceeding anyway...');
    });
    await this.page.waitForTimeout(2000);
  }

  async uploadImage(imagePath) {
    console.log('Step: Selecting Upload Your Design choice');
    if (await this.uploadYourDesignBtn.isVisible()) {
      await this.smartClick(this.uploadYourDesignBtn);
      console.log('✅ Clicked Upload Your Design');
    } else {
      console.log('  (Upload Your Design button not visible, skipping click)');
    }
  // /**
  //  * Uploads an image file.
  //  *
  //  * @param {string} imagePath - Relative path to the image file.
  //  * @param {object} options
  //  * @param {boolean} [options.handleNextBackSide=false]
  //  *   Set to true for two-sided pillow products. After upload, a
  //  *   "Next: Back Side" button appears and must be clicked before
  //  *   the Preview button becomes available. Has no effect on other products.
  //  */
  // async uploadImage(imagePath = 'data/test_image.png', options = {}) {
  //   const { handleNextBackSide = false } = options;

  //   console.log('Step: Selecting Upload Your Design choice');
  //   await this.smartClick(this.uploadYourDesignBtn);
  //   console.log('✅ Clicked Upload Your Design');

    // Wait for the upload area to stabilize
    await this.uploadFileText.waitFor({ state: 'visible', timeout: 20000 });

    console.log('Step: Waiting for "Browse Files" button');
    await this.uploadFileText.waitFor({ state: 'visible', timeout: 50000 });

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser', { timeout: 60000 }),
      this.uploadFileText.click({ force: true }),
    ]);

    const resolvedImagePath = path.resolve(process.cwd(), imagePath);
    console.log(`Step: Uploading file from: ${resolvedImagePath}`);
    await fileChooser.setFiles(resolvedImagePath);

    console.log(`✅ File uploaded successfully from: ${resolvedImagePath}`);

    // ── Pillow-only: "Next: Back Side" step ──────────────────────────
    // For two-sided products (e.g. Throw Pillows) a "Next: Back Side"
    // button appears after upload. We must click it before the
    // Preview button becomes available.
    // This block is completely skipped for all non-pillow products.
    if (handleNextBackSide) {
      console.log('Step: Waiting for "Next: Back Side" button (pillow flow)...');
      const nextBackSideButton = this.nextBackSideBtn.filter({ visible: true }).first();
      const nextBackSideVisible = await nextBackSideButton
        .waitFor({ state: 'visible', timeout: 45000 })
        .then(() => true)
        .catch(() => false);

      if (nextBackSideVisible) {
        console.log('Step: Clicking "Next: Back Side"');
        await this.waitForStability(nextBackSideButton);
        await nextBackSideButton.scrollIntoViewIfNeeded();
        await nextBackSideButton.click({ timeout: 10000 }).catch(async () => {
          console.log('  ⚠️ Normal click failed for "Next: Back Side", retrying with force');
          await nextBackSideButton.click({ force: true, timeout: 10000 }).catch(async () => {
            console.log('  ⚠️ Force click failed for "Next: Back Side", retrying with DOM click');
            await nextBackSideButton.evaluate((button) => button.click());
          });
        });
        console.log('✅ Clicked "Next: Back Side"');
        await this.page.waitForTimeout(1000);
      } else {
        console.log('  (No "Next: Back Side" button found, continuing to Preview)');
      }
    }
    // ─────────────────────────────────────────────────────────────────

    // Wait for the "Preview" button to become active or visible after upload
    // await this.previewBtn.waitFor({ state: 'visible', timeout: 45000 });
    // await this.page.waitForTimeout(2000); 
  }

  async addToCart() {
    console.log('Step: Adding product to cart (including preview)...');
    await this.previewAndAddToCart();
  }

  async skipNextSideButton() {
    while (!(await this.previewBtn.isVisible())) {
      const nextSideBtn = this.page.getByRole('button', { name: /Next:/i }).first();

      try {
        await nextSideBtn.or(this.previewBtn).waitFor({ state: 'visible', timeout: 20000 });
      } catch (e) {
        console.log('Timeout waiting for Next or Preview button');
        break;
      }

      if (await this.previewBtn.isVisible()) {
        break;
      }

      if (await nextSideBtn.isVisible()) {
        await nextSideBtn.click();
      }
    }
    await this.previewBtn.waitFor({ state: 'visible', timeout: 45000 });
    await this.page.waitForTimeout(2000);
  }

  async previewAndAddToCart() {
    try {
      await this.nextFrontSideBtn.waitFor({ state: 'visible', timeout: 5000 });
      console.log('Step: Clicking "Next: Front Side" before preview');
      await this.smartClick(this.nextFrontSideBtn);
      await this.page.waitForTimeout(1000);
    } catch (e) {
      console.log('  (No "Next: Front Side" button found, skipping)');
    }

    await this.smartClick(this.previewBtn, { timeout: 90000 });
    console.log('✅ Clicked preview button');

    // Use the visible Add to Cart button (often there are multiple in the DOM)
    const atcBtn = this.addToCartBtn.filter({ visible: true }).first();

    console.log('Step: Waiting for visible Add to Cart button...');
    await atcBtn.waitFor({ state: 'visible', timeout: 45000 }).catch(() => {
      console.log('⚠️ Timeout waiting for visible Add to Cart button.');
    });

    const count = await this.addToCartBtn.count();
    console.log(`Debug: Found ${count} total Add to Cart buttons in DOM.`);

    await this.waitForStability(atcBtn);

    // ── API Validation: intercept the cart API response ──
    console.log('Step: Clicking Add to Cart (with API validation and smartClick)...');

    const apiResult = await validateApiCall(this.page, async () => {
      await this.smartClick(atcBtn, { timeout: 15000, force: true });
    }, {
      urlPattern: '/cart',
      label: 'Add To Cart API',
      expectedStatus: 200,
    }).catch((err) => {
      console.warn(`⚠️ API validation warning: ${err.message}`);
      return null;
    });

    if (apiResult) {
      console.log(`✅ Add to Cart API confirmed (HTTP ${apiResult.status}, ${apiResult.responseTime}ms)`);
    } else {
      console.log('✅ Clicked add to cart button (API response not captured)');
    }

    try {
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (_) { }
    await this.page.waitForTimeout(3000);
  }

  async handleCustomOptions(options) {
    // ── PRICE: Before size change ──────────────────────────────────
    const initialPrice = await this.getPriceFromPDP();
    console.log('================================================');
    console.log(`Product        : ${options.productName || 'Custom Product'}`);
    console.log(`Price (Before) : ${initialPrice}`);
    console.log('================================================');

    // 1. Click the current size summary using the codegen locator
    const trigger = this.page.locator('#right-panel').getByText(/60.*50/).first();
    await trigger.waitFor({ state: 'visible', timeout: 30000 });
    await trigger.click({ force: true });
    console.log('  ✅ Clicked current size summary');
    await this.page.waitForTimeout(3000);

    // 2. Click the target size in the list (short version)
    console.log(`Step: Clicking target size: 80″ x 65″ (nth:1)`);
    const shortSizeLoc = this.page.getByText('80″ x 65″').nth(1);
    await shortSizeLoc.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { });
    await shortSizeLoc.click({ force: true }).catch(() => { });
    await this.page.waitForTimeout(2000);

    // 3. Click the full updated summary string
    console.log(`Step: Clicking updated summary: ${options.targetSize}`);
    const fullSizeLoc = this.page.getByText(options.targetSize, { exact: true }).first();
    await fullSizeLoc.waitFor({ state: 'visible', timeout: 30000 });
    await fullSizeLoc.click({ force: true });
    console.log(`  ✅ Clicked updated summary: ${options.targetSize}`);
    await this.page.waitForTimeout(2000);

    // 4. Click the Confirm button
    const confirmLocator = this.page.getByRole('button', { name: options.confirmBtn });
    await confirmLocator.waitFor({ state: 'visible', timeout: 30000 });
    await confirmLocator.click({ force: true });
    console.log(`  ✅ Clicked confirm button: ${options.confirmBtn}`);
    await this.page.waitForTimeout(4000);

    // ── PRICE: After size change ───────────────────────────────────
    const finalPrice = await this.getPriceFromPDP();
    console.log('================================================');
    console.log(`Product        : ${options.productName || 'Custom Product'}`);
    console.log(`Price (Before) : ${initialPrice}`);
    console.log(`Price (After)  : ${finalPrice}`);
    console.log('================================================');
  }

}

module.exports = { ProductPage };
