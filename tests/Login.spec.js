const { test, expect } = require('@playwright/test');
const xlsx = require('xlsx');
const path = require('path');

// Read Excel data
const workbook = xlsx.readFile(path.join(__dirname, '../data/login_data.xlsx'));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const loginData = xlsx.utils.sheet_to_json(sheet);

test('Open NeonEarth Website - Login and Hover Tapestries', async ({ page }) => {
  const { username, password } = loginData[0];
  test.setTimeout(120000);

  // ─── Step 1: Open Website ───────────────────────────────────────
  await page.goto('/', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });

  await expect(page).toHaveURL('/');
  console.log('✅ Website opened successfully');

  // ─── Step 2: Click Join/Login ───────────────────────────────────
  // First ensure the login menu is accessible. On smaller viewports, it requires a click on the profile icon.
  const loginButton = page.getByText('Join/Login');
  try {
    // Check if directly visible first
    await loginButton.waitFor({ state: 'visible', timeout: 5000 });
  } catch (e) {
    console.log('⚠️ Join/Login not immediately visible, interacting with profile area...');
    // Click the profile/user icon or area to reveal Join/Login
    // Using a more robust set of selectors for the profile icon/trigger
    const profileTrigger = page.locator('.header-navigation-right-section .header-user-icon, .header-user-icon, i.icon-user').first();
    await profileTrigger.click();
    await page.waitForTimeout(1000); // Wait for potential menu animation
  }
  
  await loginButton.click();
  console.log('✅ Clicked Login button');

  // ─── Step 3: Enter Email ────────────────────────────────────────
  const email = page.getByPlaceholder('Enter Email ID');
  await email.waitFor({ state: 'visible', timeout: 10000 });
  await email.click();
  await email.fill(username);
  console.log(`✅ Email entered: ${username}`);

  // ─── Step 4: Click Continue ─────────────────────────────────────
  const continueBtn = page.getByRole('button', { name: 'Continue' });
  await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
  await continueBtn.click();
  console.log('✅ Clicked Continue button');

  // ─── Step 5: Handle OTP Screen and Enter Password ────────────────
  // The site defaults to OTP; we need to switch to password login
  const signInWithPasswordBtn = page.getByRole('button', { name: /Sign in with a password/i });
  await signInWithPasswordBtn.waitFor({ state: 'visible', timeout: 10000 });
  await signInWithPasswordBtn.click();
  console.log('✅ Clicked "Sign in with a password instead"');

  const passwordField = page.locator('input[type="password"], input[name="password"]');
  await passwordField.waitFor({ state: 'visible', timeout: 10000 });
  await passwordField.fill(password);
  console.log('✅ Password entered');

  const verifyBtn = page.getByRole('button', { name: /Verify & Sign In/i });
  await verifyBtn.click();
  console.log('✅ Clicked Verify & Sign In button');

  await page.waitForTimeout(5000);
});