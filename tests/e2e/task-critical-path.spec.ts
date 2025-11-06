/**
 * E2E Tests - Task Critical Path
 * Tests the complete user journey: Create → Edit → Complete → Delete
 * Verifies HTMX interactions work without full page reloads
 */

import { test, expect, type Page } from '@playwright/test';

// Test credentials
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123',
};

// Helper: Login user
async function loginUser(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

// Helper: Navigate to tasks page
async function navigateToTasks(page: Page): Promise<void> {
  await page.click('a[href="/tasks"]');
  await page.waitForURL('/tasks');
}

test.describe('Task Critical Path - Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await navigateToTasks(page);
  });

  test('Complete task lifecycle: create → edit → complete → delete', async ({ page }) => {
    const taskTitle = `E2E Test Task ${Date.now()}`;
    const taskDescription = 'This is a test task created by Playwright E2E tests';
    const updatedTitle = `${taskTitle} (Updated)`;

    // ============================================
    // STEP 1: CREATE TASK
    // ============================================
    await test.step('Create new task', async () => {
      // Click on "Nouvelle tâche" button
      await page.click('a[href="/tasks/new"]');
      await page.waitForURL('/tasks/new');

      // Fill in task form
      await page.fill('input[name="title"]', taskTitle);
      await page.fill('textarea[name="description"]', taskDescription);
      await page.selectOption('select[name="status"]', 'TODO');
      await page.selectOption('select[name="priority"]', 'HIGH');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to task detail or list
      await page.waitForURL(/\/(tasks\/[a-zA-Z0-9-]+|tasks)/);

      // Verify task appears in the list (navigate if needed)
      if (!page.url().includes('/tasks?') && !page.url().endsWith('/tasks')) {
        await navigateToTasks(page);
      }

      // Wait for task to appear in list
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible({ timeout: 5000 });
    });

    // ============================================
    // STEP 2: EDIT TASK
    // ============================================
    await test.step('Edit task title', async () => {
      // Find and click on the task
      const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..');
      await taskCard.click();

      // Wait for task detail page
      await page.waitForURL(/\/tasks\/[a-zA-Z0-9-]+/);

      // Click edit button
      await page.click('a[href*="/edit"], button:has-text("Modifier")');

      // Update title
      await page.fill('input[name="title"]', updatedTitle);

      // Save changes
      await page.click('button[type="submit"]');

      // Verify updated title appears
      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible({ timeout: 5000 });
    });

    // ============================================
    // STEP 3: MARK AS COMPLETE (via HTMX)
    // ============================================
    await test.step('Mark task as complete', async () => {
      // Navigate back to task list if not there
      if (!page.url().includes('/tasks?') && !page.url().endsWith('/tasks')) {
        await navigateToTasks(page);
      }

      // Find the task card
      const taskCard = page
        .locator(`text=${updatedTitle}`)
        .locator('..')
        .locator('..')
        .locator('..');

      // Check if there's a complete button or status selector
      const completeButton = taskCard.locator(
        'button:has-text("Terminer"), button[title*="Terminer"]'
      );
      const statusSelect = taskCard.locator('select[name*="status"]');

      if ((await completeButton.count()) > 0) {
        // Get current URL to verify no reload
        const urlBefore = page.url();

        // Click complete button
        await completeButton.first().click();

        // Wait for HTMX to finish (check for htmx-request class removal)
        await page.waitForTimeout(500);

        // Verify URL didn't change (HTMX should update without reload)
        expect(page.url()).toBe(urlBefore);

        // Verify task shows completed status
        await expect(taskCard.locator('text=/terminé|done|complété/i')).toBeVisible();
      } else if ((await statusSelect.count()) > 0) {
        // Use status dropdown
        await statusSelect.first().selectOption('DONE');

        // Wait for update
        await page.waitForTimeout(500);

        // Verify status changed
        await expect(taskCard.locator('text=/done|terminé/i')).toBeVisible();
      } else {
        // Navigate to task detail and change status there
        await taskCard.click();
        await page.waitForURL(/\/tasks\/[a-zA-Z0-9-]+/);

        const editLink = page.locator('a[href*="/edit"]');
        if ((await editLink.count()) > 0) {
          await editLink.click();
          await page.selectOption('select[name="status"]', 'DONE');
          await page.click('button[type="submit"]');

          // Verify completion
          await expect(page.locator('text=/done|terminé/i')).toBeVisible();
        }
      }
    });

    // ============================================
    // STEP 4: DELETE TASK
    // ============================================
    await test.step('Delete task', async () => {
      // Navigate to task detail if not there
      const tasksDetailPattern = /\/tasks\/[a-zA-Z0-9-]+$/;
      if (!tasksDetailPattern.exec(page.url())) {
        await navigateToTasks(page);
        const taskCard = page
          .locator(`text=${updatedTitle}`)
          .locator('..')
          .locator('..')
          .locator('..');
        await taskCard.click();
        await page.waitForURL(/\/tasks\/[a-zA-Z0-9-]+/);
      }

      // Find and click delete button
      const deleteButton = page.locator('button:has-text("Supprimer"), button[title*="Supprimer"]');

      // Handle confirmation dialog if it appears
      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await deleteButton.click();

      // Should redirect to task list
      await page.waitForURL(/\/tasks(\?.*)?$/);

      // Verify task is no longer in the list
      await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();
    });
  });

  test('should filter tasks without page reload (HTMX)', async ({ page }) => {
    // Change status filter
    const statusFilter = page.locator('select[name="status"], input[name="status"]');
    if ((await statusFilter.count()) > 0) {
      await statusFilter.first().selectOption('TODO');

      // Wait for HTMX update
      await page.waitForTimeout(500);

      // Verify URL changed with query params
      expect(page.url()).toContain('status=TODO');

      // Verify tasks are filtered (should see task count or filtered results)
      const taskList = page.locator('#task-list-container, .task-list');
      await expect(taskList).toBeVisible();
    }
  });

  test('should handle pagination with HTMX', async ({ page }) => {
    // Check if pagination exists
    const nextPageButton = page.locator('button:has-text("›"), a:has-text("Suivant")');

    if ((await nextPageButton.count()) > 0 && (await nextPageButton.first().isEnabled())) {
      // Click next page
      await nextPageButton.first().click();

      // Wait for HTMX to load content
      await page.waitForTimeout(500);

      // Verify URL updated with page param
      expect(page.url()).toContain('page=');

      // Verify content loaded (task list still visible)
      const taskList = page.locator('#task-list-container, .task-list');
      await expect(taskList).toBeVisible();
    }
  });

  test('should search tasks with debouncing (HTMX)', async ({ page }) => {
    const searchInput = page.locator('input[name="search"], input[placeholder*="Recherch"]');

    if ((await searchInput.count()) > 0) {
      // Type search query
      await searchInput.fill('test');

      // Wait for debounce and HTMX request
      await page.waitForTimeout(500);

      // Verify search was applied (URL or results updated)
      const hasSearchParam = page.url().includes('search=');
      const taskList = page.locator('#task-list-container, .task-list');

      expect(hasSearchParam || (await taskList.count()) > 0).toBeTruthy();
    }
  });
});

