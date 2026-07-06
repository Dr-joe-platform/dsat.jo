import { test, expect } from '@playwright/test';

test('has login page', async ({ page }) => {
  await page.goto('/login');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/DSAT/i);
  
  // Expect sign in text
  await expect(page.locator('text=Welcome back')).toBeVisible();
});

test('has signup page', async ({ page }) => {
  await page.goto('/signup');
  
  await expect(page.locator('text=Create your account')).toBeVisible();
});

test('unauthorized dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Should redirect to login
  await expect(page).toHaveURL(/.*login/);
});
