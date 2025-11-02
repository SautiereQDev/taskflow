/**
 * E2E Authentication Utilities
 * 
 * Helper functions for authenticating during E2E tests
 */

import type { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Login helper for E2E tests
 * Navigates to login page and submits credentials
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${BASE_URL}/auth/login`);
  
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard after successful login
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 5000 });
}

/**
 * Logout helper for E2E tests
 */
export async function logout(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/auth/logout`);
  // Wait for redirect to login page
  await page.waitForURL(`${BASE_URL}/auth/login`, { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/dashboard`);
    return page.url().includes('/dashboard');
  } catch {
    return false;
  }
}
