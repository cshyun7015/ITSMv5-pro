import { Page, expect } from '@playwright/test';

export class IncidentPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToIncidentList() {
        // UI uses sidebar navigation
        await this.page.click('[data-testid="nav-item-incidents"], .nav-item[title="인시던트 관리"]');
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator('.inc-root')).toBeVisible({ timeout: 20000 });
    }

    async openCreateModal() {
        await this.page.click('[data-testid="btn-create-incident"]');
        await expect(this.page.locator('[data-testid="incident-modal-container"]')).toBeVisible();
    }

    async fillIncidentForm(title: string, description: string, isMajor: boolean = false) {
        if (isMajor) {
            await this.page.check('[data-testid="input-is-major-incident"]');
        }
        await this.page.fill('[data-testid="input-incident-title"]', title);
        await this.page.fill('[data-testid="input-incident-description"]', description);
        
        await this.page.click('[data-testid="btn-modal-submit"]');
        await this.page.waitForLoadState('networkidle');
    }

    async selectFirstIncident(title?: string) {
        const selector = title ? `[data-testid^="incident-card-"]:has-text("${title}")` : '[data-testid^="incident-card-"]';
        const card = this.page.locator(selector).first();
        await expect(card).toBeVisible({ timeout: 20000 });
        await card.click();
        
        // Drawer should open
        await expect(this.page.locator('[data-testid="btn-close-drawer"]')).toBeVisible({ timeout: 20000 });
    }

    async changeStatusViaWorkflow(status: string) {
        const testId = `btn-workflow-${status.toLowerCase()}`;
        await this.page.click(`[data-testid="${testId}"]`);
        await this.page.waitForLoadState('networkidle');
    }

    async fillResolutionInfo(code: string, workaround: string) {
        // Click edit in drawer
        await this.page.click('[data-testid="btn-edit-incident"]');
        
        // Select status RESOLVED to show resolution fields if not already there
        await this.page.selectOption('[data-testid="select-incident-status"]', 'RESOLVED');
        
        await this.page.selectOption('[data-testid="select-resolution-code"]', { value: code });
        await this.page.fill('[data-testid="textarea-resolution-workaround"]', workaround);
        
        await this.page.click('[data-testid="btn-modal-submit"]');
        await this.page.waitForLoadState('networkidle');
    }
    
    async setMockScenario(scenario: 'default' | 'empty' | 'huge' | 'error' | 'delay') {
        await this.page.evaluate((s) => {
            sessionStorage.setItem('mock-scenario', s);
        }, scenario);
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
        await this.navigateToIncidentList();
    }

    async verifyStatusInList(title: string, statusLabel: string) {
        const card = this.page.locator(`[data-testid^="incident-card-"]:has-text("${title}")`);
        await expect(card).toBeVisible({ timeout: 15000 });
        const statusBadge = card.locator('.inc-badge').filter({ hasNotText: /P[1-5]/ });
        await expect(statusBadge).toHaveText(statusLabel, { timeout: 20000 });
    }
}
