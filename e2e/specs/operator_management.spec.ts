import { test, expect } from '@playwright/test';
import { OperatorPage } from '../pages/OperatorPage';

test.describe('Operator Management UI Tests', () => {
  let operatorPage: OperatorPage;

  test.beforeEach(async ({ page }) => {
    operatorPage = new OperatorPage(page);
    await operatorPage.enableMockMode(); // Force MSW ON
    await operatorPage.navigate();
  });

  test('Hierarchy Browsing: Should expand and select nodes', async ({ page }) => {
    // 1. Expand Company
    await operatorPage.expandCompany('MSP (Mock)');
    
    // 2. Select a Team
    await operatorPage.selectNode('TEAM', 'MSP Core Team');
    
    // 3. Verify detail view shows team info
    await expect(page.locator('h2:has-text("운영팀 상세 정보")')).toBeVisible();
    await expect(page.locator('input[value="MSP Core Team"]')).toBeVisible();
  });

  test('Operator Creation: Should validate fields and show errors', async ({ page }) => {
    await operatorPage.expandCompany('MSP (Mock)');
    await operatorPage.expandTeam('MSP Core Team');
    
    // 1. Open Add Operator form
    await operatorPage.clickAddOperator('MSP Core Team');
    
    // 2. Click Create without filling anything
    await operatorPage.submitForm();
    
    // 3. Verify validation errors
    await expect(page.locator('text=사용자 ID는 필수입니다.')).toBeVisible();
    await expect(page.locator('text=성명은 필수입니다.')).toBeVisible();
    await expect(page.locator('text=초기 비밀번호는 필수입니다.')).toBeVisible();
  });

  test('Hard Delete: MSP Operator should show physical delete option', async ({ page }) => {
    await operatorPage.expandCompany('MSP (Mock)');
    await operatorPage.expandTeam('MSP Core Team');
    
    // 1. Click delete on an operator in MSP (Mock)
    await page.locator('div:has-text("MSP Admin")').first().hover();
    await page.locator('button[title="운영자 삭제"]').first().click();
    
    // 2. Verify Confirm Modal shows hard delete choice
    await expect(page.locator('text=데이터베이스에서 물리적으로 즉시 삭제')).toBeVisible();
    
    // 3. Close modal
    await page.click('button:has-text("취소")');
  });
});

test.describe('Operator Mock Controller Tests', () => {
  let operatorPage: OperatorPage;

  test('Mock Controller: Should toggle MSW via Zap icon', async ({ page }) => {
    operatorPage = new OperatorPage(page);
    await operatorPage.navigate();

    // 1. Initial State
    const initialState = await operatorPage.isMockingEnabled();
    
    // 2. Handle dialog for reload
    page.on('dialog', dialog => dialog.accept());
    
    // 3. Toggle
    await operatorPage.toggleMocking();
    
    // 4. Verify state changed
    const newState = await operatorPage.isMockingEnabled();
    expect(newState).not.toBe(initialState);
  });
});
