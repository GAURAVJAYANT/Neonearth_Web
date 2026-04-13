const { askAI } = require("./aiHelper");
const { buildPrompt } = require("./promptBuilder");
const { generateTest } = require("./testGenerator");
const { analyzeFailure } = require("./failureAnalyzer");
const { healLocator } = require("./selfHealing");
const { getSanitizedDOM } = require("./domUtils");
const healingRegistry = require("./healingRegistry");
const { log } = require("../helpers/logger");

class AIEngine {
  constructor(model = process.env.AI_MODEL || "mistral") {
    this.model = model;
  }

  async ask(prompt) {
    log(`Interacting with AI (${this.model})...`);
    return await askAI(prompt);
  }

  async generateTest(userStory) {
    log(`Generating test for: ${userStory}`);
    return await generateTest(userStory);
  }

  async analyze(error) {
    log(`Analyzing failure: ${error.message || error}`);
    return await analyzeFailure(error);
  }

  async heal(oldLocator, fullDOM) {
    // 1. Check Registry first
    const cached = healingRegistry.getHeal(oldLocator);
    if (cached) {
        log(`📍 Found cached heal for ${oldLocator} -> ${cached}`);
        return cached;
    }

    // 2. Sanitize DOM for AI
    log(`🧹 Cleaning DOM for AI optimization...`);
    const cleanDOM = getSanitizedDOM(fullDOM);

    log(`Attempting to heal locator: ${oldLocator}`);
    const newLocator = await healLocator(oldLocator, cleanDOM);

    // 3. Register the new heal
    if (newLocator && newLocator !== "AI failed") {
        healingRegistry.registerHeal(oldLocator, newLocator);
    }

    return newLocator;
  }
}

module.exports = new AIEngine();
