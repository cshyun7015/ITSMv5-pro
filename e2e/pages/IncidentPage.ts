import { Page, expect } from '@playwright/test';

export class IncidentPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToIncidentList() {
        // Navigate via sidebar (State-based, no URL routing)
        await this.page.click('.nav-item[title="인시던트 관리"]');
        await this.page.waitForLoadState('networkidle');
        // Ensure the incident list container is visible to confirm navigation
        await expect(this.page.locator('.inc-root')).toBeVisible({ timeout: 20000 });
    }

    async openCreateModal() {
        await this.page.click('text=티켓 생성');
        await expect(this.page.locator('.tw-backdrop-blur-xl')).toBeVisible();
    }

    async fillIncidentForm(title: string, description: string) {
        await this.page.fill('[placeholder="요약 제목을 입력하세요 (예: 서울 데이터센터 서버 중단)"]', title);
        await this.page.fill('[placeholder="상세 증상, 에러 코드 및 업무 영향도를 입력하세요..."]', description);
        
        await this.page.click('text=티켓 생성 등록');
        await this.page.waitForLoadState('networkidle');
    }

    async selectFirstIncident(title?: string) {
        // Wait for list to update and card/title to appear
        const selector = title ? `.inc-card:has-text("${title}")` : '.inc-card';
        const card = this.page.locator(selector).first();
        await expect(card).toBeVisible({ timeout: 20000 });
        
        // Click the card
        await card.click();
        
        // Wait for sidebar detail header to be visible
        await expect(this.page.getByText('티켓 상세 내용')).toBeVisible({ timeout: 20000 });
    }

    async changeStatus(actionLabel: string, expectedStatusLabel?: string) {
        // In the sidebar, find the button with the action label
        const actionButton = this.page.locator(`.tw-flex-col.tw-gap-3 button:has-text("${actionLabel}")`);
        await actionButton.click();
        
        // If expectedStatusLabel is provided, verify it appears in the side panel
        if (expectedStatusLabel) {
            await expect(this.page.locator('.inc-sidebar-status')).toHaveText(expectedStatusLabel, { timeout: 20000 });
        }
    }

    async fillResolutionInfo(codeLabel: string, workaround: string) {
        // Open edit icon in sidebar - using stable container class
        await this.page.click('.tw-bg-slate-900\\/80 button:has(svg)');
        await this.page.waitForLoadState('networkidle');
        
        // Select resolution code and fill detail
        await this.page.selectOption('select:below(label:has-text("해결 코드"))', { label: codeLabel });
        await this.page.fill('[placeholder="서비스 복구를 위해 수행한 조치 내용을 상세히 기록하세요..."]', workaround);
        
        await this.page.click('text=수정사항 적용');
        await this.page.waitForLoadState('networkidle');
    }

    async verifyStatusInList(title: string, statusLabel: string) {
        // Find the card by its unique title
        const card = this.page.locator(`.inc-card:has-text("${title}")`);
        await expect(card).toBeVisible({ timeout: 15000 });
        
        // Wait for list to refresh and show the updated status in the badge
        // We filter for inc-badge that is NOT priority (P1, P2, P3, P4, P5)
        const statusBadge = card.locator('.inc-badge').filter({ hasNotText: /P[1-5]/ });
        await expect(statusBadge).toHaveText(statusLabel, { timeout: 20000 });
    }
}
