// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for DRY2 Web Components
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: 'html',
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:8086',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on all tests
    screenshot: 'on',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Grant clipboard permissions for all tests
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run your local dev server before starting the tests
  // Note: Assumes the dev server is already running at localhost:8086
  // If needed, uncomment and configure webServer:
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:8086',
  //   reuseExistingServer: !process.env.CI,
  // },
});

