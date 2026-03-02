// tests/ui-automation.spec.js
const { test, expect } = require('@playwright/test');
const { AjaxDataPage, SampleAppPage, TrickyElementsPage } = require('./pages/PlaygroundPages');

test.describe('UI Testing Playground - Automation Scenarios', () => {

    test('Scenario A: Dynamic Content and Waiting', async ({ page }) => {
        const ajaxPage = new AjaxDataPage(page);
        await ajaxPage.navigate();
        
        const successMessage = await ajaxPage.triggerAjaxAndGetText();
        
        // Assert meaningful state
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toHaveText('Data loaded with AJAX get request.');
    });

    test('Scenario B: Realistic Interactions (Login Form)', async ({ page }) => {
        const sampleAppPage = new SampleAppPage(page);
        await sampleAppPage.navigate();

        // 1. Invalid Login Attempt
        await sampleAppPage.login('', '');
        await expect(sampleAppPage.loginStatus).toHaveText('Invalid username/password');
        await expect(sampleAppPage.loginStatus).toHaveClass(/text-danger/);

        // 2. Valid Login Attempt
        await sampleAppPage.login('Fernando', 'pwd');
        await expect(sampleAppPage.loginStatus).toHaveText('Welcome, Fernando!');
        await expect(sampleAppPage.loginStatus).toHaveClass(/text-success/);
        
        // Verify button text changed to Log Out
        await expect(sampleAppPage.loginButton).toHaveText('Log Out');
    });

    test('Scenario C: Tricky Selectors (Dynamic ID & Overlapped Element)', async ({ page }) => {
        const trickyPage = new TrickyElementsPage(page);

        // Part 1: Dynamic ID
        await trickyPage.navigateToDynamicId();
        // Playwright handles the click seamlessly using the text selector, ignoring the changing ID
        await trickyPage.clickDynamicButton();

        // Part 2: Overlapped Element
        await trickyPage.navigateToOverlappedElement();
        await trickyPage.fillOverlappedName('Fernando');
        
        // Assert the text was successfully entered despite the initial overlap
        await expect(trickyPage.nameInput).toHaveValue('Fernando');
    });
});