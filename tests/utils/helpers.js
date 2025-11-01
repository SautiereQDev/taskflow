/**
 * Test Helpers
 * Common utilities for testing
 */
import { expect } from 'vitest';
/**
 * Assert that a date is recent (within last N seconds)
 */
export function expectRecentDate(date, withinSeconds = 5) {
  if (!date) {
    throw new Error('Expected date to be defined');
  }
  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime()) / 1000;
  expect(diff).toBeLessThan(withinSeconds);
}
/**
 * Assert that object has expected shape
 */
export function expectObjectShape(obj, expectedKeys) {
  const actualKeys = Object.keys(obj);
  expectedKeys.forEach((key) => {
    expect(actualKeys).toContain(key);
    expect(obj[key]).toBeDefined();
  });
}
/**
 * Assert user matches expected properties
 */
export function expectUser(user, expected) {
  Object.entries(expected).forEach(([key, value]) => {
    expect(user[key]).toBe(value);
  });
}
/**
 * Assert task matches expected properties
 */
export function expectTask(task, expected) {
  Object.entries(expected).forEach(([key, value]) => {
    expect(task[key]).toBe(value);
  });
}
/**
 * Wait for async operation with timeout
 */
export async function waitFor(fn, timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await fn()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
}
/**
 * Create mock request object
 */
export function createMockRequest(overrides) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    session: {},
    user: null,
    flash: vi.fn(),
    ...overrides,
  };
}
/**
 * Create mock response object
 */
export function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    render: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  };
  return res;
}
/**
 * Create mock next function
 */
export function createMockNext() {
  return vi.fn();
}
