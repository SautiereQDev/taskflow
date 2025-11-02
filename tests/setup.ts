/**
 * Vitest Test Setup
 * Runs before all test files
 * Sets up global test environment, mocks, and utilities
 */

import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import 'reflect-metadata'; // Required for TSyringe DI
import { resetFactoryCounters } from './utils/factories.js';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5435/taskflow_test?schema=public';
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only';

// Global test timeout
beforeAll(() => {
  console.info('🧪 Starting test suite...');
});

afterAll(() => {
  console.info('✅ Test suite complete');
});

// Reset factory counters before each test
beforeEach(() => {
  resetFactoryCounters();
});

// Clean up after each test
afterEach(() => {
  // Clear any mocks

  vi.clearAllMocks();
});

// Global vi is available via vitest/globals
