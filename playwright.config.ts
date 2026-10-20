import { defineConfig } from '@playwright/test'

// Start a local development server unless one is already running. To test a
// production export instead, serve out/ at this same address before running
// Playwright locally. Don't run dev and build together: both write to .next.
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
  },
  webServer: { command: 'npm run dev -- --hostname 127.0.0.1', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI },
})
