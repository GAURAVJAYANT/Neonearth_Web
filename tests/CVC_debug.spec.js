/**
 * CVC DIAGNOSTIC TEST
 * Goes directly to checkout page (requires saved login state)
 * and probes every possible Stripe CVC iframe selector.
 */
const { test } = require('@playwright/test');

test('CVC Diagnostic - Find and fill Stripe CVC on checkout', async ({ page }) => {
  test.setTimeout(120000);

  // Go straight to checkout (user already logged in via storageState)
  console.log('Navigating to checkout...');
  await page.goto('https://test.neonearth.com/onepagecheckout', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Page URL:', page.url());

  // ── PROBE 1: List ALL iframes on the page ──
  const allIframes = await page.locator('iframe').all();
  console.log(`\nTotal iframes on page: ${allIframes.length}`);
  for (let i = 0; i < allIframes.length; i++) {
    const name  = await allIframes[i].getAttribute('name').catch(() => 'N/A');
    const title = await allIframes[i].getAttribute('title').catch(() => 'N/A');
    const src   = (await allIframes[i].getAttribute('src').catch(() => '')) || '';
    const vis   = await allIframes[i].isVisible().catch(() => false);
    console.log(`  [${i}] name="${name}" title="${title}" visible=${vis}`);
    console.log(`       src="${src.substring(0, 120)}"`);
  }

  // ── PROBE 2: Check specific selectors ──
  console.log('\n── Selector probes ──');

  const checks = [
    'iframe[title="Secure CVC input frame"]',
    'iframe[src*="componentName=cardCvc"]',
    '.CVVSec iframe',
    '.savedCardData iframe',
    'iframe[src*="cardCvc"]',
    'iframe[src*="CVC"]',
  ];

  for (const sel of checks) {
    try {
      const el = page.locator(sel).first();
      const count = await page.locator(sel).count();
      const vis   = count > 0 ? await el.isVisible({ timeout: 1000 }).catch(() => false) : false;
      console.log(`  "${sel}" → count=${count} visible=${vis}`);
      if (count > 0) {
        const name  = await el.getAttribute('name').catch(() => 'N/A');
        const title = await el.getAttribute('title').catch(() => 'N/A');
        console.log(`    name="${name}" title="${title}"`);
      }
    } catch (e) {
      console.log(`  "${sel}" → ERROR: ${e.message.split('\n')[0]}`);
    }
  }

  // ── PROBE 3: Try to fill CVC using each strategy ──
  console.log('\n── Fill attempts ──');

  // Strategy A: by title
  const byTitle = page.locator('iframe[title="Secure CVC input frame"]');
  if (await byTitle.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Strategy A (by title): iframe is visible — trying fill...');
    try {
      const frame = page.frameLocator('iframe[title="Secure CVC input frame"]');
      // Probe inputs inside
      const inputs = await frame.locator('input').all();
      console.log(`  Inputs inside iframe: ${inputs.length}`);
      for (let i = 0; i < inputs.length; i++) {
        const ph = await inputs[i].getAttribute('placeholder').catch(() => 'N/A');
        const type = await inputs[i].getAttribute('type').catch(() => 'N/A');
        const vis = await inputs[i].isVisible({ timeout: 500 }).catch(() => false);
        console.log(`    input[${i}] placeholder="${ph}" type="${type}" visible=${vis}`);
      }
      // Try fill on first input
      const inp = frame.locator('input').first();
      await inp.scrollIntoViewIfNeeded().catch(() => {});
      await inp.click({ timeout: 5000 });
      await inp.pressSequentially('123', { delay: 50 });
      console.log('  ✅ Strategy A: pressSequentially succeeded!');
    } catch (e) {
      console.log(`  ❌ Strategy A failed: ${e.message.split('\n')[0]}`);
    }
  } else {
    console.log('Strategy A (by title): iframe NOT visible');
  }

  // Strategy B: by src
  const bySrc = page.locator('iframe[src*="componentName=cardCvc"]');
  if (await bySrc.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Strategy B (by src): iframe is visible — trying fill...');
    try {
      const frame = page.frameLocator('iframe[src*="componentName=cardCvc"]');
      const inp = frame.locator('input').first();
      await inp.click({ timeout: 5000 });
      await inp.pressSequentially('123', { delay: 50 });
      console.log('  ✅ Strategy B: pressSequentially succeeded!');
    } catch (e) {
      console.log(`  ❌ Strategy B failed: ${e.message.split('\n')[0]}`);
    }
  } else {
    console.log('Strategy B (by src): iframe NOT visible');
  }

  // Strategy C: CVVSec parent
  const byCvvSec = page.locator('.CVVSec iframe');
  const cvvCount = await byCvvSec.count();
  console.log(`Strategy C (.CVVSec iframe): count=${cvvCount}`);
  if (cvvCount > 0) {
    const name = await byCvvSec.first().getAttribute('name').catch(() => 'N/A');
    console.log(`  name="${name}"`);
    try {
      const frame = page.frameLocator(`.CVVSec iframe`);
      const inp = frame.locator('input').first();
      await inp.click({ timeout: 5000 });
      await inp.pressSequentially('123', { delay: 50 });
      console.log('  ✅ Strategy C: pressSequentially succeeded!');
    } catch (e) {
      console.log(`  ❌ Strategy C failed: ${e.message.split('\n')[0]}`);
    }
  }

  await page.screenshot({ path: 'screenshots/cvc_debug.png' });
  console.log('\nScreenshot saved: screenshots/cvc_debug.png');
  await page.waitForTimeout(10000);
});
