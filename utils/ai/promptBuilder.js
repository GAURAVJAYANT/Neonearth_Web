function buildPrompt(userStory) {
  return `
Generate Playwright JS test using Page Object Model.

Scenario:
${userStory}

Rules:
- Use expect assertions
- Clean code
- No explanation
`;
}

module.exports = { buildPrompt };
