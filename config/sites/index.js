// config/sites/index.js
const siteName = process.env.SITE_NAME || 'neonearth';

let activeConfig;
try {
  activeConfig = require(`./${siteName}`);
} catch (e) {
  console.warn(`[Config] Site config "${siteName}" not found. Falling back to "neonearth".`);
  activeConfig = require('./neonearth');
}

module.exports = activeConfig;
