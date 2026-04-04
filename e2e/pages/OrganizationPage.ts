import { Page, expect } from '@playwright/test';

export class OrganizationPage {
  constructor(private page: Page) {}

  async navigateToCustomerMgmt() {
    await this.page.locator('.nav-item').filter({ hasText: '고객조직 관리' }).first().click();
    await this.page.waitForSelector('h1:has-text("고객조직 관리")', { timeout: 15000 });
  }

  async navigateToOperatorMgmt() {
    await this.page.locator('.nav-item').filter({ hasText: '운영조직 관리' }).first().click();
    // Use part of header to be safe with spaces
    await this.page.waitForSelector('h1:has-text("운영"), h1:has-text("운영 조직 관리")', { timeout: 15000 });
  }

  async openCreateCompanyModal(type: 'customer' | 'operator') {
    if (type === 'customer') {
      await this.page.click('button:has-text("신규 고객사 등록")');
      await this.page.waitForSelector('h2:has-text("신규 고객사 정보 등록")');
    } else {
      await this.page.click('button:has-text("MSP 등록")');
      await this.page.waitForSelector('h2:has-text("신규 MSP 등록"), h2:has-text("MSP 정보")');
    }
  }

  async registerCompany(type: 'customer' | 'operator', data: { id: string; name: string; businessNumber: string; representative: string }) {
    const form = this.page.locator('form:visible');
    if (type === 'customer') {
      await form.locator('input[placeholder="CUST-000-00A"]').fill(data.id);
      await form.locator('input[placeholder="법인 명칭을 입력하세요"]').fill(data.name);
      await form.locator('input[placeholder="xxx-xx-xxxxx"]').fill(data.businessNumber);
    } else {
      await form.locator('input[placeholder="예: OP-001"]').fill(data.id);
      await form.locator('input[placeholder="MSP 이름을 입력하세요"]').fill(data.name);
      await form.locator('input[placeholder="000-00-00000"]').fill(data.businessNumber);
      await form.locator('input[placeholder="대표자 이름을 입력하세요"]').fill(data.representative);
    }
    await form.locator('button[type="submit"]').click({ force: true });
    await this.page.waitForSelector('.tw-fixed.tw-inset-0', { state: 'hidden', timeout: 30000 });
  }

  async navigateToTeamList(companyName: string) {
    const row = this.page.locator(`tr:has-text("${companyName}")`).first();
    const teamBtn = row.locator('button:has-text("고객사팀관리")');
    if (await teamBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await teamBtn.click();
    } else {
      await row.click();
    }
    // Wait for the UI refresh and network idle
    await this.page.waitForLoadState('networkidle').catch(() => {}); 
    await this.page.waitForSelector('th:has-text("고객사팀명"), th:has-text("#UNIT-"), .nav-button-active:has-text("운영팀"), .gov-breadcrumb', { timeout: 15000 });
  }

  async openCreateTeamModal() {
    const btn = this.page.locator('button:visible').filter({ hasText: /등록$/ }).last();
    await btn.click();
    await this.page.waitForSelector(
      'h2:has-text("신규 조직 구성"), h2:has-text("신규 운영팀 등록"), h2:has-text("팀 정보")',
      { timeout: 15000 }
    );
  }

  async registerTeam(data: { name: string; description: string }) {
    const form = this.page.locator('form:visible');
    await form.locator('input[placeholder]').first().fill(data.name);
    await form.locator('textarea[placeholder]').first().fill(data.description);
    await form.locator('button[type="submit"]').click({ force: true });
    await this.page.waitForSelector('.tw-fixed.tw-inset-0', { state: 'hidden', timeout: 30000 });
  }

  async navigateToUserList(teamName: string) {
    const row = this.page.locator(`tr:has-text("${teamName}")`).first();
    const userBtn = row.locator('button:has-text("사용자관리")');
    if (await userBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userBtn.click();
    } else {
      await row.click();
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForSelector('th:has-text("사용자ID"), th:has-text("운영자ID"), .nav-button-active:has-text("운영자")', { timeout: 15000 });
  }

  async openCreateUserModal() {
    const btn = this.page.locator('button:visible').filter({ hasText: /등록$/ }).last();
    await btn.click();
    await this.page.waitForSelector(
      'h2:has-text("사용자 IAM 등록"), h2:has-text("신규 운영자 등록"), h2:has-text("사용자 정보")',
      { timeout: 15000 }
    );
  }

  async registerUser(data: { id: string; name: string; email: string; role: string; password?: string }) {
    const form = this.page.locator('form:visible');
    
    // 1. ID
    await form.locator('input[placeholder]').first().fill(data.id);
    
    // 2. Password
    if (data.password) {
      const pwField = form.locator('input[type="password"]');
      if (await pwField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await pwField.fill(data.password);
      }
    }
    
    // 3. Name
    const namePHs = ['표시 성명을 입력하세요', '사용자 이름을 입력하세요', '홍길동', '사용자명'];
    let foundName = false;
    for (const ph of namePHs) {
      const el = form.locator(`input[placeholder="${ph}"]`);
      if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
        await el.fill(data.name);
        foundName = true;
        break;
      }
    }
    if (!foundName) {
      const inputs = form.locator('input[placeholder]');
      if (await inputs.count() >= 2) await inputs.nth(1).fill(data.name);
    }
    
    // 4. Email
    await form.locator('input[placeholder*="@"], input[type="email"]').first().fill(data.email);

    // 5. Role - Wait for roles to load first
    const loadingRoles = form.locator('text=동기화 중');
    if (await loadingRoles.isVisible()) {
      await loadingRoles.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
    
    const roleBtn = form.locator(`button:has-text("${data.role}")`).first();
    await roleBtn.waitFor({ state: 'visible', timeout: 5000 });
    await roleBtn.click();
    
    // 5. Submit
    const submitBtn = form.locator('button[type="submit"]').filter({ hasText: /완료|생성|저장/ }).last();
    await submitBtn.click({ force: true });
    
    // 6. Wait for modal to be gone and a small buffer for table refresh
    await this.page.waitForSelector('.tw-fixed.tw-inset-0', { state: 'hidden', timeout: 15000 }).catch(() => {}); 
    await this.page.waitForTimeout(500); 
  }

  async deleteItem(name: string) {
    const row = this.page.locator(`tr:has-text("${name}")`).first();
    let deleteBtn = row.locator('button[title="삭제"], button.gov-icon-btn-danger, button:has(svg.lucide-trash2)').first();
    
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click();
    
    const confirmBtn = this.page.locator('button:has-text("삭제 실행")');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      // Wait for the modal background to disappear
      await this.page.waitForSelector('.tw-fixed.tw-inset-0', { state: 'hidden', timeout: 10000 }).catch(() => {});
    }
    
    await expect(row).not.toBeVisible({ timeout: 15000 });
  }
}
