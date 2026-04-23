const { askAI } = require("./aiHelper");

/**
 * Analyzes a Playwright test failure using AI.
 * Provides root cause, retry recommendation, and a suggested fix.
 */
async function analyzeFailure(error) {
  const prompt = `
You are a senior Playwright automation engineer analyzing a test failure.

The test failed with this error:
${error}

Framework: Playwright (JavaScript), Page Object Model pattern.
Base URL: https://www.neonearth.com

Please provide:
1. ROOT CAUSE: Why did this test fail? (e.g., locator not found, timeout, navigation issue, assertion mismatch)
2. IS IT FLAKY?: Is this likely a timing/network issue that a retry might fix? (Yes/No and why)
3. RECOMMENDED FIX: Exact code change or config suggestion to prevent this failure.

Be concise and actionable.
`;

  return await askAI(prompt);
}

module.exports = { analyzeFailure };
