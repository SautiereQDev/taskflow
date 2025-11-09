/**
 * Test E2E pour reproduire le bug : décocher un filtre ne fait pas réapparaître les tâches
 */
import { test, expect } from '@playwright/test';

test.describe('Task Filters - Uncheck behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to tasks
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('should show all tasks when unchecking a status filter', async ({ page }) => {
    // 1. Count initial tasks
    const initialTaskCount = await page.locator('[id^="task-"]').count();
    console.log(`Initial task count: ${initialTaskCount}`);

    // 2. Check TODO filter
    const todoCheckbox = page.locator('input[name="status"][value="TODO"]');
    await todoCheckbox.check();

    // Wait for HTMX request (300ms debounce + request + swap)
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 3. Verify URL contains filter
    expect(page.url()).toContain('status=TODO');

    // 4. Count filtered tasks (should be less than or equal to initial)
    const filteredTaskCount = await page.locator('[id^="task-"]').count();
    console.log(`Filtered task count: ${filteredTaskCount}`);

    // 5. Uncheck TODO filter
    await todoCheckbox.uncheck();

    // Wait for HTMX request
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 6. Verify URL no longer contains filter
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    expect(finalUrl).not.toContain('status=TODO');

    // 7. CRITICAL: Verify all tasks are back
    const finalTaskCount = await page.locator('[id^="task-"]').count();
    console.log(`Final task count: ${finalTaskCount}`);

    expect(finalTaskCount).toBe(initialTaskCount);
  });

  test('should show all tasks when unchecking multiple status filters', async ({ page }) => {
    // 1. Count initial tasks
    const initialTaskCount = await page.locator('[id^="task-"]').count();

    // 2. Check TODO filter
    await page.locator('input[name="status"][value="TODO"]').check();
    await page.waitForTimeout(800);

    // 3. Check IN_PROGRESS filter
    await page.locator('input[name="status"][value="IN_PROGRESS"]').check();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 4. URL should contain both
    const urlWithFilters = page.url();
    expect(urlWithFilters).toContain('status=TODO');
    expect(urlWithFilters).toContain('status=IN_PROGRESS');

    // 5. Uncheck TODO
    await page.locator('input[name="status"][value="TODO"]').uncheck();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 6. URL should only contain IN_PROGRESS
    let currentUrl = page.url();
    expect(currentUrl).not.toContain('status=TODO');
    expect(currentUrl).toContain('status=IN_PROGRESS');

    // 7. Uncheck IN_PROGRESS
    await page.locator('input[name="status"][value="IN_PROGRESS"]').uncheck();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 8. CRITICAL: All filters removed, all tasks should be visible
    currentUrl = page.url();
    expect(currentUrl).not.toContain('status=');

    const finalTaskCount = await page.locator('[id^="task-"]').count();
    expect(finalTaskCount).toBe(initialTaskCount);
  });

  test('should show all tasks when changing dueDateFilter to "Toutes"', async ({ page }) => {
    // 1. Count initial tasks
    const initialTaskCount = await page.locator('[id^="task-"]').count();

    // 2. Select "overdue" filter
    await page.locator('input[name="dueDateFilter"][value="overdue"]').check();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 3. Verify URL
    expect(page.url()).toContain('dueDateFilter=overdue');

    // 4. Select "Toutes" (empty value)
    await page.locator('input[name="dueDateFilter"][value=""]').check();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 5. CRITICAL: URL should NOT contain dueDateFilter
    const finalUrl = page.url();
    console.log(`Final URL after selecting "Toutes": ${finalUrl}`);
    expect(finalUrl).not.toContain('dueDateFilter=');

    // 6. All tasks should be visible
    const finalTaskCount = await page.locator('[id^="task-"]').count();
    expect(finalTaskCount).toBe(initialTaskCount);
  });

  test('should show all tasks when unchecking priority filter', async ({ page }) => {
    // 1. Count initial tasks
    const initialTaskCount = await page.locator('[id^="task-"]').count();

    // 2. Check HIGH priority
    await page.locator('input[name="priority"][value="HIGH"]').check();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 3. Verify filter applied
    expect(page.url()).toContain('priority=HIGH');

    // 4. Uncheck HIGH priority
    await page.locator('input[name="priority"][value="HIGH"]').uncheck();
    await page.waitForTimeout(800);
    await page.waitForLoadState('networkidle');

    // 5. CRITICAL: Verify all tasks are back
    expect(page.url()).not.toContain('priority=');
    const finalTaskCount = await page.locator('[id^="task-"]').count();
    expect(finalTaskCount).toBe(initialTaskCount);
  });
});
