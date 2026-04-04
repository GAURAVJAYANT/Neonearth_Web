
const { test, expect, chromium } = require('@playwright/test');
const path = require('path');
const fs  = require('fs');
const config = require('../playwright.config.js');
const baseURL = config.use.baseURL || 'https://test.neonearth.com';

// ─── RUN ALL INSTANCES IN PARALLEL ───────────────────────────────────────────
test.describe.configure({ mode: 'parallel' });

// ─── SLOW-SYSTEM WAIT MULTIPLIER ─────────────────────────────────────────────
// Increase this number (e.g. 2 or 3) if your system is even slower
const SLOW = 1.5;
const wait = (ms) => new Promise(r => setTimeout(r, Math.round(ms * SLOW)));

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

async function dismissPopup(page) {
  try {
    const popup = page.locator(
      'label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close'
    ).first();
    if (await popup.isVisible({ timeout: 3000 })) {
      await popup.click({ force: true });
    }
  } catch (_) {}
}

async function safeNetworkIdle(page, timeout = 20000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (_) {
    await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {});
  }
}

async function fillStripeField(page, iframeName, fieldName, value, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const frame = page.frameLocator(`iframe[name^="${iframeName}"]`).first();
      const input = frame.getByRole('textbox', { name: fieldName });
      await input.waitFor({ state: 'visible', timeout: 15000 });
      await input.fill(value);
      return;
    } catch (e) {
      if (attempt === retries) throw e;
      await wait(2000); // extra wait between stripe retries on slow systems
    }
  }
}


