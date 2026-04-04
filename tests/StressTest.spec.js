const { test, expect } = require('@playwright/test');

// Configure test to run in parallel mode
test.describe.configure({ mode: 'parallel' });

const NUM_BROWSERS = 15;
const TOTAL_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const BASE_URL = '/';

// Selective internal links to avoid checkout/account pages
const SAFE_LINK_SELECTOR = 'a[href^="/"]:not([href="/"]):not([href^="/customer/"]):not([href^="/checkout/"]):not([href^="/cart/"]):not([href^="/wishlist/"]):not([href$=".jpg"]):not([href$=".png"]):not([target="_blank"])';

// Create 15 separate tests that will run in parallel across workers
for (let i = 1; i <= NUM_BROWSERS; i++) {
    test(`Browser Instance #${i}: Random Browsing Stress Test`, async ({ page }) => {
        // Set individual test timeout to 6 minutes
        test.setTimeout(360000);

        console.log(`\n🚀 [Browser #${i}] Starting 5-minute random browsing...`);

        try {
            await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForTimeout(2000);
        } catch (err) {
            console.error(`[Browser #${i}] Initial load failed: ${err.message}`);
        }

        const startTime = Date.now();
        const endTime = startTime + TOTAL_DURATION_MS;
        let actionCount = 0;

        while (Date.now() < endTime) {
            actionCount++;
            const actionSeed = Math.random();

            try {
                if (actionSeed < 0.6) {
                    // Click a random internal link
                    const links = await page.$$(SAFE_LINK_SELECTOR);
                    if (links.length > 0) {
                        const randomLink = links[Math.floor(Math.random() * links.length)];
                        const href = await randomLink.evaluate(el => el.href);
                        const relativePath = href.replace(BASE_URL, '/').replace(new RegExp('^https?://[^/]+'), '');

                        console.log(`[Browser #${i}] 🖱️ Action #${actionCount}: Clicking link: ${relativePath}`);
                        await randomLink.click();
                        await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
                    } else {
                        console.log(`[Browser #${i}] No safe links found, going home`);
                        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
                    }
                } else if (actionSeed < 0.85) {
                    // Scroll down
                    const distance = Math.floor(Math.random() * 800) + 300;
                    console.log(`[Browser #${i}] 📜 Action #${actionCount}: Scrolling down ${distance}px`);
                    await page.evaluate((d) => window.scrollBy(0, d), distance);
                } else if (actionSeed < 0.95) {
                    // Navigate back
                    console.log(`[Browser #${i}] 🔙 Action #${actionCount}: Navigating back`);
                    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => page.goto(BASE_URL));
                } else {
                    // Return to homepage
                    console.log(`[Browser #${i}] 🏠 Action #${actionCount}: Returning to homepage`);
                    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
                }
            } catch (err) {
                console.error(`[Browser #${i}] ⚠️ Action failed: ${err.message.split('\n')[0]}`);
                await page.goto(BASE_URL, { timeout: 20000 }).catch(() => {});
            }

            // Random reading time (3-8 seconds)
            const delay = 3000 + Math.random() * 5000;
            if (Date.now() + delay < endTime) {
                await page.waitForTimeout(delay);
            }
        }

        console.log(`[Browser #${i}] ✅ Completed 5-minute stress session.`);
    });
}