import { test } from '@playwright/test';
import { login } from './utils/auth.js';

test('DEBUG: Inspect task list DOM', async ({ page }) => {
  await login(page, 'admin@example.com', 'admin123');
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');

  // Log task container
  const containerExists = await page.locator('#task-list-container').count();
  console.log('Container exists:', containerExists);

  if (containerExists > 0) {
    const containerHTML = await page.locator('#task-list-container').innerHTML();
    console.log('Container HTML (first 500 chars):', containerHTML.substring(0, 500));
  }

  // Count tasks
  const taskCount = await page.locator('div[id^="task-"]').count();
  console.log('Tasks found with div[id^="task-"]:', taskCount);

  // Alternative selectors
  const altCount1 = await page.locator('.tf-items > div').count();
  console.log('Tasks with .tf-items > div:', altCount1);

  const altCount2 = await page.locator('a[href^="/tasks/"]').count();
  console.log('Links with href^="/tasks/":', altCount2);

  // Get first task if exists
  if (altCount1 > 0) {
    const firstTaskHTML = await page.locator('.tf-items > div').first().innerHTML();
    console.log('\nFirst task HTML (first 300 chars):', firstTaskHTML.substring(0, 300));

    const firstTaskId = await page.locator('.tf-items > div').first().getAttribute('id');
    console.log('First task ID:', firstTaskId);
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-tasks.png', fullPage: true });
  console.log('\nScreenshot saved to test-results/debug-tasks.png');
});
