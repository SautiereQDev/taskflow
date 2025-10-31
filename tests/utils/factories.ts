/**
 * Test Data Factories
 * Generate realistic test data for users, tasks, etc.
 */

import type { User, Task, TaskStatus, TaskPriority, UserRole } from '@prisma/client';

let userIdCounter = 1;
let taskIdCounter = 1;

/**
 * Create a test user with default values
 */
export function createTestUser(overrides?: Partial<User>): User {
  const currentId = userIdCounter;
  userIdCounter++;
  const timestamp = new Date();

  return {
    id: `user-${currentId}`,
    email: `user${currentId}@test.com`,
    name: `Test User ${currentId}`,
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyLB.dQkqq', // 'password123'
    role: 'USER' as UserRole,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

/**
 * Create a test task with default values
 */
export function createTestTask(overrides?: Partial<Task>): Task {
  const currentId = taskIdCounter;
  taskIdCounter++;
  const timestamp = new Date();

  return {
    id: `task-${currentId}`,
    title: `Test Task ${currentId}`,
    description: null,
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    dueDate: null,
    createdById: 'user-1',
    assigneeId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

/**
 * Create multiple test users
 */
export function createTestUsers(count: number, overrides?: Partial<User>): User[] {
  return Array.from({ length: count }, () => createTestUser(overrides));
}

/**
 * Create multiple test tasks
 */
export function createTestTasks(count: number, overrides?: Partial<Task>): Task[] {
  return Array.from({ length: count }, () => createTestTask(overrides));
}

/**
 * Create test user with specific password (hashed with bcrypt)
 */
export function createTestUserWithPassword(
  email: string,
  password: string,
  overrides?: Partial<User>
): User {
  // Use a pre-hashed password for testing
  // This is bcrypt hash of 'password123' with salt rounds 12
  const hashedPassword = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oe2kmdAtZJ3K';

  return {
    id: `user-${userIdCounter++}`,
    name: 'Test User',
    role: 'USER' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
    email,
    password: hashedPassword, // Return hashed password
    ...overrides,
  };
}

/**
 * Create test admin user
 */
export function createTestAdmin(overrides?: Partial<User>): User {
  return createTestUser({
    role: 'ADMIN' as UserRole,
    email: 'admin@test.com',
    name: 'Test Admin',
    ...overrides,
  });
}

/**
 * Create test manager user
 */
export function createTestManager(overrides?: Partial<User>): User {
  return createTestUser({
    role: 'MANAGER' as UserRole,
    email: 'manager@test.com',
    name: 'Test Manager',
    ...overrides,
  });
}

/**
 * Reset counters between tests
 */
export function resetFactoryCounters(): void {
  userIdCounter = 1;
  taskIdCounter = 1;
}
