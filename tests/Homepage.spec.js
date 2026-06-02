// tests/Homepage.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Neonearth Homepage Tests
//   • Functional checks: load, logo, promo, nav, search, hero, footer
//   • Responsive banner checks: iPhone │ Android │ iPad │ Desktop
// ─────────────────────────────────────────────────────────────────────────────

const { test } = require('@playwright/test');
const { NeonearthHomePage } = require('../pages/NeonearthHomePage');

// ── Real device profiles used for the responsive tests ───────────────────────
const DEVICES = [
  {
    label: 'iPhone',
    viewport: { width: 390, height: 844 },     // iPhone 14
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
  {
    label: 'Android',
    viewport: { width: 412, height: 915 },     // Pixel 8
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  },
  {
    label: 'iPad',
    viewport: { width: 820, height: 1180 },    // iPad Air (landscape = 1180×820)
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
  {
    label: 'Desktop',
    viewport: { width: 1920, height: 1080 },   // Full-HD desktop
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Functional Homepage Tests  (run at the default / Desktop viewport)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Neon Earth Homepage — Functional', () => {
  test.describe.configure({ retries: 2 });
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.openHomepage();
  });

  test('Homepage loads successfully', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertHomepageLoaded();
  });

  test('Logo is visible and clickable', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertLogoVisible();
    await homePage.clickLogoAndVerifyHome();
  });

  test('Promo bar is visible', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertPromoBarVisible();
  });

  test('Free shipping message is visible', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertFreeShippingVisible();
  });

  test('Header navigation categories are visible', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertDesktopNavigationVisible();
  });

  test('Search bar works', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.searchFor('tapestry');
    await homePage.assertSearchResult('tapestry');
  });

  test('Hero banner images are visible', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertHeroImagesVisible();
  });

  test('Hero CTA opens product listing page', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.clickHeroCtaAndVerifyNavigation();
  });

  test('Footer links are visible and valid', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    await homePage.assertFooterLinksVisibleAndValid();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Responsive Banner Tests — individual test per device
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Neon Earth Homepage — Responsive Banner', () => {
  test.describe.configure({ retries: 1 });
  test.setTimeout(180000);

  for (const device of DEVICES) {
    test(
      `Homepage banner — ${device.label} [${device.viewport.width}×${device.viewport.height}]`,
      async ({ page }) => {
        // Override viewport via page.setViewportSize (context UA stays as-is;
        // the UA is passed inside assertResponsiveHomepage for logging only)
        const homePage = new NeonearthHomePage(page);
        await homePage.assertResponsiveHomepage(device);
      }
    );
  }

  // ── Consolidated test that checks all 4 devices in one run ───────────────
  test('Homepage is responsive on mobile, tablet, and desktop', async ({ page }) => {
    const homePage = new NeonearthHomePage(page);
    const results  = [];

    for (const device of DEVICES) {
      let pass   = false;
      let reason = '';
      try {
        await homePage.assertResponsiveHomepage(device);
        pass = true;
      } catch (err) {
        reason = err.message.split('\n')[0];
        console.error(` [${device.label}] FAILED: ${reason}`);
      }
      results.push({ ...device, pass, reason });
    }

    // ── Summary table ───────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('  RESPONSIVE HOMEPAGE BANNER — SUMMARY');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(
      `  ${'Device'.padEnd(10)} ${'Viewport'.padEnd(15)} ${'Result'.padEnd(8)} ${'Note'}`
    );
    console.log('  ' + '─'.repeat(60));
    for (const r of results) {
      const icon = r.pass ? '✅ PASS' : '❌ FAIL';
      const note = r.pass ? '' : r.reason.slice(0, 50);
      console.log(
        `  ${r.label.padEnd(10)} ${`${r.viewport.width}×${r.viewport.height}`.padEnd(15)} ${icon.padEnd(8)} ${note}`
      );
    }
    console.log('══════════════════════════════════════════════════════════════\n');

    // ── Hard-assert all devices passed ─────────────────────────────────────
    const failed = results.filter(r => !r.pass);
    if (failed.length > 0) {
      throw new Error(
        `Responsive check failed for: ${failed.map(f => f.label).join(', ')}\n` +
        failed.map(f => `  • ${f.label}: ${f.reason}`).join('\n')
      );
    }
  });
});
