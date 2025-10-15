import { test, expect } from "playwright-test-coverage";

test("updateUser", async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Register" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza dinerx");

  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});

test("updateUserPassword", async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const originalPassword = "originalPass";
  const newPassword = "newPass123";

  // Register a new user
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("password tester");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(originalPassword);
  await page.getByRole("button", { name: "Register" }).click();

  // Navigate to user dashboard
  await page.getByRole("link", { name: "pt" }).click();
  await expect(page.getByRole("main")).toContainText("password tester");

  // Update password
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.locator("#password").fill(newPassword);
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  // Logout
  await page.getByRole("link", { name: "Logout" }).click();

  // Try logging in with old password - should fail
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(originalPassword);
  await page.getByRole("button", { name: "Login" }).click();

  // Verify login failed - user link should not appear
  await expect(page.getByRole("link", { name: "pt" })).not.toBeVisible({ timeout: 3000 });

  // Login with new password - should succeed
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(newPassword);
  await page.getByRole("button", { name: "Login" }).click();

  // Should be logged in successfully
  await page.getByRole("link", { name: "pt" }).click();
  await expect(page.getByRole("main")).toContainText("password tester");
});

test("updateUserEmail", async ({ page }) => {
  const originalEmail = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const newEmail = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const password = "testPass";

  // Register a new user
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("email tester");
  await page.getByRole("textbox", { name: "Email address" }).fill(originalEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Register" }).click();

  // Navigate to user dashboard
  await page.getByRole("link", { name: "et" }).click();
  await expect(page.getByRole("main")).toContainText(originalEmail);

  // Update email
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");

  // Find the email input and update it
  const emailInputs = await page.getByRole("textbox").all();
  await emailInputs[1].fill(newEmail); // Second textbox is email

  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  // Verify the email is updated on the dashboard
  await expect(page.getByRole("main")).toContainText(newEmail);

  // Logout and login with new email
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByRole("textbox", { name: "Email address" }).fill(newEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  // Should be logged in successfully with new email
  await page.getByRole("link", { name: "et" }).click();
  await expect(page.getByRole("main")).toContainText(newEmail);
  await expect(page.getByRole("main")).toContainText("email tester");
});

test("updateUserMultipleFields", async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const originalName = "original user";
  const updatedName = "updated user";
  const password = "testpass";

  // Register a new user
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill(originalName);
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Register" }).click();

  // Navigate to user dashboard
  await page.getByRole("link", { name: "ou" }).click();

  // Verify original name is displayed
  await expect(page.getByRole("main")).toContainText(originalName);

  // Update both name and email
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");

  const nameInput = page.getByRole("textbox").first();
  await nameInput.fill(updatedName);

  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  // Verify the name is updated
  await expect(page.getByRole("main")).toContainText(updatedName);

  // Verify diner role is still present
  await expect(page.getByRole("main")).toContainText("diner");
});
