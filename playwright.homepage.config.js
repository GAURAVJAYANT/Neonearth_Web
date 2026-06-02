// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/Homepage.spec.js',
  outputDir: 'test-results-homepage',
  fullyParallel: false,
  workers: 1,
  retries: 2,
  timeout: 120000,
  expect: {
    timeout: 40000,
  },
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.neonearth.com/',
    actionTimeout: 30000,
    navigationTimeout: 90000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});
