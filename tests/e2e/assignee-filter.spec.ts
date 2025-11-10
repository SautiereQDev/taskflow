/**
 * Test E2E pour le filtre par personne assignée
 */
import { test, expect } from '@playwright/test';
import { login } from './utils/auth.js';

test.describe('Task Assignee Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => console.log('BROWSER:', msg.text()));

    // Login
    await login(page, 'admin@example.com', 'admin123');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('should filter tasks by assignee', async ({ page }) => {
    // Capture network responses
    page.on('response', async (response) => {
      if (response.url().includes('/tasks') && response.status() === 400) {
        const body = await response.text();
        console.log('400 Response body:', body);
      }
    });

    // Count initial tasks
    const initialTaskCount = await page.locator('[id^="task-"]').count();
    console.log(`Initial task count: ${initialTaskCount}`);

    // Get the assignee select dropdown
    const assigneeSelect = page.locator('select[name="assigneeId"]');
    await expect(assigneeSelect).toBeVisible();

    // Get all options (skip first one which is "Tous")
    const options = await assigneeSelect.locator('option').all();
    console.log(`Found ${options.length} options in assignee select`);

    if (options.length > 1) {
      // Select the second option (first actual user)
      const firstUserValue = await options[1].getAttribute('value');
      const firstUserName = await options[1].textContent();
      console.log(`Selecting assignee: ${firstUserName} (${firstUserValue})`);

      await assigneeSelect.selectOption(firstUserValue || '');

      // Wait for HTMX to update
      await page.waitForTimeout(1000);

      const filteredCount = await page.locator('[id^="task-"]').count();
      console.log(`Filtered task count: ${filteredCount}`);

      // Check URL contains assigneeId
      const url = new URL(page.url());
      console.log(`URL after filter: ${url.href}`);
      console.log(`assigneeId param: ${url.searchParams.get('assigneeId')}`);

      // Verify that the assigneeId is in the URL
      expect(url.searchParams.get('assigneeId')).toBe(firstUserValue);

      // Now select "Tous" again to remove filter
      console.log('\n=== Selecting "Tous" to clear filter ===');
      await assigneeSelect.selectOption('');

      // Wait for HTMX to update
      await page.waitForTimeout(1000);

      const finalCount = await page.locator('[id^="task-"]').count();
      console.log(`Final task count: ${finalCount}`);

      const finalUrl = new URL(page.url());
      console.log(`Final URL: ${finalUrl.href}`);
      console.log(`assigneeId param after clear: ${finalUrl.searchParams.get('assigneeId')}`);

      // Verify that assigneeId is NOT in the URL anymore
      expect(finalUrl.searchParams.get('assigneeId')).toBeNull();

      // Verify we're back to showing all tasks
      expect(finalCount).toBe(initialTaskCount);
    } else {
      console.log('No users available in assignee dropdown, skipping test');
      test.skip();
    }
  });
});
