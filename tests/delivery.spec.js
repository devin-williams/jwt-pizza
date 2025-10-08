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

  test('delivery page with order and verify', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.route('*/**/api/order/verify', async (route) => {
      await route.fulfill({
        json: {
          message: 'valid',
          payload: {
            vendor: { id: 'jwt-headquarters', name: 'JWT Pizza' },
            diner: { id: 1, name: 'Test User', email: 'test@jwt.com' },
            order: { id: 1, items: [{ description: 'Veggie', price: 0.0038 }], date: '2024-01-01' },
          },
        },
      });
    });

    await page.goto('/delivery', {
      waitUntil: 'domcontentloaded',
    });

    // Inject order state via evaluate after page loads
    await page.evaluate(() => {
      window.history.replaceState(
        {
          order: {
            id: '123',
            items: [
              { menuId: 1, description: 'Veggie', price: 0.0038 },
              { menuId: 2, description: 'Pepperoni', price: 0.0042 },
            ],
          },
          jwt: 'fake-jwt-token-12345',
        },
        '',
        '/delivery'
      );
    });

    await page.reload();
    await page.waitForTimeout(200);

    // Check order details are visible
    await expect(page.getByText('order ID:')).toBeVisible();
    await expect(page.getByText('pie count:')).toBeVisible();

    // Click Verify button to trigger verify function
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.waitForTimeout(200);

    // Modal should open - close it by clicking the Close button in the modal
    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForTimeout(100);

    // Now click Order more button
    await page.getByRole('button', { name: 'Order more' }).click();
    await page.waitForTimeout(100);
  });
});
