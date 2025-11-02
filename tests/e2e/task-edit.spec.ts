/**
 * Task Edit Page E2E Tests
 *
 * End-to-end tests for the task edit functionality
 * Tests Alpine.js interactions, HTMX form submission, validation, and i18n
 */

import { test, expect, type Page } from '@playwright/test';
import { login } from './utils/auth.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Task Edit Page E2E', () => {
  let page: Page;
  let taskId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page, 'admin@example.com', 'admin123');

    // Create a test task to edit
    await page.goto(`${BASE_URL}/tasks/new`);
    await page.fill('input[name="title"]', 'E2E Test Task for Editing');
    await page.fill('textarea[name="description"]', 'This task will be edited in E2E tests');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    await page.click('button[type="submit"]');

    // Wait for redirect and extract task ID from URL
    await page.waitForURL(/\/tasks\/[a-f0-9-]+$/);
    taskId = page.url().split('/').pop() || '';
    expect(taskId).toBeTruthy();
  });

  test.afterAll(async () => {
    // Clean up: delete test task
    if (taskId) {
      await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);
      await page.click('button[onclick*="DELETE"]');
      // Confirm deletion in browser dialog
      page.on('dialog', (dialog) => dialog.accept());
    }
    await page.close();
  });

  test('should navigate to edit page from task detail', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}`);

    // Click edit button
    const editButton = page.locator(
      'a[href*="/edit"], button:has-text("Edit"), button:has-text("Modifier")'
    );
    await editButton.click();

    // Verify URL
    await expect(page).toHaveURL(`${BASE_URL}/tasks/${taskId}/edit`);

    // Verify page title
    await expect(page.locator('h1')).toContainText(/edit|modifier/i);
  });

  test('should display breadcrumb navigation', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check breadcrumb structure
    const breadcrumb = page.locator('nav.breadcrumbs, .breadcrumbs');
    await expect(breadcrumb).toBeVisible();

    // Check breadcrumb links
    await expect(breadcrumb.locator('a[href="/"]')).toBeVisible(); // Home
    await expect(breadcrumb.locator('a[href="/tasks"]')).toBeVisible(); // Tasks
    await expect(breadcrumb.locator(`a[href="/tasks/${taskId}"]`)).toBeVisible(); // Task detail
  });

  test('should pre-fill form with existing task data', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check title is pre-filled
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveValue('E2E Test Task for Editing');

    // Check description is pre-filled
    const descriptionTextarea = page.locator('textarea[name="description"]');
    await expect(descriptionTextarea).toHaveValue('This task will be edited in E2E tests');

    // Check status is selected
    const statusSelect = page.locator('select[name="status"]');
    await expect(statusSelect).toHaveValue('TODO');

    // Check priority is selected
    const prioritySelect = page.locator('select[name="priority"]');
    await expect(prioritySelect).toHaveValue('MEDIUM');
  });

  test('should display character counters with Alpine.js', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check title character counter
    const titleCounter = page.locator('[x-text*="title.length"]');
    await expect(titleCounter).toBeVisible();
    await expect(titleCounter).toContainText('/200');

    // Check description character counter
    const descriptionCounter = page.locator('[x-text*="description.length"]');
    await expect(descriptionCounter).toBeVisible();
    await expect(descriptionCounter).toContainText('/2000');
  });

  test('should update character counter when typing (Alpine.js)', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Clear and type in title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.type('New Title');

    // Check counter updates
    const titleCounter = page.locator('[x-text*="title.length"]');
    await expect(titleCounter).toContainText('9/200'); // "New Title" = 9 chars

    // Type in description
    const descriptionTextarea = page.locator('textarea[name="description"]');
    await descriptionTextarea.clear();
    await descriptionTextarea.type('Short description');

    // Check counter updates
    const descriptionCounter = page.locator('[x-text*="description.length"]');
    await expect(descriptionCounter).toContainText('17/2000'); // "Short description" = 17 chars
  });

  test('should validate required fields', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Clear required title field
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();

    // Try to submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check browser validation message appears
    const validationMessage = await titleInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test('should enforce minlength validation on title', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Enter too short title (< 3 chars)
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.type('AB'); // Only 2 chars

    // Try to submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check validation message
    const validationMessage = await titleInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toContain('at least');
  });

  test('should submit form with HTMX and update page', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Modify task data
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.type('Updated E2E Test Task');

    const descriptionTextarea = page.locator('textarea[name="description"]');
    await descriptionTextarea.clear();
    await descriptionTextarea.type('This task has been updated via HTMX');

    const prioritySelect = page.locator('select[name="priority"]');
    await prioritySelect.selectOption('HIGH');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for HTMX response (should redirect or update)
    await page.waitForTimeout(1000);

    // Should redirect to task detail page
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+$/);

    // Verify updated data is displayed
    await expect(page.locator('body')).toContainText('Updated E2E Test Task');
    await expect(page.locator('body')).toContainText('This task has been updated via HTMX');
  });

  test('should show loading state during submission (Alpine.js)', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Modify title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.type('Testing Loading State');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');

    // Check button becomes disabled immediately
    await submitButton.click();
    await expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await page.waitForTimeout(500);
  });

  test('should display users in assignee dropdown', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    const assigneeSelect = page.locator('select[name="assigneeId"]');
    await expect(assigneeSelect).toBeVisible();

    // Check for "Unassigned" option
    const options = await assigneeSelect.locator('option').allTextContents();
    expect(options.some((opt) => /unassigned|non assignée/i.exec(opt))).toBeTruthy();

    // Check there are user options
    expect(options.length).toBeGreaterThan(1);
  });

  test('should handle due date selection', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Select a due date
    const dueDateInput = page.locator('input[name="dueDate"]');
    await dueDateInput.fill('2025-12-31T23:59');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Navigate back to edit page and verify date persisted
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);
    await expect(dueDateInput).toHaveValue(/2025-12-31T23:59/);
  });

  test('should display delete button with confirmation', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check delete button exists
    const deleteButton = page.locator(
      'button[onclick*="DELETE"], button:has-text("Delete"), button:has-text("Supprimer")'
    );
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toHaveClass(/btn-error/);
  });

  test('should confirm before deleting task', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Setup dialog handler
    let dialogShown = false;
    page.once('dialog', async (dialog) => {
      dialogShown = true;
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toMatch(/delete|supprimer/i);
      await dialog.dismiss(); // Cancel deletion
    });

    // Click delete button
    const deleteButton = page.locator(
      'button[onclick*="DELETE"], button:has-text("Delete"), button:has-text("Supprimer")'
    );
    await deleteButton.click();

    // Verify dialog was shown
    await page.waitForTimeout(500);
    expect(dialogShown).toBeTruthy();

    // Verify still on edit page (deletion was cancelled)
    await expect(page).toHaveURL(`${BASE_URL}/tasks/${taskId}/edit`);
  });

  test('should have cancel button that returns to detail page', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Find cancel button
    const cancelButton = page
      .locator('a.btn-ghost, a:has-text("Cancel"), a:has-text("Annuler")')
      .first();
    await expect(cancelButton).toBeVisible();

    // Click cancel
    await cancelButton.click();

    // Should return to task detail page
    await expect(page).toHaveURL(`${BASE_URL}/tasks/${taskId}`);
  });

  test('should switch language and verify i18n translations', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check current language (assume French by default)
    const currentLang = await page.locator('html').getAttribute('lang');

    // Find language switcher (in header)
    const langSwitcher = page.locator('[name="language"], select[name="locale"], a[href*="lang"]');

    if ((await langSwitcher.count()) > 0) {
      // Switch language
      if (currentLang === 'fr') {
        await langSwitcher.selectOption('en');
      } else {
        await langSwitcher.selectOption('fr');
      }

      await page.waitForTimeout(500);

      // Verify translations changed
      const pageContent = await page.locator('body').textContent();
      if (currentLang === 'fr') {
        // Switched to English
        expect(pageContent).toMatch(/Edit|Save|Cancel|Delete/);
      } else {
        // Switched to French
        expect(pageContent).toMatch(/Modifier|Enregistrer|Annuler|Supprimer/);
      }
    }
  });

  test('should display status options with emojis', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    const statusSelect = page.locator('select[name="status"]');
    const statusOptions = await statusSelect.locator('option').allTextContents();

    // Check for emojis in status options
    expect(statusOptions.some((opt) => opt.includes('📝'))).toBeTruthy(); // Status: TODO
    expect(statusOptions.some((opt) => opt.includes('🚀'))).toBeTruthy(); // Status: IN_PROGRESS
    expect(statusOptions.some((opt) => opt.includes('✅'))).toBeTruthy(); // Status: DONE
    expect(statusOptions.some((opt) => opt.includes('❌'))).toBeTruthy(); // Status: CANCELLED
  });

  test('should display priority options with colored emojis', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    const prioritySelect = page.locator('select[name="priority"]');
    const priorityOptions = await prioritySelect.locator('option').allTextContents();

    // Check for emojis in priority options
    expect(priorityOptions.some((opt) => opt.includes('🟢'))).toBeTruthy(); // LOW
    expect(priorityOptions.some((opt) => opt.includes('🟡'))).toBeTruthy(); // MEDIUM
    expect(priorityOptions.some((opt) => opt.includes('🟠'))).toBeTruthy(); // HIGH
    expect(priorityOptions.some((opt) => opt.includes('🔴'))).toBeTruthy(); // URGENT
  });

  test('should have glassmorphism styling applied', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check for glassmorphism classes
    const glassElements = page.locator('.glass, .glass-light, .glass-heavy');
    await expect(glassElements.first()).toBeVisible();

    // Check for design tokens
    const tfElements = page.locator('[class*="tf-"]');
    expect(await tfElements.count()).toBeGreaterThan(0);
  });

  test('should be responsive on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check form is visible and usable
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check buttons stack vertically on mobile
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should display info card with help text', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Check for info alert/card
    const infoCard = page.locator('.alert-info, [role="alert"]').filter({ hasText: /info/i });
    await expect(infoCard).toBeVisible();
  });

  test('should handle form with invalid data gracefully', async () => {
    await page.goto(`${BASE_URL}/tasks/${taskId}/edit`);

    // Enter title exceeding maxlength
    const titleInput = page.locator('input[name="title"]');
    const longTitle = 'A'.repeat(250); // Exceeds 200 char limit
    await titleInput.clear();
    await titleInput.type(longTitle);

    // Check input enforces maxlength
    const actualValue = await titleInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(200);
  });
});