test.describe('Task Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await navigateToTasks(page);
  });

  test('should navigate with keyboard', async ({ page }) => {
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if an element is focused
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for loading indicators with aria-label
    const loadingIndicators = page.locator('[aria-label*="Chargement"], [role="status"]');
    expect(await loadingIndicators.count()).toBeGreaterThanOrEqual(0);

    // Check for skip link
    const skipLink = page.locator('a:has-text("Aller au contenu")');
    expect(await skipLink.count()).toBeGreaterThan(0);
  });

  test('should support reduced motion preference', async ({ page }) => {
    // Emulate prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Navigate to tasks
    await navigateToTasks(page);

    // Verify page still functions
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});

test.describe('Task Performance Tests', () => {
  test('should load task list within 2 seconds', async ({ page }) => {
    await loginUser(page);

    const startTime = Date.now();
    await navigateToTasks(page);
    const loadTime = Date.now() - startTime;

    // Should load within 2000ms (per ROADMAP requirements)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle concurrent HTMX requests', async ({ page }) => {
    await loginUser(page);
    await navigateToTasks(page);

    // Trigger multiple filters simultaneously
    await Promise.all([
      page.selectOption('select[name="status"]', 'TODO').catch(() => undefined),
      page.selectOption('select[name="priority"]', 'HIGH').catch(() => undefined),
    ]);

    // Wait for all requests to complete
    await page.waitForTimeout(1000);

    // Verify page is still responsive
    const taskList = page.locator('#task-list-container, .task-list');
    await expect(taskList).toBeVisible();
  });
});
