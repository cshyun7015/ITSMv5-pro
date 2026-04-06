import { Page, expect } from '@playwright/test';

export class EventPage {
  constructor(private page: Page) {}

  async navigateToEventList() {
    await this.page.click('text=이벤트 관리');
    await expect(this.page.locator('h1:has-text("이벤트 관리")')).toBeVisible({ timeout: 10000 });
  }

  async simulateEvent(companyName: string = '삼성전자') {
    // Select customer filter if needed
    if (companyName) {
        await this.page.selectOption('select', { label: companyName });
    }
    await this.page.click('button:has-text("시뮬레이션")');
    // Wait for the simulated card to appear (or just wait a bit)
    await this.page.waitForTimeout(2000);
  }

  async openFirstEvent() {
    // Click the first card (generic) or first row
    const card = this.page.locator('.event-card').first();
    const row = this.page.locator('.compact-row').first();
    
    if (await card.isVisible()) {
        await card.click();
    } else {
        await row.click();
    }
    
    // Check if drawer is open
    await expect(this.page.locator('.drawer-content')).toBeVisible();
  }

  async acknowledgeEvent() {
    await this.page.click('button:has-text("인지 처리")');
    // Drawer should auto-close or update. Usually onUpdated() is called.
    await expect(this.page.locator('.drawer-content')).not.toBeVisible();
  }

  async assignEvent(operatorName: string) {
    const select = this.page.locator('.drawer-content select');
    await select.waitFor({ state: 'visible' });
    
    // Use partial match via selector if precise label is unpredictable, or use value if known
    await select.selectOption({ label: `${operatorName} (operator2)` });
    
    await this.page.click('button:has-text("배정")');
    await expect(this.page.locator('.drawer-content')).not.toBeVisible();
  }

  async resolveEvent() {
    await this.page.click('button:has-text("해결 완료")');
    await expect(this.page.locator('.drawer-content')).not.toBeVisible();
  }

  async promoteToIncident() {
    await this.page.click('button:has-text("장애 승격")');
    // Promotions can take longer due to cross-service call
    await expect(this.page.locator('.drawer-content')).not.toBeVisible({ timeout: 15000 });
  }

  async cancelEvent() {
    await this.page.click('button:has-text("취소 처리")');
    await expect(this.page.locator('.drawer-content')).not.toBeVisible();
  }
}
