/**
 * Main User Journey E2E Tests
 *
 * Complete user workflow testing:
 * 1. Register new user
 * 2. Login
 * 3. Navigate dashboard
 * 4. Create task
 * 5. View task details
 * 6. Edit task
 * 7. Filter tasks
 * 8. Delete task
 * 9. Logout
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Generate unique test user data
const timestamp = Date.now();
const testUser = {
  email: `testuser${timestamp}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};

test.describe('Complete User Journey', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Should load home page', async () => {
    await page.goto(BASE_URL);

    // Check page loads
    await expect(page).toHaveURL(BASE_URL);

    // Check for navigation links
    const loginLink = page.locator(
      'a[href*="/auth/login"], a:has-text("Login"), a:has-text("Connexion")'
    );
    await expect(loginLink).toBeVisible();
  });

  test('2. Should register new user', async () => {
    await page.goto(`${BASE_URL}/auth/register`);

    // Fill registration form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Should redirect to login or dashboard
    const currentUrl = page.url();
    expect(currentUrl.includes('/auth/login') || currentUrl.includes('/dashboard')).toBeTruthy();
  });

  test('3. Should login with credentials', async () => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Fill login form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Check for user greeting or dashboard content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toMatch(/dashboard|tableau de bord/i);
  });

  test('4. Should display dashboard with stats', async () => {
    // Ensure we're on dashboard
    await page.goto(`${BASE_URL}/dashboard`);

    // Check for stat cards
    const statCards = page.locator('.stat-card, [class*="stat"]');
    expect(await statCards.count()).toBeGreaterThan(0);

    // Check for tasks section
    const tasksSection = page.locator(':has-text("Tasks"), :has-text("Tâches")');
    await expect(tasksSection.first()).toBeVisible();
  });

  test('5. Should navigate to tasks list', async () => {
    await page.goto(`${BASE_URL}/tasks`);

    // Verify URL
    await expect(page).toHaveURL(`${BASE_URL}/tasks`);

    // Check page header
    const header = page.locator('h1');
    await expect(header).toBeVisible();

    // Check for filters or create button
    const createButton = page.locator(
      'a[href*="/tasks/new"], button:has-text("Create"), button:has-text("Créer")'
    );
    await expect(createButton.first()).toBeVisible();
  });

  test('6. Should create a new task', async () => {
    await page.goto(`${BASE_URL}/tasks/new`);

    // Fill task creation form
    await page.fill('input[name="title"]', 'E2E Test Task');
    await page.fill('textarea[name="description"]', 'This is a test task created by E2E tests');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.selectOption('select[name="priority"]', 'HIGH');

    // Set due date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDateStr = tomorrow.toISOString().slice(0, 16);
    await page.fill('input[name="dueDate"]', dueDateStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Should redirect to task detail or tasks list
    const currentUrl = page.url();
    expect(currentUrl.includes('/tasks')).toBeTruthy();

    // Verify task was created
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toContain('E2E Test Task');
  });

  test('7. Should view task details', async () => {
    // Go to tasks list first
    await page.goto(`${BASE_URL}/tasks`);

    // Find and click on our test task
    const taskLink = page.locator('a:has-text("E2E Test Task")').first();
    await taskLink.click();

    // Wait for navigation
    await page.waitForURL(/\/tasks\/[a-f0-9-]+$/);

    // Verify task details are displayed
    await expect(page.locator('h1, h2')).toContainText('E2E Test Task');
    await expect(page.locator('body')).toContainText('This is a test task created by E2E tests');

    // Check status badge
    const statusBadge = page.locator(':has-text("TODO"), :has-text("À faire")');
    await expect(statusBadge.first()).toBeVisible();

    // Check priority badge
    const priorityBadge = page.locator(':has-text("HIGH"), :has-text("HAUTE")');
    await expect(priorityBadge.first()).toBeVisible();
  });

  test('8. Should edit task', async () => {
    // Navigate to tasks list
    await page.goto(`${BASE_URL}/tasks`);

    // Click on test task
    const taskLink = page.locator('a:has-text("E2E Test Task")').first();
    await taskLink.click();

    await page.waitForURL(/\/tasks\/[a-f0-9-]+$/);

    // Click edit button
    const editButton = page.locator(
      'a[href*="/edit"], button:has-text("Edit"), button:has-text("Modifier")'
    );
    await editButton.click();

    await page.waitForURL(/\/tasks\/[a-f0-9-]+\/edit$/);

    // Modify task
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.type('E2E Test Task - Updated');

    await page.selectOption('select[name="status"]', 'IN_PROGRESS');

    // Submit changes
    await page.click('button[type="submit"]');

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify changes
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toContain('E2E Test Task - Updated');
    expect(pageContent).toMatch(/in progress|en cours/i);
  });

  test('9. Should filter tasks by status', async () => {
    await page.goto(`${BASE_URL}/tasks`);

    // Find status filter
    const statusFilter = page.locator('select[name="status"]');

    if ((await statusFilter.count()) > 0) {
      // Select IN_PROGRESS status
      await statusFilter.selectOption('IN_PROGRESS');

      // Wait for HTMX or page update
      await page.waitForTimeout(1000);

      // Check that filtered results show
      const taskItems = page.locator(':has-text("E2E Test Task - Updated")');
      await expect(taskItems.first()).toBeVisible();
    }
  });

  test('10. Should search for tasks', async () => {
    await page.goto(`${BASE_URL}/tasks`);

    // Find search input
    const searchInput = page.locator('input[name="search"], input[type="search"]');

    if ((await searchInput.count()) > 0) {
      // Type search query
      await searchInput.type('E2E Test');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify our task appears
      const taskResults = page.locator(':has-text("E2E Test Task")');
      await expect(taskResults.first()).toBeVisible();
    }
  });

  test('11. Should complete task', async () => {
    // Navigate to task detail
    await page.goto(`${BASE_URL}/tasks`);
    const taskLink = page.locator('a:has-text("E2E Test Task - Updated")').first();
    await taskLink.click();

    await page.waitForURL(/\/tasks\/[a-f0-9-]+$/);

    // Go to edit
    const editButton = page.locator('a[href*="/edit"]');
    await editButton.click();

    await page.waitForURL(/\/edit$/);

    // Mark as DONE
    await page.selectOption('select[name="status"]', 'DONE');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify status changed
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toMatch(/done|terminé|complété/i);
  });

  test('12. Should delete task', async () => {
    // Navigate to task
    await page.goto(`${BASE_URL}/tasks`);
    const taskLink = page.locator('a:has-text("E2E Test Task")').first();
    await taskLink.click();

    await page.waitForURL(/\/tasks\/[a-f0-9-]+$/);

    // Go to edit page
    const editButton = page.locator('a[href*="/edit"]');
    await editButton.click();

    await page.waitForURL(/\/edit$/);

    // Handle confirmation dialog
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // Click delete button
    const deleteButton = page.locator(
      'button[onclick*="DELETE"], button:has-text("Delete"), button:has-text("Supprimer")'
    );
    await deleteButton.click();

    // Wait for deletion and redirect
    await page.waitForTimeout(1500);

    // Should redirect to tasks list
    await expect(page).toHaveURL(/\/tasks$/);

    // Verify task no longer appears
    const taskResults = page.locator(':has-text("E2E Test Task")');
    expect(await taskResults.count()).toBe(0);
  });

  test('13. Should view user profile', async () => {
    await page.goto(`${BASE_URL}/profile`);

    // Check profile page loads
    await expect(page).toHaveURL(`${BASE_URL}/profile`);

    // Verify user info is displayed
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toContain(testUser.email);
    expect(pageContent).toContain(testUser.firstName);
  });

  test('14. Should access settings page', async () => {
    await page.goto(`${BASE_URL}/settings`);

    // Check settings page loads
    await expect(page).toHaveURL(`${BASE_URL}/settings`);

    // Check for settings options
    const settingsContent = page.locator('body');
    await expect(settingsContent).toContainText(/theme|thème|language|langue/i);
  });

  test('15. Should switch theme', async () => {
    await page.goto(`${BASE_URL}/settings`);

    // Find theme selector
    const themeSelector = page.locator('select[name="theme"], input[name="theme"]');

    if ((await themeSelector.count()) > 0) {
      // Get current theme
      const htmlElement = page.locator('html');
      const currentTheme = await htmlElement.getAttribute('data-theme');

      // Switch theme
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      if ((await themeSelector.getAttribute('type')) === 'select') {
        await themeSelector.selectOption(newTheme);
      }

      // Wait for theme change
      await page.waitForTimeout(500);

      // Verify theme changed
      const updatedTheme = await htmlElement.getAttribute('data-theme');
      expect(updatedTheme).toBe(newTheme);
    }
  });

  test('16. Should logout', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Find and click logout button/link
    const logoutButton = page.locator(
      'a[href*="/auth/logout"], button[type="submit"]:has-text("Logout"), button:has-text("Déconnexion")'
    );

    if ((await logoutButton.count()) > 0) {
      await logoutButton.click();

      // Wait for redirect
      await page.waitForTimeout(1000);

      // Should redirect to home or login
      const currentUrl = page.url();
      expect(
        currentUrl === BASE_URL ||
          currentUrl.includes('/auth/login') ||
          currentUrl === `${BASE_URL}/`
      ).toBeTruthy();

      // Try to access protected page
      await page.goto(`${BASE_URL}/dashboard`);

      // Should redirect to login
      await page.waitForTimeout(1000);
      const redirectUrl = page.url();
      expect(redirectUrl.includes('/auth/login')).toBeTruthy();
    }
  });

  test('17. Should show 404 for non-existent page', async () => {
    const response = await page.goto(`${BASE_URL}/non-existent-page-12345`);

    // Check 404 status
    expect(response?.status()).toBe(404);

    // Check 404 page content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toMatch(/404|not found|page introuvable/i);
  });
});
