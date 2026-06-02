const { expect } = require('@playwright/test');
const { HomePage } = require('./HomePage');

class NeonearthHomePage extends HomePage {
  constructor(page) {
    super(page);

    this.logo = page.locator('a[href="/"], a[href="https://www.neonearth.com/"]').first();
    this.logoImage = page.locator('img[alt="NeonEarth"]').first();
    this.freeShippingMessage = page.getByText(/Free Shipping Above \$99/i).first();
    this.promoMessage = page.getByText(/20% Off Sitewide/i).first();
    this.searchInput = page.locator('input#headersearch, input[placeholder="Find What Brings You Joy"]').first();
    this.searchButton = page.locator('#algolia-search-btn, button.sli_searchbox_go_button').first();
    this.bannerImages = page.locator('img.bannerImage');
    this.startCreatingCta = page.getByRole('link', { name: /Start Creating/i }).first();
    this.footer = page.locator('footer').first();

    this.desktopNavigationLinks = page.locator('nav.header-navigation-bar a.top-level-link');
    this.expectedNavigation = [
      'All',
      'Wall Arts',
      'Tapestries',
      'Rugs & Mats',
      'Pillows',
      'Fabrics',
      'Curtains',
      'Pet Zone',
      'More',
      'Theme',
    ];

    this.footerLinks = [
      'Privacy Policy',
      'Terms of Use',
      'Track Your Order',
      'FAQ',
      'Contact Us',
      'About us',
      'Blog',
    ];
  }

  async openHomepage() {
    await this.open();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForOverlays();
  }

  async assertHomepageLoaded() {
    await expect(this.page).toHaveURL(/neonearth\.com\/?$/);
    await expect(this.page).toHaveTitle(/Neon Earth/i);
    await expect(this.page.getByText('Personalized Living Starts Here')).toBeVisible();
  }

  async assertLogoVisible() {
    await expect(this.logo).toBeVisible();
    await expect(this.logoImage).toBeVisible();
  }

  async clickLogoAndVerifyHome() {
    await this.logo.click();
    await expect(this.page).toHaveURL(/neonearth\.com\/?$/);
  }

  async assertPromoBarVisible() {
    await expect(this.promoMessage).toBeVisible();
    await expect(this.page.getByText(/SUMMER20/i).first()).toBeVisible();
  }

  async assertFreeShippingVisible() {
    await expect(this.freeShippingMessage).toBeVisible();
  }

  async assertDesktopNavigationVisible() {
    await expect(this.desktopNavigationLinks.first()).toBeVisible();

    for (const label of this.expectedNavigation) {
      await expect(
        this.page.locator('nav.header-navigation-bar a.top-level-link').filter({ hasText: label }).first()
      ).toBeVisible();
    }
  }

  async searchFor(term) {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(term);
    await Promise.all([
      this.page.waitForURL(url => {
        const current = url.toString().toLowerCase();
        return current !== 'https://www.neonearth.com/' && current.includes(term.toLowerCase());
      }, { timeout: 30000 }).catch(() => null),
      this.searchButton.click(),
    ]);
  }

  async assertSearchResult(term) {
    await expect(this.page).toHaveURL(new RegExp(term, 'i'));
  }

  async assertHeroImagesVisible() {
    await expect(this.bannerImages.first()).toBeVisible();
    await expect(this.page.locator('img[alt="Graduation Day"], img[alt="Summer Campaign"]').first()).toBeVisible();
  }

  async clickHeroCtaAndVerifyNavigation() {
    await expect(this.startCreatingCta).toBeVisible();
    const href = await this.startCreatingCta.getAttribute('href');
    expect(href).toContain('/products');

    await Promise.all([
      this.page.waitForURL(/\/products/i, { timeout: 30000 }),
      this.startCreatingCta.click(),
    ]);
  }

  async assertFooterLinksVisibleAndValid() {
    await expect(this.footer).toBeVisible();

    for (const label of this.footerLinks) {
      const link = this.footer.getByRole('link', { name: label, exact: true }).first();
      await expect(link).toBeVisible();

      const href = await link.getAttribute('href');
      expect(href, `${label} footer link should have href`).toBeTruthy();
    }
  }

