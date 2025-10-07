import { test, expect } from 'playwright-test-coverage';

test.describe('Franchise management', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      await route.fulfill({ json: [] });
    });
  });

  test('view franchises as logged out user', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.route('*/**/api/franchise', async (route) => {
      await route.fulfill({
        json: {
          franchises: [
            {
              id: 1,
              name: 'PizzaCorp',
              stores: [
                { id: 1, name: 'Downtown', totalRevenue: 0.5 },
                { id: 2, name: 'Uptown', totalRevenue: 0.3 },
              ],
            },
          ],
        },
      });
    });

    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('heading', { name: /So you want a piece of the pie?/ })).toBeVisible();
  });

});
