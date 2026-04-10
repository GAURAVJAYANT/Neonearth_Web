const { test, expect } = require('@playwright/test');

test('Check Inside Customizer Iframe', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Navigating to product page...');
  await page.goto('https://test.neonearth.com/custom-wall-tapestry-p?variant_sku=NE-SKU-133-335&list_material_type=list_mt_satin');
  
  console.log('Clicking Personalize...');
  const personaliseBtn = page.getByRole('button', { name: /Personali[sz]e this Design/i });
  await personaliseBtn.waitFor({ state: 'visible', timeout: 15000 });
  await personaliseBtn.click();
  
  console.log('Waiting for customizer to open...');
  await page.waitForTimeout(10000);
  
  // Find the iframe
  const customizerFrame = page.frameLocator('#stjr-iframe, [name="stjr-iframe"]');
  
  console.log('Checking for AI buttons INSIDE the iframe...');
  const neonAiBtn = customizerFrame.getByRole('button', { name: /Generate With Neon AI/i });
  const count = await neonAiBtn.count();
  console.log(`Neon AI Button Count INSIDE Iframe: ${count}`);

  if (count > 0) {
    console.log('✅ Found AI Button inside iframe!');
    const isVisible = await neonAiBtn.isVisible();
    console.log(`Is Visible: ${isVisible}`);
  } else {
    console.log('❌ AI Button NOT found inside iframe.');
    // List all buttons inside the iframe
    const buttons = await customizerFrame.locator('button').allInnerTexts();
    console.log('Buttons inside iframe:', buttons);
  }

  await page.screenshot({ path: 'test-results/iframe_analysis.png', fullPage: true });
});
