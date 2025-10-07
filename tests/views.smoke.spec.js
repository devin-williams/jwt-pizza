import { test, expect } from 'playwright-test-coverage';

test.describe('Smoke tests - basic page loads', () => {
  test.beforeEach(async ({ page }) => {
    // Mock common API routes
    await page.route('*/**/api/order/menu', async (route) => {
      await route.fulfill({
        json: [
          { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        ],
      });
    });

    await page.route('*/**/api/franchise', async (route) => {
      await route.fulfill({
        json: {
          franchises: [
            {
              id: 1,
              name: 'PizzaCorp',
              stores: [{ id: 1, name: 'Downtown' }],
            },
          ],
        },
      });
    });
  });

  test('smokes /menu', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.goto('/menu');
    await expect(page.getByRole('heading', { name: /awesome is a click away/i })).toBeVisible();
  });

  test('smokes /admin-dashboard', async ({ page }) => {
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

    await page.route('*/**/api/franchise*', async (route) => {
      await route.fulfill({
        json: {
          franchises: [],
          more: false,
        },
      });
    });

    await page.goto('/admin-dashboard');
    await page.waitForTimeout(200);
    // Just check any heading is visible
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('smokes /payment', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Test User',
          email: 'test@jwt.com',
          roles: [{ role: 'diner' }],
        },
      });
    });

    await page.goto('/payment');
    await page.waitForTimeout(100);
    // Payment page may redirect or show "So worth it"
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible();
  });

  test('smokes /delivery', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.goto('/delivery');
    await expect(page.getByRole('heading', { name: /here is your jwt pizza/i })).toBeVisible();
  });

  test('smokes /close-store', async ({ page }) => {
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

    await page.route('*/**/api/franchise/1/store/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ json: { message: 'store deleted' } });
      }
    });

    await page.goto('/close-store/1/1');
    await page.waitForTimeout(100);
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('smokes /create-store', async ({ page }) => {
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

    await page.route('*/**/api/franchise/1/store', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ json: { id: 1, name: 'New Store' } });
      }
    });

    await page.goto('/create-store/1');
    await page.waitForTimeout(100);
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });
});
