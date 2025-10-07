import { test, expect } from 'playwright-test-coverage';

test.describe('Admin operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      await route.fulfill({ json: [] });
    });
  });

  test('create franchise page loads', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Admin User',
          email: 'admin@jwt.com',
          roles: [{ role: 'admin' }],
        },
      });
    });

    await page.route('*/**/api/franchise', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: { franchises: [] } });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          json: {
            id: 1,
            name: 'New Franchise',
            admins: [{ id: 1, name: 'Admin User', email: 'admin@jwt.com' }],
            stores: [],
          },
        });
      }
    });

    await page.goto('/admin-dashboard/create-franchise');
    await expect(page.getByRole('heading', { name: 'Create franchise' })).toBeVisible();

    // Fill out form
    await page.getByPlaceholder('franchise name').fill('New Franchise');
    await page.getByPlaceholder('franchisee admin email').fill('franchisee@test.com');
    await page.getByRole('button', { name: 'Create' }).click();
  });

  test('close franchise page loads', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Admin User',
          email: 'admin@jwt.com',
          roles: [{ role: 'admin' }],
        },
      });
    });

    await page.route('*/**/api/franchise', async (route) => {
      await route.fulfill({
        json: {
          franchises: [
            {
              id: 1,
              name: 'Test Franchise',
              stores: [],
            },
          ],
        },
      });
    });

    await page.goto('/admin-dashboard/close-franchise');
    await expect(page).toHaveURL('/admin-dashboard/close-franchise');
  });
});
