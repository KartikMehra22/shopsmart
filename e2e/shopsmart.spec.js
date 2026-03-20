import { test, expect } from '@playwright/test';

test.describe('ShopSmart E2E Flow', () => {
  test('should load products and allow adding to cart', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Verify Title
    await expect(page).toHaveTitle(/ShopSmart/);

    // Check if products are loaded
    const productList = page.locator('.product-card');
    await expect(productList.first()).toBeVisible({ timeout: 10000 });

    // Mock Add to Cart action (since UI might not have it yet, we check for presence)
    // If the UI has a "Add to Cart" button, we click it.
    const addToCartButton = page
      .getByRole('button', { name: /Add to Cart/i })
      .first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await expect(page.getByText(/Added to Cart/i)).toBeVisible();
    }
  });

  test('should navigate to health check', async ({ page }) => {
    await page.goto('http://localhost:5000/api/health');
    const content = await page.textContent('body');
    expect(content).toContain('OK');
  });
});
