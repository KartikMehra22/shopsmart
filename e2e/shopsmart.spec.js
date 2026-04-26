import { test, expect } from '@playwright/test';

test.describe('ShopSmart E2E Flow', () => {
  test('should load products and allow adding to cart', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await expect(page).toHaveTitle(/ShopSmart/);

    const productList = page.locator('.card');
    await expect(productList.first()).toBeVisible({ timeout: 10000 });

    const addToCartButton = page
      .getByRole('button', { name: /Add to Cart/i })
      .first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await expect(page.getByText(/Added to Cart/i)).toBeVisible();
    }
  });

  test('should navigate to health check', async ({ page }) => {
    await page.goto('http://localhost:5001/api/health');
    const content = await page.textContent('body');
    expect(content.toLowerCase()).toContain('ok');
  });
});
