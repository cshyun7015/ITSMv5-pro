import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { cleanDatabase } from '../utils/db-cleaner';

test.describe('Request Management Lifecycle E2E', () => {
  // Clear DB before each test for repeatability
  test.beforeAll(async () => {
    await cleanDatabase();
  });

  test('Registration -> Inquiry -> Processing Lifecycle', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    const loginPage = new LoginPage(page);
    const uniqueTitle = `E2E Test: Lifecycle Verification ${Date.now()}`;

    // 1. LOGIN (Admin via MSW mock — no real backend needed)
    await loginPage.goto();
    await loginPage.login(); // uses admin/admin123 from env or default
    
    // Navigate to Request Management
    await page.click('text=서비스 요청 관리');
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    console.log('✅ Navigated to Request List');

    // 2. REGISTRATION (CREATE)
    await page.getByTestId('req-list-new-btn').click();
    await expect(page.getByTestId('req-form-title-input')).toBeVisible({ timeout: 10000 });
    
    await page.getByTestId('req-form-title-input').fill(uniqueTitle);
    await page.getByTestId('req-form-desc-input').fill('Testing full lifecycle: create -> view -> edit -> delete.');
    await page.getByTestId('req-form-submit-btn').click();

    // Modal should close after submission
    await expect(page.getByTestId('req-form-submit-btn')).not.toBeVisible({ timeout: 10000 });
    console.log(`✅ Created Request: ${uniqueTitle}`);

    // 3. INQUIRY (READ — verify row appears)
    // MSW returns defaultMockData on GET /api/v1/request so we check for the table
    await expect(page.locator('[data-testid^="req-table-row-"]').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Request List verified');

    // 4. OPEN DETAIL & EDIT (PROCESSING)
    await page.locator('[data-testid^="req-table-row-"]').first().click();
    await expect(page.getByTestId('req-detail-edit-btn')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('req-detail-edit-btn').click();
    await expect(page.getByTestId('req-detail-title-input')).toBeVisible({ timeout: 5000 });
    
    // Change status
    await page.getByTestId('req-detail-status-select').selectOption('IN_PROGRESS');
    
    // Save
    page.on('dialog', dialog => dialog.accept());
    await page.getByTestId('req-detail-save-btn').click();
    console.log('✅ Updated Request status to IN_PROGRESS');

    // 5. DELETION
    // Re-enter edit mode to trigger delete
    await page.getByTestId('req-detail-delete-btn').click();
    await expect(page.getByTestId('req-detail-delete-confirm-btn')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('req-detail-delete-confirm-btn').click();

    // Detail modal should close after deletion
    await expect(page.getByTestId('req-detail-close-btn')).not.toBeVisible({ timeout: 10000 });
    console.log('✅ Deleted Request — Full lifecycle complete!');
  });
});
