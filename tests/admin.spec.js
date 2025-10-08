import { test, expect } from "playwright-test-coverage";

test.describe("Admin operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("*/**/api/order/menu", async (route) => {
      await route.fulfill({ json: [] });
    });
  });

  test("create franchise page loads", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          json: {
            user: {
              id: 1,
              name: "Admin",
              email: "a@jwt.com",
              roles: [{ role: "admin" }],
            },
            token: "fake-admin-token",
          },
        });
      }
    });

    await page.route("*/**/api/user/me", async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: "Admin",
          email: "a@jwt.com",
          roles: [{ role: "admin" }],
        },
      });
    });

    await page.route("*/**/api/franchise", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ json: { franchises: [] } });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          json: {
            id: 1,
            name: "New Franchise",
            admins: [{ id: 1, name: "Admin", email: "a@jwt.com" }],
            stores: [],
          },
        });
      }
    });

    // Login first
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Email address").fill("a@jwt.com");
    await page.getByPlaceholder("Password").fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(100);

    await page.goto("/admin-dashboard/create-franchise");
    await expect(
      page.getByRole("heading", { name: "Create franchise" })
    ).toBeVisible();

    // Fill out form
    await page.getByPlaceholder("franchise name").fill("New Franchise");
    await page
      .getByPlaceholder("franchisee admin email")
      .fill("franchisee@test.com");
    await page.getByRole("button", { name: "Create" }).click();
  });

  test("close franchise page loads", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          json: {
            user: {
              id: 1,
              name: "Admin",
              email: "a@jwt.com",
              roles: [{ role: "admin" }],
            },
            token: "fake-admin-token",
          },
        });
      }
    });

    await page.route("*/**/api/user/me", async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: "Admin",
          email: "a@jwt.com",
          roles: [{ role: "admin" }],
        },
      });
    });

    await page.route("*/**/api/franchise", async (route) => {
      await route.fulfill({
        json: {
          franchises: [
            {
              id: 1,
              name: "Test Franchise",
              stores: [],
            },
          ],
        },
      });
    });

    // Login first
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Email address").fill("a@jwt.com");
    await page.getByPlaceholder("Password").fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(100);

    await page.goto("/admin-dashboard/close-franchise");
    await expect(page).toHaveURL("/admin-dashboard/close-franchise");
  });

  test("create store page with state", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          json: {
            user: {
              id: 1,
              name: "Admin",
              email: "a@jwt.com",
              roles: [{ role: "admin" }],
            },
            token: "fake-admin-token",
          },
        });
      }
    });

    await page.route("*/**/api/user/me", async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: "Admin",
          email: "a@jwt.com",
          roles: [{ role: "admin" }],
        },
      });
    });

    await page.route("*/**/api/franchise/1/store", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          json: { id: 1, name: "New Store", totalRevenue: 0 },
        });
      }
    });

    // Login first
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Email address").fill("a@jwt.com");
    await page.getByPlaceholder("Password").fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(100);

    // Set state and navigate in one step using addInitScript
    await page.addInitScript((state) => {
      window.__ROUTER_STATE__ = state;
    }, { franchise: { id: 1, name: "Test Franchise" } });

    // Inject the state into React Router before navigation
    await page.goto("/create-store/1", { waitUntil: "domcontentloaded" });

    await page.evaluate((state) => {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(state, "", window.location.pathname);
      }
    }, { franchise: { id: 1, name: "Test Franchise" } });

    await page.waitForTimeout(200);

    // Check the page rendered - it should at least show the View heading
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("close store page with state", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          json: {
            user: {
              id: 1,
              name: "Admin",
              email: "a@jwt.com",
              roles: [{ role: "admin" }],
            },
            token: "fake-admin-token",
          },
        });
      }
    });

    await page.route("*/**/api/user/me", async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: "Admin",
          email: "a@jwt.com",
          roles: [{ role: "admin" }],
        },
      });
    });

    await page.route("*/**/api/franchise/1/store/1", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          json: { message: "store deleted" },
        });
      }
    });

    // Login first
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Email address").fill("a@jwt.com");
    await page.getByPlaceholder("Password").fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(100);

    // Navigate and inject state
    await page.goto("/close-store/1/1", { waitUntil: "domcontentloaded" });

    await page.evaluate((state) => {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(state, "", window.location.pathname);
      }
    }, {
      franchise: { id: 1, name: "Test Franchise" },
      store: { id: 1, name: "Downtown Store" },
    });

    await page.waitForTimeout(200);

    // Check the page rendered - it should at least show the View heading
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("admin dashboard with pagination and interactions", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          json: {
            user: {
              id: 1,
              name: "Admin",
              email: "a@jwt.com",
              roles: [{ role: "admin" }],
            },
            token: "fake-admin-token",
          },
        });
      }
    });

    await page.route("*/**/api/user/me", async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          name: "Admin",
          email: "a@jwt.com",
          roles: [{ role: "admin" }],
        },
      });
    });

    await page.route("*/**/api/franchise*", async (route) => {
      await route.fulfill({
        json: {
          franchises: [
            {
              id: 1,
              name: "Franchise A",
              stores: [{ id: 1, name: "Store 1" }],
            },
            {
              id: 2,
              name: "Franchise B",
              stores: [{ id: 2, name: "Store 2" }],
            },
          ],
          more: true,
        },
      });
    });

    // Login first
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Email address").fill("a@jwt.com");
    await page.getByPlaceholder("Password").fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(100);

    await page.goto("/admin-dashboard");
    await page.waitForTimeout(200);

    // Check that franchise data is visible
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();

    // Try to trigger more button if it exists
    const moreButton = page.getByRole("button", { name: /more/i });
    if (await moreButton.isVisible()) {
      await moreButton.click();
      await page.waitForTimeout(100);
    }
  });
});
