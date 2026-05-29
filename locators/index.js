// locators/index.js
const siteName = process.env.SITE_NAME || 'neonearth';

let activeLocators;
try {
  activeLocators = require(`./${siteName}`);
} catch (e) {
  console.warn(`[Locators] Site locators for "${siteName}" not found. Falling back to "neonearth".`);
  activeLocators = require('./neonearth');
}

module.exports = activeLocators;
