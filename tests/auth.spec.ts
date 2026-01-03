import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const uniqueEmail = `user-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  test('should show an error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]:has-text("Sign In")');

    const error = page.locator('div[role="alert"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Login failed');
  });

  test('should allow a new user to register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    const successMessage = page.locator('div[role="alert"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Registration successful');
  });

  test('should allow a registered user to log in', async ({ page }) => {
    // This test depends on the registration test.
    // In a real-world scenario, you might want to seed the user in the database
    // or use a separate test user for each test.
    await page.goto('/login');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]:has-text("Sign In")');

    // After successful login, the user should be redirected to the dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
