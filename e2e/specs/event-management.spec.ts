import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EventPage } from '../pages/EventPage';

test.describe('Event Management Lifecycle E2E', () => {
    
    test('Simulate -> Acknowledge -> Assign -> Promote Cycle', async ({ page }) => {
        test.setTimeout(120000); // 2 minutes

        const loginPage = new LoginPage(page);
        const eventPage = new EventPage(page);

        // 1. LOGIN (MSP Operator)
        await loginPage.goto();
        await loginPage.login('operator1', 'password123');
        
        // 2. NAVIGATE TO EVENT MANAGEMENT
        await eventPage.navigateToEventList();
        
        // 3. SIMULATE AN EVENT (for 삼성전자)
        console.log('Simulating a new event for 삼성전자...');
        await eventPage.simulateEvent('삼성전자');
        
        // 4. VERIFY EVENT APPEARED & OPEN DETAIL
        const firstCard = page.locator('.event-card').first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });
        const eventMessage = await firstCard.locator('.event-message').textContent();
        console.log(`Found Event: ${eventMessage}`);
        
        // 5. ACKNOWLEDGE (본인 인지)
        await firstCard.click();
        await eventPage.acknowledgeEvent();
        
        // Check if status changed to '인지함' in the card
        await expect(firstCard.locator('text=인지함')).toBeVisible();
        
        // 6. ASSIGN TO ANOTHER OPERATOR (운영자2)
        await firstCard.click();
        console.log('Assigning event to 운영자2...');
        await eventPage.assignEvent('운영자2');
        
        // Open again to check detail
        await firstCard.click();
        await expect(page.locator('.drawer-content')).toContainText('operator2');
        
        // 7. PROMOTE TO INCIDENT
        console.log('Promoting event to Incident...');
        await eventPage.promoteToIncident();
        
        // Check if status changed to '장애 전환'
        await expect(firstCard.locator('text=장애 전환')).toBeVisible();
        
        // 8. VERIFY RELATED INCIDENT LINK
        await firstCard.click();
        await expect(page.locator('.drawer-content')).toContainText('SR-');
        
        console.log('E2E Event Lifecycle Test Passed!');
    });

    test('Simulate -> Cancel Cycle', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const eventPage = new EventPage(page);

        await loginPage.goto();
        await loginPage.login(); // Uses admin/admin123 by default from env
        await eventPage.navigateToEventList();
        
        await eventPage.simulateEvent('하이닉스');
        const firstCard = page.locator('.event-card').first();
        await expect(firstCard).toBeVisible();
        
        await firstCard.click();
        await eventPage.cancelEvent();
        
        await expect(firstCard.locator('text=취소됨')).toBeVisible();
        console.log('E2E Event Cancel Test Passed!');
    });
});
