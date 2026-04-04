// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 20,
  retries: 2,
  timeout: 60 * 5000,
  expect: {
    timeout: 40 * 1000,
  },
  // Playwright lifecycle hooks are now handled by AllureOpenReporter.js directly
  
  reporter: [
    ['list'],
    ['./allure-open-reporter.js'],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false,
        // Automatically attach screenshots, videos, traces on failure
        attachments: true,
        environmentInfo: {
          Project: 'NeonEarth Web',
          BaseURL: process.env.BASE_URL || 'https://test.neonearth.com',
          Browser: 'Chromium',
          Environment: process.env.ENV || 'test',
          NodeVersion: process.version,
        },
      },
    ],
    ['json', { outputFile: 'test-results/report.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://test.neonearth.com',

    // Capture trace on first retry — visible in Allure as an attachment
    trace: 'retain-on-failure',

    // VIDEO: saved and attached to Allure on failure
    video: {
      mode: 'retain-on-failure',
      size: { width: 1920, height: 1080 },
    },

    // SCREENSHOT: saved and attached to Allure on failure
    screenshot: 'only-on-failure',

    headless: false,
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
    permissions: ['geolocation'],
    geolocation: { latitude: 40.7128, longitude: -74.006 },
  },
});