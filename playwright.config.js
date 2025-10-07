import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // For general CI runs you can keep 0 or 2; override via CLI for the coverage job.
  retries: process.env.CI ? 0 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: process.env.CI ? [["html"], ["json"], ["line"]] : "html",
  timeout: 30000,
  expect: { timeout: 3000 },

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    actionTimeout: 10000,
    navigationTimeout: 15000,
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: {
      NODE_ENV: "test",
      VITE_COVERAGE: "true",
    },
  },

  preserveOutput: "always",
  outputDir: "test-results",
});
