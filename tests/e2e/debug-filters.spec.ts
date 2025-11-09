/**
 * Debug test to check if JavaScript is loaded and working
 */
import { test } from '@playwright/test';
import { login } from './utils/auth.js';

test.describe('Debug Filters', () => {
  test('check HTMX behavior', async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => console.log('BROWSER:', msg.text()));

    // Login
    await login(page, 'admin@example.com', 'admin123');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Enable HTMX logging
    await page.evaluate(() => {
      if (globalThis.htmx) {
        globalThis.htmx.logAll();
      }
    });

    console.log('\n=== Checking TODO checkbox ===');
    const todoCheckbox = page.locator('input[name="status"][value="TODO"]');
    await todoCheckbox.check();

    // Wait for logs and HTMX
    await page.waitForTimeout(2000);

    console.log('URL after check:', page.url());
    const filteredCount = await page.locator('[id^="task-"]').count();
    console.log('Filtered task count:', filteredCount);

    // Now uncheck
    console.log('\n=== Unchecking TODO checkbox ===');
    await todoCheckbox.uncheck();

    // Wait for logs
    await page.waitForTimeout(2000);

    console.log('Final URL:', page.url());
    const finalTaskCount = await page.locator('[id^="task-"]').count();
    console.log('Final task count:', finalTaskCount);
  });
});
