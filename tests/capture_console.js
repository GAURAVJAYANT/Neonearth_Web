const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json'
    });
    const page = await context.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[CONSOLE ERROR] ${msg.text()}`);
        }
    });

    console.log('Navigating to product page...');
    await page.goto('https://www.neonearth.com/custom-wall-tapestry-p?variant_sku=NE-SKU-133-335&list_material_type=list_mt_satin');
    
    console.log('Clicking Personalize...');
    await page.getByRole('button', { name: /Personali[sz]e this Design/i }).click();
    
    console.log('Waiting for modal and potential errors...');
    await page.waitForTimeout(20000); // Wait long enough for components to fail

    console.log('Current URL:', page.url());
    
    // Check if the AI button exists now
    const neonAiBtn = page.getByRole('button', { name: /Generate With Neon AI/i });
    console.log('AI Button count:', await neonAiBtn.count());

    await browser.close();
})();
