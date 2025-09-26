// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 1,
  use: {
    video: 'off',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  // Configure global setup for Obsidian API mocking
  globalSetup: require.resolve('./setup.ts'),
  // Configure test environment
  testDir: '.',
  testMatch: '*.spec.ts',
  // Timeout configuration
  timeout: 30000,
  expect: {
    timeout: 5000
  }
});
