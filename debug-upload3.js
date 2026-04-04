const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://test.neonearth.com/custom-wall-tapestry-p?variant_sku=NE-SKU-133-335&list_material_type=list_mt_satin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // dismiss popups
  try {
    const popup = page.locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close').first();
    if (await popup.isVisible({ timeout: 3000 })) {
      await popup.click({ force: true });
    }
  } catch(e) {}

  // 1: Click paintbrush
  const paintBrush = page.getByRole('img', { name: 'paintBrush' });
  await paintBrush.waitFor({ state: 'visible', timeout: 5000 });
  await paintBrush.click();
  await page.waitForTimeout(4000);

  // 2: Click Personalize this Design (The first button in the panel)
  const personalizeBtn = page.getByRole('button', { name: 'Personalize this Design' });
  await personalizeBtn.waitFor({ state: 'visible', timeout: 5000 });
  await personalizeBtn.click();
  await page.waitForTimeout(4000);

  // 3: Click Upload Your Design
  const uploadYourDesignBtn = page.getByRole('button', { name: 'Upload Your Design' });
  await uploadYourDesignBtn.waitFor({ state: 'visible', timeout: 5000 });
  await uploadYourDesignBtn.click();
  await page.waitForTimeout(4000);

  const output = { buttons: [], texts: [] };
  
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
     const text = await buttons.nth(i).innerText();
     if (text.trim().length > 0) {
       output.buttons.push({
         text: text.trim().replace(/\n/g, ' '),
         aria: await buttons.nth(i).getAttribute('aria-label')
       });
     }
  }

  const texts = page.locator(':text-matches("Upload|Browse|File", "i")');
  const textCount = await texts.count();
  for (let i = 0; i < textCount; i++) {
     output.texts.push({
         tag: await texts.nth(i).evaluate(n => n.tagName),
         class: await texts.nth(i).getAttribute('class'),
         text: (await texts.nth(i).innerText()).trim().replace(/\n/g, ' ')
     });
  }

  fs.writeFileSync('debug_output3.json', JSON.stringify(output, null, 2));
  await page.screenshot({ path: 'debug_upload3.png', fullPage: true });
  await browser.close();
})();
