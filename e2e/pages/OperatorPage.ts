import { Page, expect } from '@playwright/test';

export class OperatorPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/operator');
    await this.page.waitForSelector('h1:has-text("운영 조직 관리")');
    // Mock 데이터 로딩 대기 (신뢰성 확보)
    await this.page.waitForSelector('text=MSP (Mock)', { timeout: 15000 }).catch(() => {
      console.warn('Mock data "MSP (Mock)" not found within timeout.');
    });
  }

  async enableMockMode() {
    // 1. LocalStorage 설정 (UI에서 Zap 아이콘 상태 반영용)
    await this.page.addInitScript(() => {
      window.localStorage.setItem('VITE_ENABLE_MOCKS', 'true');
    });

    // 2. Playwright Native Mocking (Service Worker 보안 제약 우회)
    // URL 패턴을 더 유연하게 하여 포트나 호스트명 차이에 대응
    const companyRoute = /.*\/api\/v1\/operator\/companies$/;
    const teamRoute = /.*\/api\/v1\/operator\/companies\/\d+\/teams$/;
    const operatorRoute = /.*\/api\/v1\/operator\/teams\/\d+\/operators$/;
    const detailRoute = /.*\/api\/v1\/operator\/operators\/\d+$/;
    
    await this.page.route(companyRoute, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: 1, operatorCompanyId: 'MSP', name: 'MSP (Mock)', status: 'ACTIVE' },
          { id: 2, operatorCompanyId: 'CORY-OP', name: 'Cory Operations', status: 'ACTIVE' }
        ]})
      });
    });

    await this.page.route(teamRoute, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: 101, operatorCompanyId: 1, name: 'MSP Core Team', status: 'ACTIVE' }
        ]})
      });
    });

    await this.page.route(operatorRoute, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: 1001, userId: 'msp_admin', name: 'MSP Admin', role: 'ROLE_ADMIN', isActive: true, operatorTeamId: 101, isDeleted: 0 }
        ]})
      });
    });

    await this.page.route(detailRoute, async (route, request) => {
      if (request.method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { id: 1001, userId: 'msp_admin', name: 'MSP Admin', role: 'ROLE_ADMIN', isActive: true, operatorTeamId: 101, isDeleted: 0 } })
        });
      }
    });
  }

  // --- Tree Actions ---
  
  async expandCompany(name: string) {
    const node = this.page.locator(`div:has-text("${name}")`).first();
    const chevron = node.locator('button').first();
    await chevron.click();
    // Wait for sub-nodes to appear
    await this.page.waitForTimeout(500);
  }

  async expandTeam(name: string) {
    const node = this.page.locator(`div:has-text("${name}")`).first();
    const chevron = node.locator('button').first();
    await chevron.click();
    await this.page.waitForTimeout(500);
  }

  async selectNode(type: 'COMPANY' | 'TEAM' | 'OPERATOR', name: string) {
    const node = this.page.locator(`span:has-text("${name}")`).first();
    await node.click();
  }

  async clickAddTeam(companyName: string) {
    const node = this.page.locator(`div:has-text("${companyName}")`).first();
    await node.locator('button[title="팀 추가"]').click();
  }

  async clickAddOperator(teamName: string) {
    const node = this.page.locator(`div:has-text("${teamName}")`).first();
    await node.locator('button[title="운영자 추가"]').click();
  }

  async clickDeleteNode(name: string) {
    const node = this.page.locator(`div:has-text("${name}")`).first();
    await node.locator('button[title*="삭제"]').first().click();
  }

  // --- Form Actions ---

  async fillOperatorForm(data: { userId: string, name: string, email: string, password?: string }) {
    await this.page.fill('input[name="userId"]', data.userId);
    await this.page.fill('input[name="name"]', data.name);
    await this.page.fill('input[name="email"]', data.email);
    if (data.password) {
      await this.page.fill('input[name="password"]', data.password);
    }
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  // --- Mock Controller ---

  async toggleMocking() {
    await this.page.click('[data-testid="mock-controller-zap"]');
    // The alert might appear, we need to handle it in the test script or just wait for reload
  }

  async isMockingEnabled() {
    const zap = this.page.locator('[data-testid="mock-controller-zap"]');
    const classes = await zap.getAttribute('class') || '';
    return classes.includes('bg-yellow-400');
  }
}
