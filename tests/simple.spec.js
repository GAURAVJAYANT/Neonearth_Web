const { test, expect } = require('@playwright/test');

test('Simple Test', async ({ page }) => {
  await page.goto('https://www.google.com');
  console.log('Google opened');
});
