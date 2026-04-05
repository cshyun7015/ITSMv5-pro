import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { cleanDatabase } from '../utils/db-cleaner';

test.describe('Visual Regression Suite (Golden Snapshots)', () => {
  test.beforeAll(async () => {
    // Ensure deterministic DB state for visual snapshots
    await cleanDatabase();
  });

  test('Login Page Visual Fidelity', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Capture the entire login form
    await expect(page.locator('.auth-container')).toHaveScreenshot('login-page.png');
  });

  test('Dashboard Layout Structure', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('operator1', 'password123');
    
    // Wait for dashboard to load
    await expect(page.locator('h1:has-text("시각화 대시보드")')).toBeVisible();
    
    // Masking dynamic elements like charts or timestamps to avoid noise
    await expect(page).toHaveScreenshot('dashboard-main.png', {
      mask: [
        page.locator('.recharts-wrapper'), // Masking all Recharts charts
        page.locator('.user-details span'), // Masking potentially dynamic user info
      ],
      fullPage: true
    });
  });

  test('Sidebar Expanded vs Collapsed', async ({ page }) => {
    // ... Login assuming operator1
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('operator1', 'password123');

    // Expanded (Initial state)
    const sidebar = page.locator('aside.sidebar');
    await expect(sidebar).toHaveScreenshot('sidebar-expanded.png');

    // Collapse
    await page.click('button.collapse-toggle');
    await expect(sidebar).toHaveScreenshot('sidebar-collapsed.png');
  });
});
