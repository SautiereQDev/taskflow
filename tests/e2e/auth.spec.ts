/**
 * E2E Tests - Authentication
 * Tests user authentication flow (login, logout, session persistence)
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123',
};

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL('/dashboard');

    // Verify user is on dashboard
    await expect(page.locator('h1, h2').first()).toContainText(/tableau de bord|dashboard|hello/i);
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'WrongPass123');
    await page.click('button[type="submit"]');

    // Should stay on login page with error message
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/auth/login');

    // Check for error message (flash message or inline error)
    const errorMessage = page.locator(
      '.alert-error, .error, [role="alert"], .label-text-alt.text-error'
    );
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should maintain session across page navigation', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to tasks
    await page.click('a[href="/tasks"]');
    await page.waitForURL('/tasks');
    await expect(page).toHaveURL('/tasks');

    // Should still be authenticated (not redirected to login)
    await expect(page.locator('h1').first()).toContainText(/tâches|tasks|mes tâches/i);
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.goto('/auth/logout');
    await page.waitForURL('/auth/login', { timeout: 5000 });

    // Verify logged out
    await expect(page).toHaveURL('/auth/login');

    // Try accessing protected route
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    // Try accessing dashboard without login
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);

    // Try accessing tasks without login
    await page.goto('/tasks');
    await page.waitForTimeout(1000);

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
