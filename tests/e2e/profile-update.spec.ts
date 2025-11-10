import { test, expect } from '@playwright/test';
import { login } from './utils/auth.js';

test.describe('Profile Update', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => console.log('BROWSER:', msg.text()));

    // Login first
    await login(page, 'admin@example.com', 'admin123');
  });

  test('should update user name successfully', async ({ page }) => {
    // Navigate to profile edit page
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');

    // Get current name
    const nameInput = page.locator('input[name="name"]');
    const originalName = await nameInput.inputValue();
    console.log('Original name:', originalName);

    // Change name
    const newName = `Test User ${Date.now()}`;
    await nameInput.fill(newName);
    console.log('New name:', newName);

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Check if redirected to profile page
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);

    // Navigate to profile to verify change
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verify the name was updated
    const profileName = await page.locator('h2.text-2xl').textContent();
    console.log('Profile name displayed:', profileName);

    expect(profileName).toBe(newName);
    console.log('✅ Profile name update successful!');
  });

  test('should update user locale successfully', async ({ page }) => {
    // Navigate to profile edit page
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');

    // Get current locale
    const localeSelect = page.locator('select[name="locale"]');
    const originalLocale = await localeSelect.inputValue();
    console.log('Original locale:', originalLocale);

    // Change locale
    const newLocale = originalLocale === 'fr' ? 'en' : 'fr';
    await localeSelect.selectOption(newLocale);
    console.log('New locale:', newLocale);

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Navigate back to edit page to verify change persisted
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');

    const updatedLocale = await localeSelect.inputValue();
    console.log('Updated locale in form:', updatedLocale);

    expect(updatedLocale).toBe(newLocale);
    console.log('✅ Profile locale update successful!');

    // Restore original locale
    await localeSelect.selectOption(originalLocale);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
  });
});
