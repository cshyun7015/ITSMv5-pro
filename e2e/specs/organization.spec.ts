import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { cleanDatabase } from '../utils/db-cleaner';

test.describe('Organization Management E2E', () => {
  test.beforeAll(async () => {
    await cleanDatabase();
  });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    // Clear state
    await page.evaluate(() => localStorage.clear());
    await loginPage.login('operator1', 'password123'); // ROLE_OPERATOR has admin access
  });

  test('Customer Governance Lifecycle (Company -> Team -> User)', async ({ page }) => {
    const orgPage = new OrganizationPage(page);
    const timestamp = Date.now();
    const company = { 
       id: `CUS-E2E-${timestamp}`, 
       name: `E2E Customer ${timestamp}`, 
       businessNumber: '123-45-67890', 
       representative: 'E2E Rep' 
    };
    const team = { name: `E2E Team ${timestamp}`, description: 'Team created via E2E test' };
    const user = { id: `user_${timestamp}`, name: `E2E User ${timestamp}`, email: `user${timestamp}@test.com`, role: '일반 사용자', password: 'password123' };

    await orgPage.navigateToCustomerMgmt();
    
    // 1. Create Company
    await orgPage.openCreateCompanyModal('customer');
    await orgPage.registerCompany('customer', company);
    await expect(page.locator(`tr:has-text("${company.name}")`)).toBeVisible();

    // 2. Create Team
    await orgPage.navigateToTeamList(company.name);
    await orgPage.openCreateTeamModal();
    await orgPage.registerTeam(team);
    await expect(page.locator(`tr:has-text("${team.name}")`)).toBeVisible();

    // 3. Create User
    await orgPage.navigateToUserList(team.name);
    await orgPage.openCreateUserModal();
    await orgPage.registerUser(user);
    await expect(page.locator(`tr:has-text("${user.name}")`)).toBeVisible();

    // 4. Cleanup (User -> Team -> Company)
    await orgPage.deleteItem(user.name);
    // Back to team level via breadcrumb
    await page.click(`.breadcrumb-item:has-text("${company.name} 목록")`);
    await orgPage.deleteItem(team.name);
    // Back to company level via breadcrumb
    await page.click('.breadcrumb-item:has-text("고객사 목록")');
    await orgPage.deleteItem(company.name);
  });

  test('Operator Governance Lifecycle (MSP -> Team -> Operator)', async ({ page }) => {
    const orgPage = new OrganizationPage(page);
    const timestamp = Date.now();
    const msp = { 
       id: `MSP-E2E-${timestamp}`, 
       name: `E2E MSP ${timestamp}`, 
       businessNumber: '987-65-43210', 
       representative: 'MSP Master' 
    };
    const team = { name: `E2E SRE Team ${timestamp}`, description: 'SRE Team via E2E' };
    const operator = { id: `oper_${timestamp}`, name: `E2E Operator ${timestamp}`, email: `oper${timestamp}@msp.com`, role: '일반 운영자', password: 'password123' };

    await orgPage.navigateToOperatorMgmt();

    // 1. Create MSP
    await orgPage.openCreateCompanyModal('operator');
    await orgPage.registerCompany('operator', msp);
    await expect(page.locator(`tr:has-text("${msp.name}")`)).toBeVisible();

    // 2. Create Team
    await orgPage.navigateToTeamList(msp.name);
    await orgPage.openCreateTeamModal();
    await orgPage.registerTeam(team);
    await expect(page.locator(`tr:has-text("${team.name}")`)).toBeVisible();

    // 3. Create Operator
    await orgPage.navigateToUserList(team.name);
    await orgPage.openCreateUserModal();
    await orgPage.registerUser(operator);
    await expect(page.locator(`tr:has-text("${operator.name}")`)).toBeVisible();

    // 4. Cleanup
    await orgPage.deleteItem(operator.name);
    // Use the Context Bar/Breadcrumb for navigation
    await page.click('button:has(svg.lucide-arrow-left)'); // Go back to teams
    await orgPage.deleteItem(team.name);
    await page.click('button:has(svg.lucide-arrow-left)'); // Go back to companies
    await orgPage.deleteItem(msp.name);
  });
});
