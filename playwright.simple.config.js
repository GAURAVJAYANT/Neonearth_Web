const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const configuredRetries = Number(process.env.PLAYWRIGHT_RETRIES || process.env.RETRIES);
const retries = Number.isInteger(configuredRetries) && configuredRetries >= 0 ? configuredRetries : 2;

module.exports = defineConfig({
  testDir: './tests',
  retries,
  use: {
    baseURL: process.env.BASE_URL || 'https://ne.signsigma.com/',
  },
  projects: [
    {
      name: 'chromium',
      retries,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
