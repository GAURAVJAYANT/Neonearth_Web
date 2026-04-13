const { askAI } = require("./aiHelper");

async function analyzeFailure(error) {
  const prompt = `
Test failed with error:
${error}

Give:
1. Reason
2. Fix
`;

  return await askAI(prompt);
}

module.exports = { analyzeFailure };
