import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration (ITSM v5 Renewal)
 * - [표준화] frontend_test_standards.md 가이드라인 준수
 * - [연동] Docker compose로 뜬 localhost:3000번 서버를 대상으로 테스트 수행
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.ts',
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://host.docker.internal:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
