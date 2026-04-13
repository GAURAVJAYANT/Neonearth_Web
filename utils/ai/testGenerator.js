const fs = require("fs");
const path = require("path");
const { askAI } = require("./aiHelper");
const { buildPrompt } = require("./promptBuilder");

async function generateTest(userStory) {
  const prompt = buildPrompt(userStory);
  const code = await askAI(prompt);

  const testDir = path.join(__dirname, "../../tests/ai-generated");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const filePath = path.join(testDir, "generated.spec.js");
  fs.writeFileSync(filePath, code);
  console.log(`✅ AI Test Created at ${filePath}`);
}

module.exports = { generateTest };
