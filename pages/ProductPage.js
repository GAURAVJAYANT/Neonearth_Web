const { expect } = require('@playwright/test');
const path = require('path');

class ProductPage {
  constructor(page) {
    this.page = page;
    this.personaliseBtn = page.getByRole('button', { name: /Personali[sz]e this Design/i });
    this.uploadYourDesignBtn = page.getByRole('button', { name: /Upload Your Design/i });
    this.uploadFileText = page.getByText('Browse Files');
    this.previewBtn = page.getByRole('button', { name: 'Preview' });
    this.addToCartBtn = page.getByRole('button', { name: /Add To Cart/i });
  }

  async personalizeDesign() {
    console.log('Step: Clicking Personalize this Design');
    await this.personaliseBtn.waitFor({ state: 'visible', timeout: 15000 });
    await this.personaliseBtn.click();
    console.log('✅ Clicked Personalize this Design button');
    await this.page.waitForTimeout(8000); // Wait for customizer to open
  }

  async uploadImage(imagePath = 'data/test_image.png') {
    console.log('Step: Selecting Upload Your Design choice');
    await this.uploadYourDesignBtn.waitFor({ state: 'visible', timeout: 20000 });
    await this.uploadYourDesignBtn.click();
    console.log('✅ Clicked Upload Your Design');
    await this.page.waitForTimeout(5000);

    // Using the filechooser event pattern requested by the user
    console.log('Step: Waiting for "Browse Files" button');
    await this.uploadFileText.waitFor({ state: 'visible', timeout: 50000 });

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.uploadFileText.click(),
    ]);

    const resolvedImagePath = path.resolve(process.cwd(), imagePath);
    console.log(`Step: Uploading file from: ${resolvedImagePath}`);
    await fileChooser.setFiles(resolvedImagePath);
    
    console.log(`✅ File uploaded successfully from: ${resolvedImagePath}`);

    // Processing the Custom Design often takes a VERY long time on test servers
    await this.page.waitForTimeout(10000); // 10 seconds for safety
  }

  async previewAndAddToCart() {
    await this.previewBtn.waitFor({ state: 'visible', timeout: 150000 });
    await this.previewBtn.click();
    console.log('✅ Clicked preview button');
    await this.page.waitForTimeout(8000);

    const atcBtn = this.addToCartBtn.nth(2);
    await atcBtn.waitFor({ state: 'visible', timeout: 10 * 1000 });
    await atcBtn.click();
    console.log('✅ Clicked add to cart button');

    try {
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (_) {}
    await this.page.waitForTimeout(8000);
  }
}

module.exports = { ProductPage };