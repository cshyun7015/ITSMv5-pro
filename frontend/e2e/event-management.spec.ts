import { test, expect } from '@playwright/test';

test.describe('Event Management Flow', () => {

  const BASE_URL = process.env.BASE_URL || 'http://localhost';

  test('Webhook Ingestion and Incident Promotion Flow', async ({ page, request }) => {
    
    // 1. Inject a Webhook Alert natively
    console.log('Sending webhook payload to generate event...');
    const webhookRes = await request.post(`${BASE_URL}/api/v1/event/webhook/alertmanager`, {
      data: {
        companyId: 'MSP',
        instance: 'web-node-01',
        alertname: 'High CPU Usage'
      }
    });
    expect(webhookRes.status()).toBe(201);
    const eventCreated = await webhookRes.json();
    console.log('Created Event:', eventCreated);

    // 2. Login as Operator
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', 'operator1');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for Login to complete
    await page.waitForURL('**/');
    await expect(page.locator('.user-profile')).toBeVisible({ timeout: 15000 });

    // Navigate to Event Management
    const navItem = page.locator('.nav-item').filter({ hasText: '이벤트 관리' });
    await navItem.waitFor({ state: 'visible' });
    
    // Catch api call triggered by click
    const apiCall = page.waitForResponse(resp => resp.url().includes('/api/v1/event') && resp.status() === 200);
    await navItem.click({ force: true });
    await apiCall;
    
    await expect(page.locator('.panel-header h2')).toContainText('EVENT MANAGEMENT', { timeout: 10000 });

    // 4. Verify Event is Visible in the Grid
    const row = page.locator('tr').filter({ hasText: eventCreated.eventNumber });
    await expect(row).toBeVisible({ timeout: 10000 });

    // 5. Open Event Detail Modal
    await row.click();
    await expect(page.locator('.modal-content header h2', { hasText: 'web-node-01' })).toBeVisible();

    // 6. Promote to Incident
    await page.locator('button', { hasText: '장애(Incident)로 승격' }).click();

    // Handle standard browser alert() popup triggered by handlePromote()
    page.once('dialog', dialog => dialog.accept());
    
    // Wait for the modal UI to update and show PROMOTED INCIDENT label
    await expect(page.locator('.hud-label')).toContainText('PROMOTED INCIDENT', { timeout: 15000 });

    const relatedText = await page.locator('.hud-label + div').textContent();
    expect(relatedText).toContain('SR-'); // Should contain related request ID

    // Close modal
    await page.click('button:has-text("닫기")');
    
    // Check status in row is updated
    await expect(row.locator('td', { hasText: '장애 승격' })).toBeVisible();

  });

  test('Tenant User Insulation Verification', async ({ page }) => {
    // Standard User should not be able to see Promote button or Filter
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', 'user1');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for App to load
    await expect(page.locator('.user-profile')).toBeVisible({ timeout: 10000 });

    // Navigate to Event Management
    await page.locator('.nav-item', { hasText: '이벤트 관리' }).click({ force: true });
    await expect(page.locator('h2', { hasText: 'EVENT MANAGEMENT' })).toBeVisible();

    // Open any event if available
    const rows = page.locator('tbody tr');
    if (await rows.count() > 0) {
        await rows.first().click();
        
        // Modal opens, but Promote button should NOT exist for normal users
        await expect(page.locator('.modal-content')).toBeVisible();
        await expect(page.locator('button:has-text("장애(Incident)로 승격")')).toHaveCount(0);
    }
  });

});
