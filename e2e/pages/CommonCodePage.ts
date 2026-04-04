import { Page, expect } from '@playwright/test';

export class CommonCodePage {
  constructor(private page: Page) {}

  async navigateToCodeMgmt() {
    await this.page.click('.nav-item:has-text("공통코드 관리")');
    await this.page.waitForSelector('h1:has-text("공통 코드 관리")');
  }

  // --- Group Actions ---
  async openCreateGroupModal() {
    await this.page.click('button:has-text("코드 그룹 등록")');
    await this.page.waitForSelector('h2:has-text("코드그룹 등록"), h2:has-text("코드그룹 수정")');
  }

  async registerGroup(data: { id: string; name: string; description: string }) {
    await this.page.fill('input[placeholder="고유 마스터 ID (예: ERR_LEVEL)"]', data.id);
    await this.page.fill('input[placeholder="운영자에게 표시될 이름"]', data.name);
    await this.page.fill('textarea[placeholder="코드 그룹에 대한 상세 설명을 입력하세요."]', data.description);
    
    await this.page.click('button:has-text("정보 등록")');
    await this.page.waitForSelector('button:has-text("코드 그룹 등록")', { timeout: 10000 });
  }

  async navigateToCodesByGroupName(groupName: string) {
    const row = this.page.locator(`tr:has-text("${groupName}")`);
    await row.locator('button:has-text("코드 보기")').click();
    // Wait for code list view to appear (level switches to 'code')
    await this.page.waitForSelector('button:has-text("코드 추가")', { timeout: 10000 });
  }

  // --- Code Actions ---
  async openCreateCodeModal() {
    await this.page.click('button:has-text("코드 추가")');
    await this.page.waitForSelector('h2:has-text("신규 코드 항목 등록"), h2:has-text("코드 상세 정보 수정")');
  }

  async registerCode(data: { id: string; name: string; description: string; sortOrder: number }) {
    await this.page.fill('input[placeholder="고유 하위 ID"]', data.id);
    await this.page.fill('input[placeholder="화면 표시 이름"]', data.name);
    await this.page.fill('textarea[placeholder="코드 항목의 용도와 의미를 입력하세요."]', data.description);
    await this.page.fill('input[type="number"]', data.sortOrder.toString());
    
    await this.page.click('button:has-text("신규 등록")');
    await this.page.waitForSelector('button:has-text("코드 추가")', { timeout: 10000 });
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
