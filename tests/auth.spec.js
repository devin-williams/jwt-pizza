import { test, expect } from 'playwright-test-coverage';

test.describe('Authentication flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/user/me', async (route) => {
      await route.fulfill({ json: null });
    });
    await page.route('*/**/api/order/menu', async (route) => {
      await route.fulfill({ json: [] });
    });
    await page.route('*/**/api/franchise', async (route) => {
      await route.fulfill({ json: { franchises: [] } });
    });
  });

  test('register new user', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      if (route.request().method() === 'POST') {
        const registerRes = {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@jwt.com',
            roles: [{ role: 'diner' }],
          },
          token: 'test-token',
        };
        await route.fulfill({ json: registerRes });
      }
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.getByRole('heading')).toContainText('Welcome to the party');

    await page.getByPlaceholder('Full name').fill('Test User');
    await page.getByPlaceholder('Email address').fill('test@jwt.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();

    // Should redirect to home and show user name
    await expect(page).toHaveURL('/');
  });

  test('login existing user', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      if (route.request().method() === 'PUT') {
        const loginRes = {
          user: {
            id: 2,
            name: 'Existing User',
            email: 'existing@jwt.com',
            roles: [{ role: 'diner' }],
          },
          token: 'existing-token',
        };
        await route.fulfill({ json: loginRes });
      }
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByRole('heading')).toContainText('Welcome back');

    await page.getByPlaceholder('Email address').fill('existing@jwt.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/');
  });

  test('navigate to login from register page', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('main').getByText('Login').click();
    await expect(page).toHaveURL('/login');
  });

  test('logout user', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ json: { message: 'logout successful' } });
      }
    });

    await page.goto('/logout');
    await expect(page).toHaveURL('/');
  });

  test('display error message on failed login', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 401,
          json: { message: 'Invalid credentials' },
        });
      }
    });

    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill('wrong@jwt.com');
    await page.getByPlaceholder('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.text-yellow-200')).toBeVisible();
  });
});