  /**
   * Validates homepage banner responsiveness for a specific device profile.
   *
   * @param {object} device
   * @param {string} device.label       - Human-readable name  (e.g. 'iPhone')
   * @param {{width:number, height:number}} device.viewport
   * @param {string} [device.userAgent] - Optional UA override
   */
  async assertResponsiveHomepage(device) {
    const { label, viewport } = device;
    const { width, height } = viewport;

    console.log(`\n📱 [${label}] Setting viewport to ${width}×${height}`);

    // ── 1. Resize viewport ────────────────────────────────────────────────
    await this.page.setViewportSize({ width, height });

    // ── 2. Navigate & wait ────────────────────────────────────────────────
    await this.openHomepage();
    await this.page.waitForTimeout(1500); // allow CSS / images to settle

    // ── 3. Core UI checks ─────────────────────────────────────────────────
    await expect(this.logoImage, `[${label}] Logo should be visible`).toBeVisible({ timeout: 15000 });

    // Search input may be hidden behind a hamburger on mobile — soft check
    const searchVisible = await this.searchInput.isVisible().catch(() => false);
    console.log(`  🔍 [${label}] Search input visible: ${searchVisible}`);

    // Promo bar — soft check (may be dismissed or absent on some viewports)
    const promoVisible = await this.promoMessage.isVisible().catch(() => false);
    console.log(`  📢 [${label}] Promo message visible: ${promoVisible}`);

    // ── 4. Banner bounding-box validation ─────────────────────────────────
    // Priority: active carousel slides first, then static banners, then any
    // visible section element that is in-viewport (x >= 0).
    const bannerSelectors = [
      // Active carousel slides (most specific — avoids off-screen slides)
      '.swiper-slide-active img.bannerImage',
      '.swiper-slide-active img',
      '.slick-active img.bannerImage',
      '.slick-active img',
      '.active img.bannerImage',
      // Static banner containers
      '.home-banner',
      '.banner-section',
      '.hero-banner',
      '.hero-section',
      '.banner-wrapper',
      // Generic slider wrappers
      '.swiper-container',
      '.slider-wrapper',
      // Broader attribute matches
      '[class*="banner"]:not(script)',
      '[class*="hero"]:not(script)',
      '[class*="slider"]:not(script)',
      // Fallback: any banner image (off-screen slides will be filtered by x >= 0)
      'img.bannerImage',
      // Last resort: first section
      'section:first-of-type',
    ];

    let bannerBox = null;
    let matchedSel = 'none';
    for (const sel of bannerSelectors) {
      try {
        const loc = this.page.locator(sel).first();
        if (await loc.isVisible({ timeout: 3000 })) {
          const box = await loc.boundingBox();
          // Skip off-screen carousel slides (x < 0 means the slide is to the left)
          if (box && box.x >= -10) {
            bannerBox = box;
            matchedSel = sel;
            break;
          }
        }
      } catch (_) { /* try next */ }
    }

    if (bannerBox) {
      console.log(
        `  🖼️  [${label}] Banner [${matchedSel}] → ` +
        `w=${bannerBox.width.toFixed(0)}px h=${bannerBox.height.toFixed(0)}px ` +
        `x=${bannerBox.x.toFixed(0)} y=${bannerBox.y.toFixed(0)}`
      );
      // Banner width should be at least 80% of the viewport width
      expect(
        bannerBox.width,
        `[${label}] Banner width (${bannerBox.width.toFixed(0)}px) should fill ≥80% of viewport (${width}px)`
      ).toBeGreaterThanOrEqual(width * 0.8);
      // Banner should have non-zero height
      expect(bannerBox.height, `[${label}] Banner height should be > 0`).toBeGreaterThan(0);
    } else {
      console.warn(`  ⚠️  [${label}] No banner matched — falling back to first visible <img>`);
      const img = this.page.locator('img').first();
      await expect(img, `[${label}] At least one image should be visible`).toBeVisible({ timeout: 10000 });
    }

    // ── 5. Screenshot for visual reference ───────────────────────────────
    const screenshotPath =
      `screenshots/responsive-${label.toLowerCase().replace(/\s+/g, '-')}-${width}x${height}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  📸 [${label}] Screenshot saved → ${screenshotPath}`);
  }
}

module.exports = { NeonearthHomePage };
