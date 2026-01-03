import { test, expect } from '@playwright/test';

test.describe('Core CRM Flow', () => {
  const uniqueId = Date.now();
  const loginEmail = `crm-user-${uniqueId}@example.com`;
  const password = 'password123';
  const name = 'CRM Test User';
  const accountName = `Test Account ${uniqueId}`;
  const contactName = `Test Contact ${uniqueId}`;
  const leadName = `Test Lead ${uniqueId}`;

  // Before running the CRM tests, we need to register and log in a user.
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    // Register
    await page.goto('/register');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', loginEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.locator('div[role="alert"]')).toContainText('Registration successful');
    
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', loginEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('/dashboard');
    
    // Save storage state to be used by other tests
    await page.context().storageState({ path: 'storageState.json' });
    await page.close();
  });

  // All tests in this suite will use the saved authentication state.
  test.use({ storageState: 'storageState.json' });

  test('should allow creating a new account', async ({ page }) => {
    await page.goto('/accounts');

    // Open the "Add Account" dialog
    await page.click('button:has-text("Add Account")');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Fill and submit the form
    await dialog.locator('input[name="name"]').fill(accountName);
    await dialog.locator('input[name="industry"]').fill('E2E Testing');
    await dialog.locator('button[type="submit"]').click();

    // Verify the dialog closes and a success toast appears
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('text=Account "' + accountName + '" has been created.')).toBeVisible();
    
    // Verify the new account is in the table
    await expect(page.locator(`tr:has-text("${accountName}")`)).toBeVisible();
  });

  test('should allow creating a new contact for an existing account', async ({ page }) => {
    // This test depends on the previous one to have created an account.
    await page.goto('/contacts');

    await page.click('button:has-text("Add Contact")');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.locator('input[name="name"]').fill(contactName);
    
    // Select the account created in the previous test
    await dialog.locator('button[role="combobox"]').click();
    await page.locator(`div[role="option"]:has-text("${accountName}")`).click();

    await dialog.locator('button[type="submit"]').click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('text=Contact "' + contactName + '" has been created.')).toBeVisible();
    await expect(page.locator(`tr:has-text("${contactName}")`)).toBeVisible();
  });

  test('should allow creating and converting a lead', async ({ page }) => {
    await page.goto('/leads');

    // Create the lead
    await page.click('button:has-text("Add Lead")');
    const addLeadDialog = page.locator('div[role="dialog"]');
    await expect(addLeadDialog).toBeVisible();
    await addLeadDialog.locator('input[name="name"]').fill(leadName);
    await addLeadDialog.locator('input[name="source"]').fill('E2E Test');
    await addLeadDialog.locator('button[type="submit"]').click();

    await expect(addLeadDialog).not.toBeVisible();
    await expect(page.locator(`tr:has-text("${leadName}")`)).toBeVisible();
    
    // Go to lead detail page
    await page.click(`tr:has-text("${leadName}") a`);
    await page.waitForURL(/\/leads\/\d+/);

    // Open and submit the conversion dialog
    await page.click('button:has-text("Convert to Deal")');
    const convertDialog = page.locator('div[role="dialog"]');
    await expect(convertDialog).toBeVisible();
    
    // The dialog is pre-filled, we just need to submit it.
    await convertDialog.locator('button[type="submit"]').click();

    // Verify it redirects to the new opportunity page
    await page.waitForURL(/\/opportunities\/\d+/);
    await expect(page.locator('h1')).toContainText('Opportunities /');
    await expect(page.locator('h1')).toContainText('New Deal'); // From default conversion name
  });
});
