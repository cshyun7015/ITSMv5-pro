import { test, expect } from '@playwright/test';

/**
 * ITSM v5 Pro Authentication E2E Tests
 * - Persona-based verification: Customer, Operator, MSP Admin
 * - Multi-tenant security isolation check
 * - Login failure handling
 * - Logout process verification
 */
test.describe('Authentication System Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Enable MSW mocks via localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_ENABLE_MOCKS', 'true');
    });
    await page.goto('/login');
  });

  test('Persona: Customer User - Successful Login & Context Isolation', async ({ page }) => {
    await page.getByTestId('login-tenant-id').fill('CLIENT-A');
    await page.getByTestId('login-user-id').fill('client_user');
    await page.getByTestId('login-password').fill('pass123');
    await page.getByTestId('login-submit-btn').click();

    // Verify successful navigation and context in header
    await expect(page).toHaveURL(/\/incident/);
    const header = page.getByTestId('user-profile-header');
    await expect(header).toContainText('CLIENT-A');
    await expect(header).toContainText('고객사 담당자');
  });

  test('Persona: General Operator - Successful Login & Dashboard Access', async ({ page }) => {
    await page.getByTestId('login-tenant-id').fill('CORY-OP');
    await page.getByTestId('login-user-id').fill('cory_oper');
    await page.getByTestId('login-password').fill('pass123');
    await page.getByTestId('login-submit-btn').click();

    await expect(page).toHaveURL(/\/incident/);
    const header = page.getByTestId('user-profile-header');
    await expect(header).toContainText('CORY-OP');
    await expect(header).toContainText('코리 운영자');
  });

  test('Persona: MSP Admin - Full Lifecycle (Login -> Verify -> Logout)', async ({ page }) => {
    // 1. Login
    await page.getByTestId('login-tenant-id').fill('SYSTEM');
    await page.getByTestId('login-user-id').fill('msp_admin');
    await page.getByTestId('login-password').fill('pass123');
    await page.getByTestId('login-submit-btn').click();

    await expect(page).toHaveURL(/\/incident/);
    const header = page.getByTestId('user-profile-header');
    await expect(header).toContainText('SYSTEM');
    await expect(header).toContainText('MSP 관리자');

    // 2. Logout
    await page.getByTestId('logout-btn').click();

    // 3. Verify Redirection and Session Clearing
    await expect(page).toHaveURL(/\/login/);
    
    // Attempt back navigation to protected area
    await page.goto('/incident');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Feature: Validation & Error Handling', async ({ page }) => {
    // 1. Submit empty form
    await page.getByTestId('login-submit-btn').click();
    await expect(page.locator('text=User ID is required')).toBeVisible();

    // 2. Invalid credentials (MSW mock triggers error on 'fail' password)
    await page.getByTestId('login-tenant-id').fill('SYSTEM');
    await page.getByTestId('login-user-id').fill('msp_admin');
    await page.getByTestId('login-password').fill('fail');
    await page.getByTestId('login-submit-btn').click();

    await expect(page.locator('text=Authentication Error')).toBeVisible();
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('Feature: Signup Form Transitions & Identity Toggle', async ({ page }) => {
    await page.click('text=계정 생성하기');
    await expect(page).toHaveURL(/\/signup/);

    // Initial state: CUSTOMER
    await expect(page.locator('label', { hasText: /Tenant ID/i })).toBeVisible();
    
    // Switch to OPERATOR
    await page.getByTestId('signup-type-operator').click();
    await expect(page.locator('label', { hasText: /Company ID/i })).toBeVisible();
    await expect(page.getByTestId('signup-companyId')).toHaveAttribute('placeholder', /운영사 코드/);

    // Switch back to CUSTOMER
    await page.getByTestId('signup-type-customer').click();
    await expect(page.locator('label', { hasText: /Tenant ID/i })).toBeVisible();
  });
});
