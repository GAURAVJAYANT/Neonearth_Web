const { askAI } = require("./aiHelper");

/**
 * Attempts to heal a broken Playwright locator using AI and the current DOM.
 * Returns a new working locator string or "AI failed".
 */
async function healLocator(oldLocator, dom) {
  const prompt = `
You are a Playwright automation expert. A locator has stopped working.

BROKEN LOCATOR:
${oldLocator}

CURRENT PAGE DOM (interactive elements):
${dom}

TASK:
Suggest a replacement Playwright locator that targets the same element.
Use the best Playwright strategy: getByRole, getByText, locator with CSS, or data-testid.
Prefer stable attributes like id, data-testid, aria-label, or role over fragile class names.

IMPORTANT: Return ONLY the Playwright JavaScript locator expression.
Example: page.getByRole('button', { name: 'Add to Cart' })
Do not explain. No markdown. Just the locator.
`;

  return await askAI(prompt);
}

module.exports = { healLocator };
