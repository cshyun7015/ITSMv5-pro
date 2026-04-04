import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async login(userId?: string, password?: string) {
    const finalUserId = userId || process.env.ADMIN_ID || 'admin';
    const finalPassword = password || process.env.ADMIN_PASSWORD || 'admin123';
    
    await this.page.fill('input[placeholder="your.id"]', finalUserId);
    await this.page.fill('input[placeholder="••••••••"]', finalPassword);
    await this.page.click('button:has-text("LOG IN")');
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
