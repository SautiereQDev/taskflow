import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Docker
 * This config is used when running tests inside Docker containers
 * The app is already running, so we don't need webServer
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  timeout: 30000,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://app:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No webServer - app is already running in Docker
});
