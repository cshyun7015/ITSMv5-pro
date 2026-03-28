import { test, expect } from '@playwright/test';

test.describe('ITSM v5 Multi-tenant Workflow', () => {
  // Constants for test data
  const COMP1 = { id: 'TEST-COMP-1', name: '고객사1' };
  const COMP2 = { id: 'TEST-COMP-2', name: '고객사2' };
  const USER1 = { id: 'user1', name: '사용자1', password: 'password123' };
  const USER2 = { id: 'user2', name: '사용자2', password: 'password123' };
  const USER3 = { id: 'user3', name: '사용자3', password: 'password123' };

  test('should complete the full E2E scenario', async ({ browser }) => {
    test.setTimeout(240000); // 4 minutes for standard container environment

    // 1. Admin Context: Register Companies and Users
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    // Login as Admin
    await adminPage.goto('/');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(3000);
    
    await adminPage.fill('input[placeholder="your.id"]', 'admin');
    await adminPage.fill('input[placeholder="••••••••"]', 'admin123');
    await adminPage.click('button:has-text("LOG IN")');
    await expect(adminPage.locator('.app-container')).toBeVisible({ timeout: 20000 });

    // Register Company 1
    await adminPage.click('.nav-item:has-text("Companies")');
    await adminPage.click('button:has-text("Register Company")');
    await adminPage.waitForSelector('.modal-content');
    await adminPage.fill('input[placeholder="e.g. COMP-001"]', COMP1.id);
    await adminPage.fill('input[placeholder="Business Name"]', COMP1.name);
    await adminPage.click('.modal-footer button:has-text("Register")');
    await adminPage.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });
    
    // Register Company 2
    await adminPage.click('button:has-text("Register Company")');
    await adminPage.waitForSelector('.modal-content');
    await adminPage.fill('input[placeholder="e.g. COMP-001"]', COMP2.id);
    await adminPage.fill('input[placeholder="Business Name"]', COMP2.name);
    await adminPage.click('.modal-footer button:has-text("Register")');
    await adminPage.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });

    // Register User 1 & 2 for Company 1
    await adminPage.click('.nav-item:has-text("Users")');
    await adminPage.waitForTimeout(2000);
    await adminPage.selectOption('select', COMP1.id);
    await adminPage.waitForTimeout(2000);
    
    for (const user of [USER1, USER2]) {
      await adminPage.click('button:has-text("Register User")');
      await adminPage.waitForSelector('.modal-content');
      await adminPage.fill('input[placeholder="e.g. jdoe"]', user.id);
      await adminPage.fill('input[placeholder="••••••••"]', user.password);
      await adminPage.fill('input[placeholder="Name"]', user.name);
      await adminPage.click('.modal-footer button:has-text("Register")');
      await adminPage.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });
    }

    // Register User 3 for Company 2
    await adminPage.selectOption('select', COMP2.id);
    await adminPage.waitForTimeout(2000);
    await adminPage.click('button:has-text("Register User")');
    await adminPage.waitForSelector('.modal-content');
    await adminPage.fill('input[placeholder="e.g. jdoe"]', USER3.id);
    await adminPage.fill('input[placeholder="••••••••"]', USER3.password);
    await adminPage.fill('input[placeholder="Name"]', USER3.name);
    await adminPage.click('.modal-footer button:has-text("Register")');
    await adminPage.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });

    // 2. User 1 Context: Create 2 Requests
    const u1Context = await browser.newContext();
    const u1Page = await u1Context.newPage();
    await u1Page.goto('/');
    await u1Page.waitForTimeout(3000);
    await u1Page.fill('input[placeholder="your.id"]', USER1.id);
    await u1Page.fill('input[placeholder="••••••••"]', USER1.password);
    await u1Page.click('button:has-text("LOG IN")');
    await expect(u1Page.locator('.app-container')).toBeVisible({ timeout: 20000 });
    
    await u1Page.click('.nav-item:has-text("Requests")');
    for (let i = 1; i <= 2; i++) {
        await u1Page.click('button:has-text("New Request")');
        await u1Page.waitForSelector('.modal-content');
        await u1Page.fill('input[placeholder="Brief summary of your request..."]', `User 1 Request ${i}`);
        await u1Page.fill('textarea[placeholder="Describe your issue or request in detail..."]', `Testing request ${i} from User 1`);
        await u1Page.click('button:has-text("SUBMIT REQUEST")');
        await u1Page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });
    }

    // 3. User 3 Context: Create 3 Requests
    const u3Context = await browser.newContext();
    const u3Page = await u3Context.newPage();
    await u3Page.goto('/');
    await u3Page.waitForTimeout(3000);
    await u3Page.fill('input[placeholder="your.id"]', USER3.id);
    await u3Page.fill('input[placeholder="••••••••"]', USER3.password);
    await u3Page.click('button:has-text("LOG IN")');
    await expect(u3Page.locator('.app-container')).toBeVisible({ timeout: 20000 });
    
    await u3Page.click('.nav-item:has-text("Requests")');
    for (let i = 1; i <= 3; i++) {
        await u3Page.click('button:has-text("New Request")');
        await u3Page.waitForSelector('.modal-content');
        await u3Page.fill('input[placeholder="Brief summary of your request..."]', `User 3 Request ${i}`);
        await u3Page.fill('textarea[placeholder="Describe your issue or request in detail..."]', `Testing request ${i} from User 3`);
        await u3Page.click('button:has-text("SUBMIT REQUEST")');
        await u3Page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });
    }

    // 4. Operator 1 Context: Resolve User 1's Requests
    const opContext = await browser.newContext();
    const opPage = await opContext.newPage();
    await opPage.goto('/');
    await opPage.waitForTimeout(3000);
    await opPage.fill('input[placeholder="your.id"]', 'operator1');
    await opPage.fill('input[placeholder="••••••••"]', 'password123');
    await opPage.click('button:has-text("LOG IN")');
    await expect(opPage.locator('.app-container')).toBeVisible({ timeout: 20000 });
    
    // Go to Requests view
    await opPage.click('.nav-item:has-text("Requests")');
    await opPage.waitForTimeout(3000);

    // Resolve User 1's requests
    for (let i = 1; i <= 2; i++) {
        const title = `User 1 Request ${i}`;
        await opPage.click(`tr:has-text("${title}")`);
        await opPage.waitForSelector('.request-detail-fixed');
        await opPage.click('button:has-text("RESOLVED")');
        await opPage.click('button:has-text("×")'); // Close detail
        await opPage.waitForSelector('.request-detail-fixed', { state: 'hidden', timeout: 10000 });
    }

    // 5. Final Verification (Admin)
    await adminPage.bringToFront();
    await adminPage.click('.nav-item:has-text("Requests")');
    await adminPage.waitForTimeout(3000);
    
    // Verify total request rows
    const requestRows = adminPage.locator('tbody tr');
    await expect(requestRows).toHaveCount(5);

    // Clean up
    await adminContext.close();
    await u1Context.close();
    await u3Context.close();
    await opContext.close();
  });
});
