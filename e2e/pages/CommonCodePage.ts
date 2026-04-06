import { Page, expect } from '@playwright/test';

export class CommonCodePage {
  constructor(private page: Page) {}

  async navigateToCodeMgmt() {
    await this.page.getByTestId('nav-item-codes').click();
    await this.page.waitForSelector('h1:has-text("코드그룹/코드"), h1:has-text("공통 코드 관리")');
  }

  // --- Group Actions ---
  async openCreateGroupModal() {
    await this.page.getByTestId('create-group-btn').click();
    await this.page.waitForSelector('h2:has-text("코드그룹 등록"), h2:has-text("코드그룹 수정")');
  }

  async registerGroup(data: { id: string; name: string; description: string }) {
    await this.page.getByTestId('group-id-input').fill(data.id);
    await this.page.getByTestId('group-name-input').fill(data.name);
    await this.page.getByTestId('group-desc-input').fill(data.description);
    
    await this.page.getByTestId('group-submit-btn').scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Wait for modal transition
    await this.page.getByTestId('group-submit-btn').click({ force: true });
    await this.page.waitForSelector('[data-testid="group-submit-btn"]', { state: 'hidden', timeout: 10000 });
  }

  async navigateToCodesByGroupName(groupId: string) {
    await this.page.getByTestId(`view-codes-btn-${groupId}`).click();
    // Wait for code list view to appear (level switches to 'code')
    await this.page.waitForSelector('[data-testid="create-code-btn"]', { timeout: 10000 });
  }

  // --- Code Actions ---
  async openCreateCodeModal() {
    await this.page.getByTestId('create-code-btn').click();
    await this.page.waitForSelector('h2:has-text("신규 코드 항목 등록"), h2:has-text("코드 상세 정보 수정")');
  }

  async registerCode(data: { id: string; name: string; description: string; sortOrder: number }) {
    await this.page.getByTestId('code-id-input').fill(data.id);
    await this.page.getByTestId('code-name-input').fill(data.name);
    await this.page.getByTestId('code-desc-input').fill(data.description);
    await this.page.getByTestId('code-sort-input').fill(data.sortOrder.toString());
    
    await this.page.getByTestId('code-submit-btn').scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Wait for modal transition
    await this.page.getByTestId('code-submit-btn').click({ force: true });
    await this.page.waitForSelector('[data-testid="code-submit-btn"]', { state: 'hidden', timeout: 10000 });
  }

  async backToGroups() {
    await this.page.click('#back-trigger');
    await expect(this.page.locator('button:has-text("코드 그룹 등록")')).toBeVisible();
  }

  async deleteItem(name: string, isGroup: boolean = false) {
    // Mock window.confirm to automatically accept
    await this.page.evaluate(() => {
      window.confirm = () => true;
    });

    const row = this.page.locator(`tr:has-text("${name}")`);
    const deleteBtn = row.locator('button').last();
    
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click();
    
    // Wait for row to disappear
    await expect(row).not.toBeVisible({ timeout: 10000 });
  }
}
