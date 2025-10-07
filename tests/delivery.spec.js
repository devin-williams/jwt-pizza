import { test, expect } from 'playwright-test-coverage';

test.describe('Delivery page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      await route.fulfill({
        json: [
          { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
          { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
        ],
      });
    });
  });

  test('delivery page accessible', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.goto('/delivery');
    await expect(page.getByRole('heading', { name: 'Here is your JWT Pizza!' })).toBeVisible();
  });
});
