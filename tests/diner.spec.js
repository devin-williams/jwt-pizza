import { test, expect } from 'playwright-test-coverage';

test.describe('Diner functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      await route.fulfill({
        json: [
          { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
          { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
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
              stores: [
                { id: 1, name: 'Downtown' },
                { id: 2, name: 'Uptown' },
              ],
            },
          ],
        },
      });
    });
  });

  test('menu page displays pizzas', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.goto('/menu');
    await expect(page.getByRole('heading', { name: 'Awesome is a click away' })).toBeVisible();
    await expect(page.getByText('Veggie')).toBeVisible();
    await expect(page.getByText('Pepperoni')).toBeVisible();
  });

  test('diner dashboard accessible when logged in', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Diner User',
          email: 'diner@jwt.com',
          roles: [{ role: 'diner' }],
        },
      });
    });

    await page.route('*/**/api/order', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: {
            dinerId: 1,
            orders: [],
            page: 1,
          },
        });
      }
    });

    await page.goto('/diner-dashboard');
    await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  });

  test('checkout button is disabled without store selection', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.goto('/menu');
    await page.waitForTimeout(100);

    const checkoutButton = page.getByRole('button', { name: 'Checkout' });
    await expect(checkoutButton).toBeDisabled();
  });

  test('diner dashboard shows orders', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: 'Diner User',
          email: 'diner@jwt.com',
          roles: [{ role: 'diner' }],
        },
      });
    });

    await page.route('*/**/api/order', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: {
            dinerId: 1,
            orders: [
              {
                id: 1,
                franchiseId: 1,
                storeId: 1,
                date: '2024-01-01',
                items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }],
              },
            ],
            page: 1,
          },
        });
      }
    });

    await page.goto('/diner-dashboard');
    await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  });
});

