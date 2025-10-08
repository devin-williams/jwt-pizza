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

  test('franchise dashboard shows why franchise for non-franchisee', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Regular User',
          email: 'user@jwt.com',
          roles: [{ role: 'diner' }],
        },
      });
    });

    await page.route('*/**/api/franchise/1', async (route) => {
      await route.fulfill({ json: [] });
    });

    await page.goto('/franchise-dashboard');
    await expect(page.getByRole('heading', { name: 'So you want a piece of the pie?' })).toBeVisible();
  });

  test('franchise dashboard for franchisee with stores', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          json: {
            user: {
              id: 1,
              name: 'Franchisee',
              email: 'f@jwt.com',
              roles: [{ role: 'franchisee', objectId: 1 }],
            },
            token: 'fake-franchisee-token',
          },
        });
      }
    });

    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Franchisee',
          email: 'f@jwt.com',
          roles: [{ role: 'franchisee', objectId: 1 }],
        },
      });
    });

    await page.route('*/**/api/franchise/1', async (route) => {
      await route.fulfill({
        json: [
          {
            id: 1,
            name: 'PizzaCorp',
            admins: [{ id: 1, name: 'Franchisee', email: 'f@jwt.com' }],
            stores: [
              { id: 1, name: 'Downtown', totalRevenue: 1000 },
              { id: 2, name: 'Uptown', totalRevenue: 500 },
            ],
          },
        ],
      });
    });

    // Login first
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('f@jwt.com');
    await page.getByPlaceholder('Password').fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(100);

    await page.goto('/franchise-dashboard');
    await page.waitForTimeout(200);

    // Check franchise name heading
    await expect(page.getByRole('heading', { name: 'PizzaCorp' })).toBeVisible();

    // Check stores are displayed in table
    await expect(page.getByText('Downtown')).toBeVisible();
    await expect(page.getByText('Uptown')).toBeVisible();
    await expect(page.getByText('1,000 ₿')).toBeVisible();
    await expect(page.getByText('500 ₿')).toBeVisible();

    // Check Create store button exists
    await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();

    // Check Close buttons exist
    const closeButtons = page.getByRole('button', { name: /close/i });
    await expect(closeButtons.first()).toBeVisible();
  });
});
