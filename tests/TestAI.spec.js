// @ts-check
const { test, expect } = require('@playwright/test');
const { askAI } = require('../utils/ai/aiHelper');

test('AI + Playwright Test', async ({ page }) => {
  // Step 1: Open website
  await page.goto('https://google.com');

  // Step 2: Simple validation
  await expect(page).toHaveTitle(/Google/);

  // Step 3: Call AI
  const aiResponse = await askAI('tell me one joke');

  console.log('?? AI Response:', aiResponse);
  expect(aiResponse).not.toBe('AI failed');
});