for (let instanceIndex = 1; instanceIndex <= 15; instanceIndex++) {

  test(`NeonEarth Full Journey — Instance ${instanceIndex}`, async () => {

    test.setTimeout(600000); // 6 min ceiling — extra buffer for slow systems
    const tag = `[Instance ${instanceIndex}]`;
    console.log(`${tag} 🚀 Starting`);

    
    await wait((instanceIndex - 1) * 3000);

    
    const browser = await chromium.launch({
      headless: false,
      args: [
        // Tile windows in a 5-column × 2-row grid so you can watch all 10
        `--window-position=${((instanceIndex - 1) % 5) * 310},${Math.floor((instanceIndex - 1) / 5) * 280}`,
        '--window-size=1280,800',
        '--disable-dev-shm-usage',  // prevents crashes on low-memory systems
        '--no-sandbox',
      ],
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page    = await context.newPage();

    // Auto-dismiss popups whenever they appear mid-test
    await page.addLocatorHandler(
      page.locator(
        'label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close'
      ).first(),
      async (closeBtn) => {
        try { await closeBtn.click({ force: true }); } catch (_) {}
      }
    );

    try {

     
      console.log(`${tag} Step 1: Opening homepage`);
      await page.goto(baseURL + '/', {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await expect(page).toHaveURL(baseURL + '/');
      await safeNetworkIdle(page, 15000);
      await wait(2000);             // let JS animations settle on slow CPUs
      await dismissPopup(page);
      console.log(`${tag} ✅ Homepage loaded`);

      
      console.log(`${tag} Step 2+3: Hover Tapestries → Velvet Satin`);
      const MAX_HOVER = 5;

      for (let attempt = 1; attempt <= MAX_HOVER; attempt++) {
        try {
          const menu = page.locator(
            'nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text',
            { hasText: 'Tapestries' }
          );
          await menu.waitFor({ state: 'visible', timeout: 15000 });
          await menu.scrollIntoViewIfNeeded();

          const menuBox = await menu.boundingBox();
          if (!menuBox) throw new Error('No bounding box for Tapestries');

          await page.mouse.move(0, 0);
          await wait(400);
          await page.mouse.move(
            menuBox.x + menuBox.width  / 2,
            menuBox.y + menuBox.height / 2,
            { steps: 15 }           // smooth movement → reliable CSS :hover
          );
          console.log(`${tag}   Attempt ${attempt}: hovered Tapestries`);

          // Longer timeout on slow systems; grows each failed attempt
          const dropdownTimeout = 8000 + attempt * 2500;
          const dropdown = page.locator('div.dropdown.open div.mega-menu-container');
          await dropdown.waitFor({ state: 'visible', timeout: dropdownTimeout });
          console.log(`${tag}   Dropdown visible`);

          // Move mouse INTO the dropdown to stop mouseleave from closing it
          const dropdownBox = await dropdown.boundingBox();
          if (dropdownBox) {
            await page.mouse.move(
              dropdownBox.x + dropdownBox.width / 2,
              dropdownBox.y + 30,
              { steps: 8 }
            );
          }
          await wait(700); // let dropdown fully render before clicking child

          const velvetSatin = page.locator('span.product-text', {
            hasText: 'Custom Wall Tapestry - Velvet Satin',
          });
          await velvetSatin.waitFor({ state: 'visible', timeout: 8000 });
          await velvetSatin.click();

          console.log(`${tag} ✅ Velvet Satin clicked (attempt ${attempt})`);
          break;

        } catch (e) {
          console.log(`${tag}   Hover attempt ${attempt} failed: ${e.message.split('\n')[0]}`);
          if (attempt === MAX_HOVER) throw e;
          await page.mouse.move(0, 0);
          await wait(attempt * 2000); // back-off grows per attempt
        }
      }

      
      await expect(page).toHaveURL(/custom-wall-tapestry-p/i, { timeout: 20000 });
      await safeNetworkIdle(page, 15000);
      await wait(2500);
      await dismissPopup(page);
      console.log(`${tag} ✅ On product page`);

      
      console.log(`${tag} Step 5: Clicking Personalise`);
      const personaliseBtn = page.getByRole('img', { name: 'paintBrush' });
      await personaliseBtn.waitFor({ state: 'visible', timeout: 20000 });
      await wait(1200);
      await personaliseBtn.click();

      const uploadBtn = page.getByRole('button', { name: /plus Upload Your Design/i });
      await uploadBtn.waitFor({ state: 'visible', timeout: 45000 }); // panel can be slow
      await wait(2000);
      console.log(`${tag} ✅ Upload panel ready`);

     
      console.log(`${tag} Step 6: Uploading image`);
      await uploadBtn.click();
      await wait(2500);

      const browseFiles = page.getByText('Browse Files');
      await browseFiles.waitFor({ state: 'visible', timeout: 20000 });
      await wait(1200);

      const testImagePath = path.resolve('data/test_image.png');
      if (!fs.existsSync(testImagePath)) {
        throw new Error(`Test image not found at: ${testImagePath}`);
      }

      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 15000 }),
        browseFiles.click(),
      ]);
      await fileChooser.setFiles(testImagePath);
      console.log(`${tag} ✅ File set — waiting for upload to process`);

      
      console.log(`${tag} Step 7: Waiting for Preview button`);
      await wait(4000); // upload POST takes extra time on slow networks
      const previewBtn = page.getByRole('button', { name: /^Preview$/i });
      await previewBtn.waitFor({ state: 'visible', timeout: 130000 });
      await wait(1500);
      await previewBtn.click();
      console.log(`${tag} ✅ Preview clicked`);

      
      console.log(`${tag} Step 8: Add To Cart`);
      await wait(3500); // preview render takes time on slow systems
      const atcBtn = page.getByRole('button', { name: /Add To Cart/i }).nth(2);
      await atcBtn.waitFor({ state: 'visible', timeout: 40000 });
      await wait(1200);
      await atcBtn.click();
      console.log(`${tag} ✅ Add To Cart clicked`);
      await safeNetworkIdle(page, 15000);
      await wait(2500);

      
      console.log(`${tag} Step 9: Verifying cart`);
      await page.goto(baseURL + '/checkout/cart', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await safeNetworkIdle(page, 15000);
      await wait(2500);
      await dismissPopup(page);

      const cartContent = await page.content();
      const cartIsEmpty = cartContent.includes('Your cart is empty');
      console.log(`${tag} Cart is ${cartIsEmpty ? 'EMPTY ' : 'populated '}`);
      expect(cartIsEmpty, 'Cart should not be empty after ATC').toBe(false);

      
      console.log(`${tag} Step 10: Proceeding to checkout`);
      const checkoutBtn = page.getByRole('button', { name: /Secure Checkout/i });
      await checkoutBtn.waitFor({ state: 'visible', timeout: 20000 });
      await wait(1200);
      await checkoutBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await safeNetworkIdle(page, 18000);
      await wait(3500); // checkout page has heavy JS — let it fully initialise
      await dismissPopup(page);
      console.log(`${tag}  On checkout page`);

      
      console.log(`${tag} Step 11: Filling shipping form`);
      const uniqueEmail = `test_i${instanceIndex}_${Date.now()}@yopmail.com`;

      const emailInput = page.getByRole('textbox', { name: /email address/i });
      await emailInput.waitFor({ state: 'visible', timeout: 30000 });
      await emailInput.fill(uniqueEmail);
      await wait(600);

      await page.getByRole('textbox', { name: /First Name/i }).fill('Gaurav');
      await wait(400);
      await page.getByRole('textbox', { name: /Last Name/i }).fill('Jayant');
      await wait(400);
      await page.getByRole('textbox', { name: /Mobile Number/i }).fill('8888888888');
      await wait(400);

      try {
        const companyInput = page.getByRole('textbox', { name: /Company Name/i });
        if (await companyInput.isVisible({ timeout: 2500 })) {
          await companyInput.fill('QA Automation');
        }
      } catch (_) {}

      console.log(`${tag}  Personal details filled`);

     
      console.log(`${tag} Step 12: Filling address`);
      const addressInput = page.getByRole('textbox', { name: 'Address*', exact: true });
      await addressInput.waitFor({ state: 'visible', timeout: 15000 });
      await addressInput.fill('New York');
      await wait(3500); 

      try {
        await page.waitForSelector('text=New YorkNY, USA', { timeout: 12000 });
        await page.getByText('New YorkNY, USA').click({ timeout: 8000 });
        console.log(`${tag}   Autocomplete selected`);
        await wait(2500); // let address fields auto-populate
      } catch (_) {
        console.log(`${tag}   Autocomplete not shown — filling manually`);
      }

      try {
        const aptInput = page.getByRole('textbox', { name: /Apartment/i });
        if (await aptInput.isVisible({ timeout: 2500 })) {
          await aptInput.fill('Apt 31');
        }
      } catch (_) {}

      const postcodeInput = page.getByRole('textbox', { name: /Postcode/i });
      await postcodeInput.waitFor({ state: 'visible', timeout: 10000 });
      await postcodeInput.fill('10001');
      await wait(600);

      const cityInput = page.getByRole('textbox', { name: /City/i });
      await cityInput.waitFor({ state: 'visible', timeout: 10000 });
      await cityInput.fill('New York');
      await wait(1200);
      console.log(`${tag}  Address filled`);

      
      console.log(`${tag} Step 13: Filling Stripe fields`);
      await wait(3000); 
      try {
        await fillStripeField(page, '__privateStripeFrame', 'Card number',     '4111 1111 1111 1111');
        await wait(1000);
        await fillStripeField(page, '__privateStripeFrame', 'Expiration date', '12 / 27');
        await wait(1000);
        await fillStripeField(page, '__privateStripeFrame', 'Security code',   '123');
        await wait(1000);
        console.log(`${tag}  Stripe fields filled`);
      } catch (e) {
        console.log(`${tag} Stripe error: ${e.message.split('\n')[0]}`);
      }

      
      console.log(`${tag} Step 14: Clicking Pay Now`);
      await wait(2000); // small pause before submit avoids double-submit race
      await page.getByRole('button', { name: /Pay Now/i }).click();

      try {
        await page.waitForURL(/success/i, { timeout: 120000 });
        console.log(`${tag} ✅ Redirected to success page`);
      } catch (_) {
        console.log(`${tag} ⚠️ Timeout on success redirect. URL: ${page.url()}`);
      }

      
      const finalUrl = page.url();
      expect(finalUrl, 'Expected to land on success page').toContain('success');
      console.log(`${tag} ✅ Order placed! URL: ${finalUrl}`);

      
      await wait(2500);
      await dismissPopup(page);

      const screenshotDir = 'screenshots';
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: `${screenshotDir}/success-instance-${instanceIndex}-${Date.now()}.png`,
        fullPage: false,
      });
      console.log(`${tag} ✅ Screenshot saved`);

      try {
        const hashSpans = page.locator('//span[starts-with(normalize-space(), \'#\')]');
        const count = await hashSpans.count();
        console.log(`${tag} Found ${count} span(s) starting with '#':`);
        for (let j = 0; j < count; j++) {
          const text = await hashSpans.nth(j).innerText();
          console.log(`${tag}   [${j + 1}] ${text.trim()}`);
        }
      } catch (e) {
        console.log(`${tag} Could not retrieve hash spans: ${e.message.split('\n')[0]}`);
      }

      // Keep window open so you can read the order number on screen
      console.log(`${tag} ⏳ Keeping window open 20 s...`);
      await wait(20000);
      console.log(`${tag} 🎉 Journey complete!`);

    } finally {
      // Always close the dedicated browser — even if a step threw
      await context.close();
      await browser.close();
    }
  });
}
