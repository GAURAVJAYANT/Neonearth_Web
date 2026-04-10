const { expect } = require('@playwright/test');

class PillowsPage {
  constructor(page) {
    this.page = page;

    // Top-level Pillows menu
    this.pillowsMenu = page.locator(
    'nav.header-navigation-bar ul.header-navigation-list li.top-level-item a.top-level-link span.label-text',
    { hasText: 'Pillows' }
  );

    // Categories in dropdown
    this.throwPillowsCategory = page.getByRole('link', { name: /^Throw Pillows$/ }).first();

    // Products in sub-menu
    this.customSquareThrowPillow = page.getByRole('link', { name: /Custom Square Throw Pillow/ }).first();

    // Popup handlers
    this.popupClose = page.locator('label[aria-label="Close popup"] img, .newsletter-popup .close, .modal-popup .action-close').first();
  }

  async dismissPopup() {
    try {
      // Check for popup quickly without blocking for long if it's not there
      // We use a shorter timeout for isVisible or a catch-all waitFor
      if (await this.popupClose.isVisible({ timeout: 2000 })) {
        await this.popupClose.click();
        console.log('✅ Popup/Drop-down dismissed');
      }
    } catch (e) {
      // Ignore if no popup appears
    }
  }

  // ─── Internal: Hover with jitter retry ────────────────────────────────────

  async _hoverWithRetry(menuLocator, signalLocator, label = 'target') {
    await menuLocator.waitFor({ state: 'visible', timeout: 15000 });

    const isVisible = async () => {
      try {
        await signalLocator.waitFor({ state: 'visible', timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    };

    // Attempt 1: clean hover
    console.log(`⏳ Hovering over ${label} source...`);
    await menuLocator.hover();
    
    if (await isVisible()) {
      return; // Success!
    }

    // Attempt 2: jitter hover
    console.log(`⚠️ ${label} not visible, trying jitter hover...`);
    const box = await menuLocator.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x - 20, box.y + box.height / 2);
      await this.page.waitForTimeout(300);
      await menuLocator.hover();
      if (await isVisible()) return;
    }

    // Attempt 3: force hover
    console.log(`⚠️ ${label} still not visible, trying force hover...`);
    await menuLocator.hover({ force: true });
    await isVisible();
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async navigateToPillowProduct() {
    console.log('⏳ Checking for delayed popups/drop-downs...');
    await this.dismissPopup();

    console.log('✅ Pillows menu found');

    // Step 1: Hover Pillows menu until Throw Pillows category appears
    await this._hoverWithRetry(this.pillowsMenu, this.throwPillowsCategory, 'Throw Pillows category');

    try {
      await this.throwPillowsCategory.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ "Throw Pillows" category visible');
    } catch {
      console.log('⚠️ "Throw Pillows" did not become visible within timeout, attempting hover anyway');
    }

    // Step 2: Hover Throw Pillows category until product appears
    await this.throwPillowsCategory.scrollIntoViewIfNeeded().catch(() => {});
    await this._hoverWithRetry(this.throwPillowsCategory, this.customSquareThrowPillow, 'Custom Square Throw Pillow');

    try {
      await this.customSquareThrowPillow.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Custom Square Throw Pillow visible in sub-menu');
    } catch {
      console.log('⚠️ Product did not become visible, attempting click anyway');
    }

    // Step 3: Click the product
    await this.customSquareThrowPillow.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(500);
    await this.customSquareThrowPillow.click();
    console.log('✅ Clicked Custom Square Throw Pillow');

    await this.page.waitForURL(/throw-pillow-p|pillow-p/i, { timeout: 30000 });
    console.log('✅ Navigated to Custom Square Throw Pillow PDP successfully');
  }
}

module.exports = { PillowsPage };