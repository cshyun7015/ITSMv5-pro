import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RequestPage } from '../pages/RequestPage';
import { cleanDatabase } from '../utils/db-cleaner';

test.describe('Request Management Lifecycle E2E', () => {
  // Clear DB before each test for repeatability
  test.beforeAll(async () => {
    // If running in container, DB_HOST should be itsm-db
    // For local dev, db-cleaner uses standard defaults
    // In actual E2E run, this is handled via environment variables
    await cleanDatabase();
  });

  test('Registration -> Inquiry -> Processing Lifecycle', async ({ page, browser }) => {
    test.setTimeout(120000); // 2 minutes

    const loginPage = new LoginPage(page);
    const requestPage = new RequestPage(page);
    const uniqueTitle = `E2E Test: Lifecycle Verification ${Date.now()}`;

    // 1. LOGIN (USER)
    await loginPage.goto();
    await loginPage.login('user1', 'password123');
    
    // 2. REGISTRATION (CREATE)
    await requestPage.navigateToRequestList();
    await requestPage.openCreateModal();
    await requestPage.registerRequest({
      title: uniqueTitle,
      description: 'Testing registration, inquiry, and processing in a single cycle.',
      impact: 'MEDIUM',
      urgency: 'HIGH'
    });
    
    console.log(`Created Request with Title: ${uniqueTitle}`);
    
    // 3. INQUIRY (READ/LIST)
    // The request should be visible in the list (this was verified by registerRequest waiting for modal to close)
    
    // 4. PROCESSING (UPDATE/RESOLVE - Switching Role)
    // Logout from User
    await page.click('.user-profile');
    await page.click('text=로그아웃');
    await expect(page.locator('button:has-text("LOG IN")')).toBeVisible();
    
    // Login as Operator
    await loginPage.login('operator1', 'password123');
    
    // Click sidebar link for Request Management
    await page.click('text=요청 관리');
    await expect(page.locator('h1:has-text("요청 목록")')).toBeVisible({ timeout: 10000 });
    
    // Search for the specific request (ensure it exists in search)
    await page.fill('input[placeholder="Case-insensitive keyword search..."]', uniqueTitle);
    await page.click('button:has-text("검색")');
    
    // Wait for the specific row and click it
    const targetRow = page.locator(`tr:has-text("${uniqueTitle}")`);
    await targetRow.waitFor({ state: 'visible', timeout: 10000 });
    await targetRow.click();
    
    // Resolve
    await requestPage.processRequest({
      resolutionCode: 'FIXED',
      resolutionText: 'Resolved successfully via E2E lifecycle test.'
    });
    
    // 5. DELETION (DELETE)
    await requestPage.deleteRequest();
    
    // Final check: Search again and verify no results
    await page.fill('input[placeholder="Case-insensitive keyword search..."]', uniqueTitle);
    await page.click('button:has-text("검색")');
    await expect(page.locator('text=Showing 0 results')).toBeVisible();
    
    console.log(`E2E Lifecycle Test Passed (Full Cycle: Create -> Resolve -> Delete) for title: ${uniqueTitle}`);
  });

  // Optional: Deletion if supported
  /*
  test('Deletion Lifecycle', async ({ page }) => {
    // ... logic for deletion
  });
  */
});
