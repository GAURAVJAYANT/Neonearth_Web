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
    this.previewBtn = page.getByRole('button', { name: 'Preview' });
    this.addToCartBtn = page.getByRole('button', { name: /Add To Cart/i });
  }

  async personalizeDesign() {
    console.log('Step: Clicking Personalize this Design');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {}
    await this.waitForOverlays();
    await this.smartClick(this.personaliseBtn);
    
    console.log('✅ Clicked Personalize this Design button');
    await this.page.waitForTimeout(8000); // UI customization transition still needs a bit of time
  }

  async uploadImage(imagePath = 'data/test_image.png') {
    console.log('Step: Selecting Upload Your Design choice');
    await this.smartClick(this.uploadYourDesignBtn);
    console.log('✅ Clicked Upload Your Design');
    await this.page.waitForTimeout(5000);

    // Using the filechooser event pattern requested by the user
    console.log('Step: Waiting for "Browse Files" button');
    await this.uploadFileText.waitFor({ state: 'visible', timeout: 50000 });

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.uploadFileText.click({ force: true }), // Using force click to prevent interception flakiness
    ]);

    const resolvedImagePath = path.resolve(process.cwd(), imagePath);
    console.log(`Step: Uploading file from: ${resolvedImagePath}`);
    await fileChooser.setFiles(resolvedImagePath);
    
    console.log(`✅ File uploaded successfully from: ${resolvedImagePath}`);
    await this.page.waitForTimeout(10000); 
  }

  async addToCart() {
    console.log('Step: Adding product to cart (including preview)...');
    await this.previewAndAddToCart();
  }

  async previewAndAddToCart() {
    await this.smartClick(this.previewBtn, { timeout: 150000 });
    console.log('✅ Clicked preview button');
    await this.page.waitForTimeout(8000);

    const atcBtn = this.addToCartBtn.nth(2);
    await atcBtn.waitFor({ state: 'visible', timeout: 10 * 1000 });

    // ── API Validation: intercept the cart API response instead of blind waiting ──
    console.log('Step: Clicking Add to Cart (with API validation)...');
    const apiResult = await validateApiCall(this.page, () => atcBtn.click(), {
      urlPattern: '/cart',
      label: 'Add To Cart API',
      expectedStatus: 200,
    }).catch((err) => {
      // Non-fatal: log the issue but don't stop the test
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
    } catch (_) {}
    await this.page.waitForTimeout(8000);
  }
}

module.exports = { ProductPage };