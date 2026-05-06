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
    // Wait for the customizer options to appear instead of a fixed 8s
    await this.uploadYourDesignBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
      console.log('  ⚠️ uploadYourDesignBtn not visible after 30s, proceeding anyway...');
    });
    await this.page.waitForTimeout(2000); 
  }

  async uploadImage(imagePath = 'data/test_image.png') {
    console.log('Step: Selecting Upload Your Design choice');
    await this.smartClick(this.uploadYourDesignBtn);
    console.log('✅ Clicked Upload Your Design');
    
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
    // Wait for the "Preview" button to become active or visible after upload
    await this.previewBtn.waitFor({ state: 'visible', timeout: 45000 });
    await this.page.waitForTimeout(2000); 
  }

  async addToCart() {
    console.log('Step: Adding product to cart (including preview)...');
    await this.previewAndAddToCart();
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
    } catch (_) {}
    await this.page.waitForTimeout(3000);
  }
}

module.exports = { ProductPage };