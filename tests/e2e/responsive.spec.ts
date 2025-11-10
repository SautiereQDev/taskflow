/**
 * E2E Tests - Responsive Design
 * Tests mobile and desktop responsive behavior
 */

import { test, expect } from '@playwright/test';
import { login } from './utils/auth.js';

const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123',
};

test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-friendly login page', async ({ page }) => {
    await page.goto('/auth/login');

    // Form should be visible and usable on mobile
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Inputs should be wide enough (not overflow)
    const emailBox = await emailInput.boundingBox();
    expect(emailBox?.width).toBeLessThanOrEqual(375);
  });

  test('should display mobile-friendly task list', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/tasks');

    // Task list should be visible
    const taskList = page.locator('#task-list-container, .task-list').first();
    await expect(taskList).toBeVisible();

    // Navigation should be accessible
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should handle mobile navigation menu', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard');

    // Look for mobile menu toggle (hamburger)
    const mobileMenuToggle = page.locator(
      'button[aria-label*="menu"], button[class*="menu"], .drawer-toggle, #menu-toggle'
    );

    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      await page.waitForTimeout(500);

      // Menu content should appear
      const menuContent = page.locator('[class*="drawer"], [class*="menu-content"], nav');
      await expect(menuContent.first()).toBeVisible();
    }
  });
});

test.describe('Responsive Design - Desktop', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('should display desktop layout with sidebar', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard');

    // Desktop-specific elements should be visible
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    // Check viewport width
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBeGreaterThanOrEqual(1920);
  });

  test('should display task filters without collapse on desktop', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/tasks');

    // Filters should be visible by default on desktop
    const filtersPanel = page.locator('#filters-panel, .filters, [class*="filter"]');
    await expect(filtersPanel.first()).toBeVisible();

    // Filter controls should be accessible
    const statusCheckbox = page.locator('input[name="status"]').first();
    await expect(statusCheckbox).toBeVisible();
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should handle tablet layout appropriately', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/tasks');

    // Content should be visible and properly laid out
    const taskList = page.locator('#task-list-container').first();
    await expect(taskList).toBeVisible();

    // Check that content doesn't overflow
    const mainElement = page.locator('main').first();
    const mainBox = await mainElement.boundingBox();

    if (mainBox) {
      expect(mainBox.width).toBeLessThanOrEqual(768);
    }
  });
});
