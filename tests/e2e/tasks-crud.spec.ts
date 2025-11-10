import { test, expect } from '@playwright/test';
import { login } from './utils/auth.js';

/**
 * E2E Tests - Tasks CRUD Operations
 *
 * Tests creation, reading, updating, and deletion of tasks
 */
test.describe('Tasks CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, 'admin@example.com', 'admin123');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('should display tasks list page', async ({ page }) => {
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('h1').first()).toContainText(/tâches|tasks|mes tâches/i);

    // Task list container should exist
    const taskList = page.locator('#task-list-container, .task-list, [class*="task"]');
    await expect(taskList).toBeVisible();
  });

  test('should navigate to create task form', async ({ page }) => {
    // Click new task button
    const newTaskButton = page
      .locator('a:has-text("Nouvelle tâche"), a:has-text("New task"), a[href="/tasks/new"]')
      .first();
    await newTaskButton.click();

    // Should be on create form page
    await expect(page).toHaveURL('/tasks/new');

    // Form elements should be visible
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    await page.goto('/tasks/new');

    // Fill in the form
    await page.fill('input[name="title"]', `E2E Test Task ${Date.now()}`);
    await page.fill('textarea[name="description"]', 'Created by E2E test');

    // Select status
    await page.selectOption('select[name="status"]', 'TODO');

    // Select priority
    await page.selectOption('select[name="priority"]', 'MEDIUM');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should redirect to tasks list
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks/);
  });

  test('should view task details', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Wait for task list container to be visible
    await page.waitForSelector('#task-list-container', { state: 'visible', timeout: 10000 });

    // Find first task item by ID
    const firstTask = page.locator('div[id^="task-"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });

    // Click on task title link to view details
    const taskLink = firstTask.locator('a[href*="/tasks/"]').first();
    await taskLink.click();

    // Should navigate to task detail page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9-]+$/);

    // Task details should be visible
    const taskTitle = page.locator('h1').first();
    await expect(taskTitle).toBeVisible();
  });

  test('should edit a task', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Wait for task list container to be visible
    await page.waitForSelector('#task-list-container', { state: 'visible', timeout: 10000 });

    // Find first task
    const firstTask = page.locator('div[id^="task-"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });

    // Navigate to task detail
    const taskLink = firstTask.locator('a[href*="/tasks/"]').first();
    await taskLink.click();
    await page.waitForLoadState('networkidle');

    // Find edit button or link
    const editButton = page
      .locator('a[href*="/edit"], button:has-text("Modifier"), button:has-text("Edit")')
      .first();

    // Wait for edit button to be visible
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Should be on edit page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9-]+\/edit/);

    // Wait for form to be fully loaded
    await page.waitForSelector('form', { state: 'visible', timeout: 10000 });

    // Modify title
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    const newTitle = `Updated Task ${Date.now()}`;
    await titleInput.fill(newTitle);

    // Submit the form
    await page.click('button[type="submit"]');

    // Should redirect back
    await page.waitForLoadState('networkidle');
  });

  test('should delete a task', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Wait for task list container to be visible
    await page.waitForSelector('#task-list-container', { state: 'visible', timeout: 10000 });

    // Find first task
    const firstTask = page.locator('div[id^="task-"]').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });

    const taskLink = firstTask.locator('a[href*="/tasks/"]').first();
    const taskHref = await taskLink.getAttribute('href');
    await taskLink.click();
    await page.waitForLoadState('networkidle');

    // Find delete button (in dropdown menu)
    const deleteButton = page
      .locator('button:has-text("Supprimer"), button:has-text("Delete")')
      .first();

    // Set up dialog handler for confirmation
    page.once('dialog', (dialog) => dialog.accept());

    await deleteButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // HTMX delete doesn't auto-redirect, manually navigate to verify
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Verify deleted task is no longer in list
    if (taskHref) {
      const deletedTask = page.locator(`a[href="${taskHref}"]`);
      await expect(deletedTask).not.toBeVisible();
    }
  });
});
