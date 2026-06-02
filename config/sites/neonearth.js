// config/sites/neonearth.js
const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
  throw new Error('BASE_URL is missing. Add BASE_URL to the .env file before running Playwright tests.');
}

module.exports = {
  baseUrl,
  timeout: 300000,
  expectTimeout: 40000,
  authFile: 'playwright/.auth/user.json',
};
