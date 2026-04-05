import { Page, expect } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    // CRITICAL: Set sessionStorage BEFORE page load so MSW activates on startup.
    // Use conditional setting to avoid overriding scenario toggles in E2E tests on reload.
    await this.page.addInitScript(() => {
      if (!window.sessionStorage.getItem('mock-enabled')) {
        window.sessionStorage.setItem('mock-enabled', 'true');
      }
      if (!window.sessionStorage.getItem('mock-scenario')) {
        window.sessionStorage.setItem('mock-scenario', 'default');
      }
    });
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async login(userId?: string, password?: string) {
    const finalUserId = userId || process.env.ADMIN_ID || 'admin';
    const finalPassword = password || process.env.ADMIN_PASSWORD || 'admin123';

    await this.page.fill('input[placeholder="your.id"]', finalUserId);
    await this.page.fill('input[placeholder="••••••••"]', finalPassword);
    await this.page.click('button:has-text("LOG IN")');
    // .app-container is rendered by AppContent once authentication is confirmed
    await expect(this.page.locator('.app-container')).toBeVisible({ timeout: 20000 });
  }

  async logout() {
    // Implement logout logic if needed
    // Usually via a user profile dropdown
    const userMenu = this.page.locator('.user-profile');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await this.page.click('text=Logout');
    }
  }
}
