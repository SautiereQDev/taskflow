/**
 * Test Helpers
 * Common utilities for testing
 */

import { expect } from 'vitest';
import type { User, Task } from '@prisma/client';

/**
 * Assert that a date is recent (within last N seconds)
 */
export function expectRecentDate(date: Date | null, withinSeconds = 5): void {
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
export function expectObjectShape<T extends object>(
  obj: T,
  expectedKeys: Array<keyof T>
): void {
  const actualKeys = Object.keys(obj);
  expectedKeys.forEach((key) => {
    expect(actualKeys).toContain(key);
    expect(obj[key]).toBeDefined();
  });
}

/**
 * Assert user matches expected properties
 */
export function expectUser(user: User, expected: Partial<User>): void {
  Object.entries(expected).forEach(([key, value]) => {
    expect(user[key as keyof User]).toBe(value);
  });
}

/**
 * Assert task matches expected properties
 */
export function expectTask(task: Task, expected: Partial<Task>): void {
  Object.entries(expected).forEach(([key, value]) => {
    expect(task[key as keyof Task]).toBe(value);
  });
}

/**
 * Wait for async operation with timeout
 */
export async function waitFor(
  fn: () => boolean | Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100
): Promise<void> {
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
export function createMockRequest(overrides?: Record<string, unknown>): unknown {
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
export function createMockResponse(): {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  render: ReturnType<typeof vi.fn>;
  redirect: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
} {
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
export function createMockNext(): ReturnType<typeof vi.fn> {
  return vi.fn();
}
