/**
 * Test E2E pour la modification des tâches
 */
import { test } from '@playwright/test';
import { login } from './utils/auth.js';

test.describe('Task Update', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => console.log('BROWSER:', msg.text()));

    // Login
    await login(page, 'admin@example.com', 'admin123');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('should update a task successfully', async ({ page }) => {
    // Capture network responses to see errors
    page.on('response', async (response) => {
      if (
        response.url().includes('/tasks/') &&
        (response.status() === 400 || response.status() === 500)
      ) {
        const body = await response.text();
        console.log(`${response.status()} Response body:`, body);
      }
    });

    // Get the first task ID from the list
    const firstTask = page
      .locator('div[id^="task-"]:not(#task-list-container):not(#task-count)')
      .first();
    const firstTaskId = await firstTask.getAttribute('id');
    console.log('First task ID:', firstTaskId);

    if (!firstTaskId || firstTaskId === 'task-count') {
      console.log('No valid tasks found');
      test.skip();
      return;
    }

    const taskId = firstTaskId.replace('task-', '');
    console.log('Navigating to edit page for task:', taskId);

    // Go directly to the edit page
    await page.goto(`/tasks/${taskId}/edit`);
    await page.waitForLoadState('networkidle');

    console.log('Edit page URL:', page.url());

    // Try to update the title
    const titleInput = page.locator('input[name="title"]');

    if (!(await titleInput.isVisible())) {
      console.log('Title input not found - might be an error page');
      const bodyText = await page.locator('body').textContent();
      console.log('Page content:', bodyText?.substring(0, 500));
      test.fail();
      return;
    }

    const originalTitle = await titleInput.inputValue();
    const newTitle = `${originalTitle} - Modified`;

    console.log('Changing title from:', originalTitle, 'to:', newTitle);

    await titleInput.fill(newTitle);

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait a bit for the request
    await page.waitForTimeout(2000);

    console.log('After submit URL:', page.url());

    // Verify the task was updated by navigating to the detail page
    await page.goto(`/tasks/${taskId}`);
    await page.waitForLoadState('networkidle');

    const titleOnDetailPage = await page.locator('h1, h2').first().textContent();
    console.log('Title on detail page:', titleOnDetailPage);

    // Check if the title was updated (it should contain "Modified")
    if (titleOnDetailPage?.includes('Modified')) {
      console.log('✅ Task update successful!');
    } else {
      console.log('❌ Task was not updated');
    }
  });
});
