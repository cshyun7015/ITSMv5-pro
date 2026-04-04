import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CommonCodePage } from '../pages/CommonCodePage';
import { cleanDatabase } from '../utils/db-cleaner';

test.describe('Common Code Management E2E', () => {
  test.beforeAll(async () => {
    await cleanDatabase();
  });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    // Clear state to avoid stale auth from previous runs
    await page.evaluate(() => localStorage.clear());
    await loginPage.login('operator1', 'password123'); // Admin only view
  });

  test('Code Group lifecycle -> Enter -> Code Lifecycle', async ({ page }) => {
    const codePage = new CommonCodePage(page);
    const timestamp = Date.now();
    const group = {
       id: `GRP_${timestamp}`, 
       name: `E2E GROUP ${timestamp}`, 
       description: 'Common code group via E2E' 
    };
    const code = { 
       id: `CODE_${timestamp}`, 
       name: `E2E CODE ${timestamp}`, 
       description: 'Code item via E2E', 
       sortOrder: 10 
    };

    await codePage.navigateToCodeMgmt();

    // 1. Create Group
    await codePage.openCreateGroupModal();
    await codePage.registerGroup(group);
    await expect(page.locator(`tr:has-text("${group.name}")`)).toBeVisible();

    // 2. Enter Group and Create Code
    await codePage.navigateToCodesByGroupName(group.name);
    await codePage.openCreateCodeModal();
    await codePage.registerCode(code);
    await expect(page.locator(`tr:has-text("${code.name}")`)).toBeVisible();

    // 3. Status Toggle (Implicit check during edit)
    // We can verify "사용 중" text is present
    await expect(page.locator(`tr:has-text("${code.name}")`)).toContainText('사용 중');

    // 4. Delete Code
    await codePage.deleteItem(code.name, false);
    await expect(page.locator(`tr:has-text("${code.name}")`)).not.toBeVisible();

    // 5. Back and Delete Group
    await codePage.backToGroups();
    await codePage.deleteItem(group.name, true);
    await expect(page.locator(`tr:has-text("${group.name}")`)).not.toBeVisible();
  });
});
