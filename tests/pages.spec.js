import { test, expect } from 'playwright-test-coverage';

test.describe('Page navigation and content', () => {
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

  test('home page displays correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('about page displays correctly', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'The secret sauce' })).toBeVisible();
    await expect(page.locator('img[src="jwt-pizza-logo.png"]')).toBeVisible();
  });

  test('history page displays correctly', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('h2').first()).toBeVisible();
    await expect(page).toHaveURL('/history');
  });

  test('navigate to about from footer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
  });

  test('navigate to history from footer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'History' }).click();
    await expect(page).toHaveURL('/history');
  });

  test('404 page displays for invalid route', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    await expect(page.getByText(/Oops/i)).toBeVisible();
  });

  test('docs page displays API documentation', async ({ page }) => {
    await page.goto('/docs/api');
    await expect(page.locator('main')).toContainText('JWT Pizza API');
  });

  test('docs page displays factory documentation', async ({ page }) => {
    await page.goto('/docs/factory');
    await expect(page).toHaveURL('/docs/factory');
    await expect(page.locator('main')).toBeVisible();
  });

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('link', { name: 'about', exact: true })).toBeVisible();
  });

  test('header displays navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toContainText('Order');
    await expect(page.getByRole('banner')).toContainText('Login');
    await expect(page.getByRole('banner')).toContainText('Register');
  });

  test('footer displays correct links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toContainText('About');
    await expect(page.getByRole('contentinfo')).toContainText('History');
  });
});
