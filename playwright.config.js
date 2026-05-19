// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

// Forcefully clear JAVA_HOME to prevent Allure from crashing on systems with broken Java paths
delete process.env.JAVA_HOME;

const configuredRetries = Number(process.env.PLAYWRIGHT_RETRIES || process.env.RETRIES);
const retries = Number.isInteger(configuredRetries) && configuredRetries >= 0 ? configuredRetries : 2;

module.exports = defineConfig({
  globalSetup: './globalSetup.js',
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries,
  timeout: 300000,
  expect: {
    timeout: 40 * 1000,
  },
  
  reporter: [
    ['list'],
    ['./professional-allure-reporter.js'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        Project: 'Neonearth',
        Application: 'Playwright Automation JS',
        QA: 'QA Gaurav Jayant',
        BaseURL: process.env.BASE_URL || 'https://ne.signsigma.com/',
        Browser: 'Chromium',
      },
    }],
    ['json', { outputFile: 'test-results/report.json' }],
    ['./allure-open-reporter.js'],
    // ['./AIReporter.js'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://ne.signsigma.com/',
    actionTimeout: 180000,
    navigationTimeout: 180000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: false,
    viewport: null, // Forces browser to follow maximized window size
    permissions: ['geolocation'], // Automatically grant geolocation
    geolocation: { latitude: 40.7128, longitude: -74.0060 }, // Default to New York
    launchOptions: {
      args: ['--start-maximized'],
    },
  },

  projects: [
    {
      name: 'chromium',
      retries,
      use: {
        browserName: 'chromium',
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
