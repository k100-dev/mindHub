import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "corepack pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: {
      APP_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
  projects: [
    { name: "320x568", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 568 } } },
    { name: "375x812", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
    { name: "768x1024", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "1024x768", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } } },
    { name: "1440x900", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
