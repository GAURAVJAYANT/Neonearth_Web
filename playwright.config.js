// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

// Forcefully clear JAVA_HOME to prevent Allure from crashing on systems with broken Java paths
delete process.env.JAVA_HOME;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: 2,
  timeout: 60 * 5000,
  expect: {
    timeout: 40 * 1000,
  },
  
  reporter: [
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        Project: 'NeonEarth Web',
        BaseURL: process.env.BASE_URL || 'https://test.neonearth.com',
        Browser: 'Chromium',
      },
    }],
    ['json', { outputFile: 'test-results/report.json' }],
    ['./allure-open-reporter.js'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://test.neonearth.com',
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
      name: 'setup',
      testMatch: /Login\.spec\.js/,
    },
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});