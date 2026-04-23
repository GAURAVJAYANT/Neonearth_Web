/**
 * Builds a context-rich prompt for AI-based Playwright test generation.
 * The AI is instructed to generate tests following the project's Page Object Model.
 */
function buildPrompt(userStory) {
  return `
You are an expert Playwright test automation engineer working on the NeonEarth e-commerce website (https://ne.signsigma.com).

Generate a complete Playwright test in JavaScript using the Page Object Model pattern.

PROJECT CONVENTIONS:
- Test files use: const { test, expect } = require('@playwright/test');
- Page objects are imported from: ../pages/<PageName>
- Tests use: async ({ page }) => { ... }
- Navigation is handled via HomePage subclasses: TapestryHomePage, PillowHomePage, RugsHomePage
- test.setTimeout(600000) is used for all E2E tests

USER STORY / SCENARIO:
${userStory}

RULES:
- Use expect() assertions for all verifications
- Use async/await throughout
- Include console.log statements at every major step
- No explanation, no markdown code fences
- Output only valid JavaScript code
`;
}

module.exports = { buildPrompt };
