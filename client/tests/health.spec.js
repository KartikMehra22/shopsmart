import { test, expect } from '@playwright/test';

test.describe('Health Check Status', () => {
    test('should display backend status when API returns success', async ({ page }) => {
        // Mock the backend API response
        await page.route('**/api/health', async route => {
            const json = {
                status: 'UP',
                message: 'Backend is running smoothly',
                timestamp: new Date().toISOString()
            };
            await route.fulfill({ json });
        });

        // Navigate to the app
        await page.goto('/');

        // Assert that the backend status is displayed correctly
        const statusText = page.locator('.status-ok');
        await expect(statusText).toBeVisible();
        await expect(statusText).toHaveText('UP');

        await expect(page.getByText('Message: Backend is running smoothly')).toBeVisible();
    });

    test('should display loading state before API responds', async ({ page }) => {
        // Mock the backend API with a delay
        await page.route('**/api/health', async route => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const json = {
                status: 'UP',
                message: 'Backend is running smoothly',
                timestamp: new Date().toISOString()
            };
            await route.fulfill({ json });
        });

        // Navigate to the app
        await page.goto('/');

        // Assert that the loading message is visible initially
        await expect(page.getByText('Loading backend status...')).toBeVisible();

        // After delay, status should appear
        const statusText = page.locator('.status-ok');
        await expect(statusText).toBeVisible({ timeout: 5000 });
    });

    test('should remain in loading state when API returns 500 error', async ({ page }) => {
        // Mock the backend API with a 500 error
        await page.route('**/api/health', async route => {
            await route.fulfill({ status: 500 });
        });

        // Navigate to the app
        await page.goto('/');

        // Assert that the loading message is visible
        await expect(page.getByText('Loading backend status...')).toBeVisible();

        // Ensure the status text never appears
        const statusText = page.locator('.status-ok');
        await expect(statusText).not.toBeVisible({ timeout: 2000 });
    });
});
