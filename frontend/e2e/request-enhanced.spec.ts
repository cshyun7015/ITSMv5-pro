import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Professional Request Management E2E', () => {
  test('User creates a request and Operator resolves it with ITIL attributes', async ({ browser }) => {
    test.setTimeout(240000); // 4 minutes for standard container environment

    // 1. User Context: Create Request
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    // Redirect console logs to terminal for debugging
    userPage.on('console', msg => console.log(`[USER PAGE LOG]: ${msg.text()}`));
    
    await userPage.goto('/');
    await userPage.waitForLoadState('networkidle');
    
    // Login as User
    await userPage.fill('input[placeholder="your.id"]', 'user1');
    await userPage.fill('input[placeholder="••••••••"]', 'password123');
    await userPage.click('button:has-text("LOG IN")');
    await expect(userPage.locator('.app-container')).toBeVisible({ timeout: 20000 });
    
    // Open Request Management
    await userPage.click('.nav-item:has-text("요청 관리")');
    await userPage.waitForTimeout(2000);
    
    // Create New Request
    await userPage.click('.panel-header button:has-text("요청 등록")'); // Specific trigger button
    await userPage.waitForSelector('.modal-content');
    
    // Subject and Details
    await userPage.fill('input[placeholder*="요청 내용의 핵심"]', 'E2E Test: Sequential ID & Priority Logic');
    
    // Select ITIL attributes (Impact: Medium, Urgency: High)
    await userPage.selectOption('select:near(label:text("영향도 (Impact)"))', 'MEDIUM');
    await userPage.selectOption('select:near(label:text("긴급도 (Urgency)"))', 'HIGH');
    
    // Verify Priority Formula (Medium + High => P2)
    const priorityText = await userPage.textContent('.priority-calculator');
    expect(priorityText).toContain('P2'); 
    
    await userPage.fill('textarea[placeholder*="상세 내용을 입력"]', 'Testing sequential ID generation (SR-YYYYMM-XXXXX) and automatic priority calculation.');
    
    // Submit Button in Modal
    await userPage.click('.modal-footer button:has-text("요청 등록")'); 
    
    // Wait for submission
    await userPage.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 10000 });
    
    // Get Created ID
    await userPage.waitForSelector('.code-id-cell');
    const reqId = await userPage.textContent('.code-id-cell:first-child');
    console.log(`Created Request ID: ${reqId}`);
    expect(reqId).toMatch(/^SR-\d{6}-\d{5}$/);
    
    await userContext.close();

    // 2. Operator Context: Resolve Request
    const opContext = await browser.newContext();
    const opPage = await opContext.newPage();
    
    // Redirect console logs to terminal and file for debugging
    opPage.on('console', msg => {
        console.log(`[OP PAGE LOG]: ${msg.text()}`);
        fs.appendFileSync('/app/e2e/e2e-debug.log', `[CONSOLE]: ${msg.text()}\n`);
    });
    
    await opPage.goto('/');
    await opPage.waitForLoadState('networkidle');
    
    // Login as Operator
    await opPage.fill('input[placeholder="your.id"]', 'operator1');
    await opPage.fill('input[placeholder="••••••••"]', 'password123');
    await opPage.click('button:has-text("LOG IN")');
    await expect(opPage.locator('.app-container')).toBeVisible({ timeout: 20000 });
    
    // Open the created request from the list
    await opPage.click('.nav-item:has-text("요청 관리")');
    await opPage.waitForTimeout(3000);
    
    // Click on the row with the specific ID
    await opPage.click(`tr:has-text("${reqId}")`);
    await opPage.waitForSelector('.request-detail-fixed');
    
    // 3. Try to resolve without mandatory fields (Mandatory check) - Add robust debug dump on failure
    try {
        await opPage.waitForSelector('button:has-text("수정")', { timeout: 15000 });
        await opPage.click('button:has-text("수정")');
    } catch (e) {
        const debugInfo = {
            url: opPage.url(),
            authUser: await opPage.evaluate(() => localStorage.getItem('authUser')),
            companyId: await opPage.evaluate(() => localStorage.getItem('companyId')),
            adminTag: await opPage.locator('[data-testid="debug-admin-status"]').textContent(),
            buttons: await opPage.locator('button').allTextContents()
        };
        fs.appendFileSync('/app/e2e/e2e-debug.log', `FAIL_DEBUG_${new Date().toISOString()}: ${JSON.stringify(debugInfo, null, 2)}\n`);
        throw e;
    }
    
    // Global dialog handler for mandatory checks
    let lastDialogMessage = '';
    opPage.on('dialog', async dialog => {
        lastDialogMessage = dialog.message();
        await dialog.dismiss();
    });

    // Verify mandatory validation when trying to save as RESOLVED
    await opPage.click('[data-testid="status-button-RESOLVED"]');
    await opPage.waitForSelector('button:has-text("저장")');
    await opPage.click('button:has-text("저장")');
    
    expect(lastDialogMessage).toContain('해결 시 해결 코드와 해결 내용을 입력해야 합니다.');
    
    // 4. Correct resolution
    await opPage.selectOption('select:near(label:text("해결 코드"))', 'FIXED');
    await opPage.fill('textarea[placeholder*="해결한 구체적인 방법"]', 'E2E Verification successfully passed resolution logic.');
    await opPage.click('button:has-text("저장")');
    
    // Verify status updated (check if resolution section exists and has the code)
    await expect(opPage.locator('.resolution-section')).toBeVisible();
    await expect(opPage.locator('text=조치 완료')).toBeVisible();
    
    // Close detail and verify
    await opPage.click('button:has-text("×")');
    await opPage.waitForSelector('.request-detail-fixed', { state: 'hidden', timeout: 10000 });
    
    console.log('E2E Test Passed: Full Request Lifecycle verified inside Docker.');
    
    await opContext.close();
  });
});
