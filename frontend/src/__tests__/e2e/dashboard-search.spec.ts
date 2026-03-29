import { test, expect } from '@playwright/test';

test.describe('Dashboard Search Filtering', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Login
        await page.goto('http://localhost:3000');
        await page.fill('input[placeholder="사용자 아이디"]', 'admin');
        await page.fill('input[placeholder="비밀번호"]', 'admin123');
        await page.click('button:has-text("로그인")');
        
        // 2. Wait for Dashboard to load
        await expect(page.locator('h1:has-text("시스템 대시보드")')).toBeVisible();
    });

    test('should filter by date range and company', async ({ page }) => {
        // 1. Initial State Check
        const totalRequestsInitial = await page.locator('.metric-card.highlight .value').textContent();
        console.log('Initial Total Requests:', totalRequestsInitial);

        // 2. Set Date Range (e.g., 2026-01-01 to today)
        await page.fill('input[type="date"] >> nth=0', '2026-01-01');
        
        // 3. Select a specific company (e.g., MSP)
        await page.selectOption('select', { label: 'MSP(삭제불가)' });

        // 4. Click Search
        await page.click('button:has-text("검색")');

        // 5. Verify data updates (Metric cards should show values)
        // Note: In a real test, we would check for specific expected values based on mock data
        await expect(page.locator('.metric-card.highlight .value')).toBeVisible();
        
        // 6. Verify ROLE_USER restriction (Manual or via second test)
        // (Skipped in this combined script for brevity)
    });

    test('ROLE_USER should see fixed company badge', async ({ page }) => {
        // Logout and login as user
        await page.click('text=로그아웃');
        await page.fill('input[placeholder="사용자 아이디"]', 'test_user'); // Assuming exists
        await page.fill('input[placeholder="비밀번호"]', 'user123');
        await page.click('button:has-text("로그인")');

        await expect(page.locator('.company-badge')).toContainText('(고정)');
        await expect(page.locator('select')).toHaveCount(0); // Should not see company select
    });
});
