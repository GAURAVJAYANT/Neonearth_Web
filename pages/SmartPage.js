const { BasePage } = require('./BasePage');
const AIEngine = require('../utils/ai');
const { log } = require('../utils/helpers/logger');

class SmartPage extends BasePage {
    constructor(page) {
        super(page);
    }

    /**
     * Executes a Playwright action with automatic AI healing.
     * @param {Function} action - The async action to perform (e.g., () => page.click(selector))
     * @param {string} originalSelector - The selector to heal if the action fails
     * @param {string} actionName - Name for logging
     */
    async smartAction(action, originalSelector, actionName = "Interaction") {
        try {
            return await action();
        } catch (error) {
            log(`⚠️ ${actionName} failed for [${originalSelector}]. Triggering AI healing...`);
            
            // Capture necessary data for healing
            const fullDOM = await this.page.content();
            
            // 1. Ask AI for healed locator
            const newLocator = await AIEngine.heal(originalSelector, fullDOM);
            
            if (!newLocator || newLocator === "AI failed") {
                log(`❌ AI could not heal this locator.`);
                throw error;
            }
            
            log(`✨ AI suggested replacement: ${newLocator}. Re-attempting...`);
            
            // 2. Wrap the new attempt in a try-catch as well
            try {
                // Re-run the action with the NEW locator
                // We create a fresh action substituting the selector
                // Note: This assumes the action uses the selector
                return await this.page.locator(newLocator).click({ timeout: 10000 });
            } catch (healError) {
                log(`❌ Self-healing attempt failed: ${healError.message}`);
                throw error; // Throw original error
            }
        }
    }

    /**
     * Smart Click - Automatically heals if the selector changes
     */
    async smartClick(selector) {
        await this.smartAction(() => this.page.click(selector, { timeout: 10000 }), selector, "Click");
    }

    /**
     * Smart Fill - Automatically heals if the input selector changes
     */
    async smartFill(selector, text) {
        await this.smartAction(() => this.page.fill(selector, text, { timeout: 10000 }), selector, "Fill");
    }

    /**
     * Smart Hover - Automatically heals if the hover target changes
     */
    async smartHover(selector) {
        await this.smartAction(() => this.page.hover(selector, { timeout: 10000 }), selector, "Hover");
    }

    /**
     * Analyzes current page state if an assertion fails.
     * @param {Error} error 
     */
    async analyzeFailure(error) {
        const analysis = await AIEngine.analyze(error.message);
        log(`🔍 AI Analysis:\n${analysis}`);
        return analysis;
    }
}

module.exports = { SmartPage };
