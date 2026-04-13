const { askAI } = require("./aiHelper");

async function healLocator(oldLocator, dom) {
  const prompt = `
Old locator failed: ${oldLocator}

DOM:
${dom}

Suggest new Playwright locator
`;

  return await askAI(prompt);
}

module.exports = { healLocator };
