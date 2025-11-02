/**
 * Authentication Diagnostics E2E Tests
 *
 * Tests to diagnose authentication and session issues
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Authentication Diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all cookies and storage before each test
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test('Step 1: Login page is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Verify page loads
    await expect(page).toHaveURL(`${BASE_URL}/auth/login`);

    // Check for login form elements
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    console.log('✅ Login page is accessible and form is present');
  });

  test('Step 2: Form submission works', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Fill in credentials
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`After login, redirected to: ${currentUrl}`);

    // Check if we're redirected to dashboard or back to login
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Redirected to dashboard');
    } else if (currentUrl.includes('/auth/login')) {
      console.log('❌ Redirected back to login - authentication failed');
    } else {
      console.log(`⚠️ Redirected to unexpected URL: ${currentUrl}`);
    }
  });

  test('Step 3: Check cookies after login', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Login
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Get all cookies
    const cookies = await context.cookies();

    console.log('\n📋 Cookies after login:');
    for (const cookie of cookies) {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
      console.log(
        `    httpOnly: ${cookie.httpOnly}, secure: ${cookie.secure}, sameSite: ${cookie.sameSite}`
      );
    }

    // Check for session cookie
    const sessionCookie = cookies.find(
      (c) =>
        c.name === 'sessionId' ||
        c.name === 'taskflow.sid' ||
        c.name === 'sid' ||
        c.name.includes('session')
    );

    if (sessionCookie) {
      console.log(`\n✅ Session cookie found: ${sessionCookie.name}`);
      expect(sessionCookie).toBeDefined();
    } else {
      console.log('\n❌ No session cookie found!');
      console.log('Available cookies:', cookies.map((c) => c.name).join(', '));
      throw new Error('Session cookie not created');
    }
  });

  test('Step 4: Session persistence across requests', async ({ page, context }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const afterLoginUrl = page.url();
    console.log(`After login URL: ${afterLoginUrl}`);

    // Get session cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === 'sessionId' || c.name === 'taskflow.sid' || c.name === 'sid'
    );

    if (!sessionCookie) {
      console.log('❌ No session cookie - cannot test persistence');
      throw new Error('No session cookie found');
    }

    console.log(
      `Session cookie: ${sessionCookie.name} = ${sessionCookie.value.substring(0, 20)}...`
    );

    // Try to access dashboard directly
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const dashboardUrl = page.url();
    console.log(`Dashboard access URL: ${dashboardUrl}`);

    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ Dashboard accessible - session persisted');
    } else if (dashboardUrl.includes('/auth/login')) {
      console.log('❌ Redirected to login - session not recognized');

      // Check if cookie is still present
      const cookiesAfter = await context.cookies();
      const sessionCookieAfter = cookiesAfter.find((c) => c.name === sessionCookie.name);

      if (sessionCookieAfter) {
        console.log('⚠️ Session cookie still present but not recognized by server');
      } else {
        console.log('❌ Session cookie was deleted');
      }
    }
  });

  test('Step 5: Complete login flow', async ({ page, context }) => {
    console.log('\n🔍 Starting complete login flow test...\n');

    // Step 1: Go to login page
    console.log('Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/auth/login`);
    await expect(page).toHaveURL(`${BASE_URL}/auth/login`);
    console.log('✅ Login page loaded');

    // Step 2: Fill credentials
    console.log('\nStep 2: Fill credentials');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');
    console.log('✅ Credentials filled');

    // Step 3: Check request/response
    console.log('\nStep 3: Submit form and check response');

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes('/auth/login') && resp.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ]);

    const status = response.status();
    const headers = response.headers();
    const location = headers.location || 'none';

    console.log(`Response status: ${status}`);
    console.log(`Location header: ${location}`);
    console.log(`Set-Cookie headers:`, headers['set-cookie'] || 'none');

    // Step 4: Wait for navigation
    await page.waitForLoadState('networkidle');
    const finalUrl = page.url();
    console.log(`\nStep 4: Final URL: ${finalUrl}`);

    // Step 5: Check cookies
    console.log('\nStep 5: Check cookies');
    const cookies = await context.cookies();
    console.log(`Total cookies: ${cookies.length}`);
    for (const cookie of cookies) {
      console.log(`  - ${cookie.name}: httpOnly=${cookie.httpOnly}, secure=${cookie.secure}`);
    }

    // Step 6: Try to access dashboard
    console.log('\nStep 6: Try to access dashboard');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    const dashboardUrl = page.url();
    console.log(`Dashboard URL: ${dashboardUrl}`);

    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Dashboard accessible');
    } else {
      console.log('❌ FAILURE: Redirected to', dashboardUrl);
    }

    // Final assertion
    expect(dashboardUrl).toContain('/dashboard');
  });

  test('Step 6: Check database session', async ({ page, context }) => {
    // This test requires manual database check or API endpoint
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === 'sessionId' || c.name === 'taskflow.sid' || c.name === 'sid'
    );

    if (sessionCookie) {
      console.log('\n📝 To verify in database, run:');
      console.log(
        `docker compose exec db psql -U taskflow -d taskflow_dev -c "SELECT sid, (sess->>'userId') as user_id, expire FROM session WHERE sid LIKE '${sessionCookie.value.substring(0, 10)}%';"`
      );
    }
  });

  test('Step 7: Multiple page navigation', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('\n🔄 Testing multiple page navigation...');

    // Try different routes
    const routes = ['/dashboard', '/tasks', '/profile'];

    for (const route of routes) {
      try {
        await page.goto(`${BASE_URL}${route}`);
        await page.waitForLoadState('networkidle');
        const url = page.url();

        if (url.includes(route)) {
          console.log(`✅ ${route} - accessible`);
        } else if (url.includes('/auth/login')) {
          console.log(`❌ ${route} - redirected to login`);
        } else {
          console.log(`⚠️ ${route} - redirected to ${url}`);
        }
      } catch (error) {
        console.log(
          `❌ ${route} - error:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  });
});

test.describe('Session Cookie Configuration', () => {
  test('Check cookie attributes', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === 'sessionId' || c.name === 'taskflow.sid' || c.name === 'sid'
    );

    if (sessionCookie) {
      console.log('\n🔐 Session Cookie Configuration:');
      console.log(`Name: ${sessionCookie.name}`);
      console.log(`Domain: ${sessionCookie.domain}`);
      console.log(`Path: ${sessionCookie.path}`);
      console.log(`Secure: ${sessionCookie.secure}`);
      console.log(`HttpOnly: ${sessionCookie.httpOnly}`);
      console.log(`SameSite: ${sessionCookie.sameSite}`);
      console.log(`Expires: ${sessionCookie.expires}`);

      // Verify configuration
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.path).toBe('/');

      if (BASE_URL.includes('https')) {
        expect(sessionCookie.secure).toBe(true);
      }
    } else {
      console.log('❌ No session cookie found!');
      throw new Error('Session cookie not created');
    }
  });
});
