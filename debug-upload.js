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

  let btn = page.getByRole('button', { name: 'Personalise this Design' });
  if (await btn.count() === 0) {
     btn = page.getByRole('img', { name: 'paintBrush' });
  }
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(5000);

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

  const texts = page.locator(':text-matches("Upload|Browse", "i")');
  const textCount = await texts.count();
  for (let i = 0; i < textCount; i++) {
     output.texts.push({
         tag: await texts.nth(i).evaluate(n => n.tagName),
         class: await texts.nth(i).getAttribute('class'),
         text: (await texts.nth(i).innerText()).trim().replace(/\n/g, ' ')
     });
  }

  fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
  await browser.close();
})();
