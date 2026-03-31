import { Page, expect } from '@playwright/test';

export class RequestPage {
  constructor(private page: Page) {}

  async navigateToRequestList() {
    await this.page.click('.nav-item:has-text("요청 관리")');
    await this.page.waitForTimeout(2000); // Standard transition wait
  }

  async openCreateModal() {
    await this.page.click('button:has-text("신규 요청")');
    // Wait for the modal title to be visible
    await this.page.waitForSelector('h2:has-text("신규 서비스 요청 등록")');
  }

  async registerRequest(data: { title: string; description: string; impact?: string; urgency?: string }) {
    await this.page.fill('input[placeholder*="요청 내용의 요약을 입력하세요"]', data.title);
    
    if (data.impact) {
      await this.page.selectOption('select:near(label:text("영향도"))', data.impact);
    }
    if (data.urgency) {
      await this.page.selectOption('select:near(label:text("긴급도"))', data.urgency);
    }
    
    await this.page.fill('textarea[placeholder*="상세 내용을 입력해 주세요"]', data.description);
    await this.page.click('button:has-text("요청 등록")');
    
    // Wait for the modal to be hidden
    await this.page.waitForSelector('h2:has-text("신규 서비스 요청 등록")', { state: 'hidden', timeout: 10000 });
  }

  async getLatestRequestId() {
    // Note: Request ID (SR-...) is not directly in the list, but it's in the detail view.
    // For list verification, we can check if the title exists.
    return ''; // We will use title for identification in list
  }

  async openRequestDetailByTitle(title: string) {
    await this.page.click(`tr:has-text("${title}")`);
    await this.page.waitForSelector('span:has-text("요청 번호")');
  }

  async processRequest(data: { resolutionCode: string; resolutionText: string }) {
    // 1. Click Edit button
    await this.page.click('button:has-text("요청 편집")');
    await this.page.waitForTimeout(1500); // Wait for modal animation and data load
    
    // 2. Change status to RESOLVED ('해결됨')
    // We use a more specific locator that finds the select adjacent to the '요청 상태' label
    const statusSelect = this.page.locator('div:has(> span:has-text("요청 상태")) select');
    await statusSelect.scrollIntoViewIfNeeded();
    await statusSelect.selectOption({ label: '해결됨' });
    
    // 3. Select resolution code ('조치 완료')
    const resLabel = data.resolutionCode === 'FIXED' ? '조치 완료' : data.resolutionCode;
    const resSelect = this.page.locator('div:has(> label:has-text("해결 코드")) select');
    await resSelect.scrollIntoViewIfNeeded();
    await resSelect.selectOption({ label: resLabel });
    
    // 4. Enter resolution text
    const resTextArea = this.page.locator('textarea[placeholder="조치 완료 내용을 상세히 입력하세요."]');
    await resTextArea.scrollIntoViewIfNeeded();
    await resTextArea.fill(data.resolutionText);
    
    // 5. Save changes
    await this.page.click('button:has-text("변경 사항 저장")');
    
    // Wait for update to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000); // Wait for state to settle
    
    // Wait for resolution section to appear in read-only mode
    await expect(this.page.locator('section:has-text("해결 및 조치 내용")')).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('text=Resolved successfully')).toBeVisible();
  }

  async deleteRequest() {
    // 1. Click Delete button (Trash icon)
    const deleteBtn = this.page.locator('button[title="삭제"]');
    await deleteBtn.click();
    
    // 2. Click Confirm Delete in modal
    const confirmBtn = this.page.locator('button:has-text("영구 삭제")');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    
    // 3. Wait for modal to close and redirection back to list
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('h1:has-text("요청 목록")')).toBeVisible();
  }

  async deleteRequestByDetail() {
    await this.page.click('button[title="삭제"]');
    await this.page.waitForSelector('h3:has-text("정말 삭제하시겠습니까?")');
    await this.page.click('button:has-text("영구 삭제")');
    
    // Wait for modal to close and list to refresh
    await this.page.waitForSelector('span:has-text("요청 번호")', { state: 'hidden' });
  }

  async closeDetail() {
    await this.page.click('button:has-text("×")');
    await this.page.waitForSelector('.request-detail-fixed', { state: 'hidden', timeout: 10000 });
  }
}
