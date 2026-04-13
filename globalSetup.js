// globalSetup.js
// Runs ONCE before all tests. Logs in and saves the session to disk.
// Each test then restores this session via storageState — no re-login needed.

const { chromium } = require('@playwright/test');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const AUTH_FILE = 'playwright/.auth/user.json';

module.exports = async function globalSetup(config) {
  // ── If a valid auth file already exists, skip login ──────────────
  if (fs.existsSync(AUTH_FILE)) {
    const stat = fs.statSync(AUTH_FILE);
    const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
    if (ageHours < 12) {
      console.log(`\n🔐 Auth session still fresh (${ageHours.toFixed(1)}h old). Skipping login.\n`);
      return;
    }
    console.log(`\n⏰ Auth session is stale (${ageHours.toFixed(1)}h old). Re-logging in...\n`);
  } else {
    console.log('\n🔑 No auth session found. Logging in...\n');
  }

  // ── Ensure auth directory exists ──────────────────────────────────
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // ── Read credentials from Excel ───────────────────────────────────
  const workbook = xlsx.readFile(path.join(__dirname, 'data/login_data.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const loginData = xlsx.utils.sheet_to_json(sheet);
  const { username, password } = loginData[0];

  // ── Launch browser and log in ─────────────────────────────────────
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
  });
  const page = await context.newPage();

  try {
    const baseURL = process.env.BASE_URL || 'https://www.neonearth.com/';

    // Step 1: Open website
    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('✅ [globalSetup] Website opened');

    // Step 2: Click Join/Login
    const loginButton = page.getByText('Join/Login');
    try {
      await loginButton.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      console.log('⚠️ [globalSetup] Join/Login not visible, clicking profile icon...');
      const profileTrigger = page.locator(
        '.header-navigation-right-section .header-user-icon, .header-user-icon, i.icon-user'
      ).first();
      await profileTrigger.click();
      await page.waitForTimeout(1000);
    }
    await loginButton.click();
    console.log('✅ [globalSetup] Clicked Login button');

    // Step 3: Enter email
    const email = page.getByPlaceholder('Enter Email ID');
    await email.waitFor({ state: 'visible', timeout: 10000 });
    await email.fill(username);
    console.log(`✅ [globalSetup] Email entered: ${username}`);

    // Step 4: Click Continue
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
    await continueBtn.click();
    console.log('✅ [globalSetup] Clicked Continue');

    // Step 5: Switch to password login
    const signInWithPasswordBtn = page.getByRole('button', { name: /Sign in with a password/i });
    await signInWithPasswordBtn.waitFor({ state: 'visible', timeout: 10000 });
    await signInWithPasswordBtn.click();
    console.log('✅ [globalSetup] Switched to password login');

    // Step 6: Enter password
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    await passwordField.waitFor({ state: 'visible', timeout: 10000 });
    await passwordField.fill(password);
    console.log('✅ [globalSetup] Password entered');

    // Step 7: Sign in
    const verifyBtn = page.getByRole('button', { name: /Verify & Sign In/i });
    await verifyBtn.click();
    console.log('✅ [globalSetup] Clicked Verify & Sign In');

    // Wait for login to complete
    await page.waitForTimeout(5000);

    // Step 8: Save session to disk
    await context.storageState({ path: AUTH_FILE });
    console.log(`✅ [globalSetup] Session saved to ${AUTH_FILE}\n`);
  } finally {
    await context.close();
    await browser.close();
  }
};
