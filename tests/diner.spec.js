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

  test('select pizzas and view in cart', async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });

    await page.goto('/menu');

    // Wait for store dropdown to populate
    await page.waitForFunction(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 1;
    });

    await page.getByRole('combobox').selectOption('1');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 1');

    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
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

});
