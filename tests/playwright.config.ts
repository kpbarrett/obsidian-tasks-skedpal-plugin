// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  workers: 1,
  use: {
    video: 'off',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
