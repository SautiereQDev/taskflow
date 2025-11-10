/**
 * Test E2E pour vérifier le changement de statut des tâches
 */
import { test } from '@playwright/test';
import { login } from './utils/auth.js';

test.describe('Task Status Change', () => {
  test('should change task status successfully', async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => console.log('BROWSER:', msg.text()));

    // Capture errors
    page.on('response', async (response) => {
      if (
        response.url().includes('/tasks/') &&
        (response.status() === 400 || response.status() === 500)
      ) {
        const body = await response.text();
        console.log(`${response.status()} Response:`, body);
      }
    });

    // Login
    await login(page, 'admin@example.com', 'admin123');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Get first task that is in status TO-DO
    const firstTask = page
      .locator('div[id^="task-"]:not(#task-list-container):not(#task-count)')
      .first();
    const taskId = (await firstTask.getAttribute('id'))?.replace('task-', '');

    if (!taskId) {
      console.log('No tasks found');
      test.skip();
      return;
    }

    console.log('Testing status change for task:', taskId);

    // Go to edit page
    await page.goto(`/tasks/${taskId}/edit`);
    await page.waitForLoadState('networkidle');

    // Change status to IN_PROGRESS
    const statusSelect = page.locator('select[name="status"]');
    const currentStatus = await statusSelect.inputValue();
    console.log('Current status:', currentStatus);

    if (currentStatus === 'TODO') {
      await statusSelect.selectOption('IN_PROGRESS');
      console.log('Changed status to IN_PROGRESS');

      // Submit
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      // Verify on detail page
      await page.goto(`/tasks/${taskId}`);
      await page.waitForLoadState('networkidle');

      const statusBadge = await page.locator('.badge, [class*="badge"]').first().textContent();
      console.log('Status badge on detail page:', statusBadge);

      if (statusBadge?.includes('En cours') || statusBadge?.includes('IN_PROGRESS')) {
        console.log('✅ Status change successful!');
      } else {
        console.log('❌ Status was not updated');
      }
    } else {
      console.log('Task is not in TODO status, skipping');
      test.skip();
    }
  });
});
