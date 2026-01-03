
import { test, expect } from '@playwright/test';

test.describe('Core CRM Flow', () => {
  const uniqueId = Date.now();
  const loginEmail = `crm-user-${uniqueId}@example.com`;
  const password = 'password123';
  const name = 'CRM Test User';
  const accountName = `Test Account ${uniqueId}`;
  const updatedAccountName = `Updated Account ${uniqueId}`;
  const contactName = `Test Contact ${uniqueId}`;
  const updatedContactName = `Updated Contact ${uniqueId}`;
  const leadName = `Test Lead ${uniqueId}`;
  let createdAccountId: string;


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

  test('should allow creating, updating, and deleting an account', async ({ page }) => {
    await page.goto('/accounts');

    // CREATE
    await page.click('button:has-text("Add Account")');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.locator('input[name="name"]').fill(accountName);
    await dialog.locator('input[name="industry"]').fill('E2E Testing');
    await dialog.locator('button[type="submit"]').click();

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('text=Account "' + accountName + '" has been created.')).toBeVisible();
    
    const newAccountRow = page.locator(`tr:has-text("${accountName}")`);
    await expect(newAccountRow).toBeVisible();

    const newAccountId = await newAccountRow.locator('a').getAttribute('href');
    expect(newAccountId).not.toBeNull();
    createdAccountId = newAccountId!.split('/').pop()!;
    
    // UPDATE
    await newAccountRow.locator('button[aria-haspopup="true"]').click();
    await page.locator('div[role="menuitem"]:has-text("Edit")').click();
    const editDialog = page.locator('div[role="dialog"]');
    await expect(editDialog).toBeVisible();
    await editDialog.locator('input[name="name"]').fill(updatedAccountName);
    await editDialog.locator('button[type="submit"]').click();
    
    await expect(editDialog).not.toBeVisible();
    await expect(page.locator(`text=Account "${updatedAccountName}" has been updated.`)).toBeVisible();
    await expect(page.locator(`tr:has-text("${updatedAccountName}")`)).toBeVisible();

    // DELETE
    const updatedRow = page.locator(`tr:has-text("${updatedAccountName}")`);
    await updatedRow.locator('button[aria-haspopup="true"]').click();
    await page.locator('div[role="menuitem"]:has-text("Delete")').click();
    
    const alertDialog = page.locator('div[role="alertdialog"]');
    await expect(alertDialog).toBeVisible();
    await alertDialog.locator('button:has-text("Continue")').click();
    
    await expect(alertDialog).not.toBeVisible();
    await expect(page.locator('text=Account has been deleted.')).toBeVisible();
    await expect(updatedRow).not.toBeVisible(); // The row should be gone from the active list
  });


  test('should allow creating a new contact for an existing account', async ({ page }) => {
    // This test depends on the previous one to have created an account.
    await page.goto('/contacts');

    await page.click('button:has-text("Add Contact")');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.locator('input[name="name"]').fill(contactName);
    
    // The account created in the previous test might have been deleted, so we just pick the first available one.
    // A more robust test would create its own account dependency.
    await dialog.locator('button[role="combobox"]').click();
    await page.locator(`div[role="option"]`).first().click();

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

    // Verify the lead is gone from the leads list
    await page.goto('/leads');
    await expect(page.locator(`tr:has-text("${leadName}")`)).not.toBeVisible();
  });
});
