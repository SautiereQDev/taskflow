/**
 * User Entity Unit Tests
 * Validates user creation with factory pattern
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTestUser,
  createTestAdmin,
  createTestManager,
  createTestUserWithPassword,
  resetFactoryCounters,
} from '@tests/utils/factories.js';

describe('User Entity', () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  describe('Factory Creation', () => {
    it('should create user with default values', () => {
      const user = createTestUser();

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('user1@test.com');
      expect(user.name).toBe('Test User 1');
      expect(user.role).toBe('USER');
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(0);
    });

    it('should create user with sequential IDs', () => {
      const user1 = createTestUser();
      const user2 = createTestUser();
      const user3 = createTestUser();

      expect(user1.id).toBe('user-1');
      expect(user2.id).toBe('user-2');
      expect(user3.id).toBe('user-3');
    });

    it('should create user with custom email', () => {
      const user = createTestUser({ email: 'custom@example.com' });

      expect(user.email).toBe('custom@example.com');
      expect(user.role).toBe('USER'); // Other defaults preserved
    });

    it('should create user with custom name', () => {
      const user = createTestUser({ name: 'John Doe' });

      expect(user.name).toBe('John Doe');
      expect(user.role).toBe('USER'); // Other defaults preserved
    });

    it('should create user with custom role', () => {
      const user = createTestUser({ role: 'MANAGER' });

      expect(user.role).toBe('MANAGER');
    });

    it('should create user with multiple overrides', () => {
      const user = createTestUser({
        email: 'test@company.com',
        name: 'Test Manager',
        role: 'MANAGER',
      });

      expect(user.email).toBe('test@company.com');
      expect(user.name).toBe('Test Manager');
      expect(user.role).toBe('MANAGER');
    });
  });

  describe('Admin Factory', () => {
    it('should create admin user', () => {
      const admin = createTestAdmin();

      expect(admin.role).toBe('ADMIN');
      expect(admin.email).toContain('admin');
      expect(admin.name).toContain('Admin');
    });

    it('should create admin with overrides', () => {
      const admin = createTestAdmin({ email: 'superadmin@test.com' });

      expect(admin.role).toBe('ADMIN');
      expect(admin.email).toBe('superadmin@test.com');
    });
  });

  describe('Manager Factory', () => {
    it('should create manager user', () => {
      const manager = createTestManager();

      expect(manager.role).toBe('MANAGER');
      expect(manager.email).toContain('manager');
      expect(manager.name).toContain('Manager');
    });

    it('should create manager with overrides', () => {
      const manager = createTestManager({ name: 'Senior Manager' });

      expect(manager.role).toBe('MANAGER');
      expect(manager.name).toBe('Senior Manager');
    });
  });

  describe('Custom Password Factory', () => {
    it('should create user with specific credentials', () => {
      const user = createTestUserWithPassword('test@example.com', 'SecurePass123!');

      expect(user.email).toBe('test@example.com');
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(0);
    });

    it('should hash the password', () => {
      const plainPassword = 'MyPassword123';
      const user = createTestUserWithPassword('user@test.com', plainPassword);

      // Bcrypt hash starts with $2b$
      expect(user.password).toContain('$2b$');
      expect(user.password).not.toBe(plainPassword);
    });
  });

  describe('Factory Counter Reset', () => {
    it('should reset counter when called explicitly', () => {
      createTestUser();
      createTestUser();
      const user1 = createTestUser();
      expect(user1.id).toBe('user-3');

      resetFactoryCounters();

      const user2 = createTestUser();
      expect(user2.id).toBe('user-1');
    });

    it('should reset counter before each test', () => {
      // This test runs after the previous one
      // If beforeEach works correctly, ID should start at 1
      const user = createTestUser();
      expect(user.id).toBe('user-1');
    });
  });

  describe('User Role Validation', () => {
    it('should accept all valid user roles', () => {
      const roles = ['USER', 'MANAGER', 'ADMIN'] as const;

      roles.forEach((role) => {
        const user = createTestUser({ role });
        expect(user.role).toBe(role);
      });
    });
  });

  describe('User Timestamps', () => {
    it('should have createdAt timestamp', () => {
      const user = createTestUser();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', () => {
      const user = createTestUser();
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should have createdAt and updatedAt equal on creation', () => {
      const user = createTestUser();
      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });
  });

  describe('Email Format', () => {
    it('should generate valid email format', () => {
      const user = createTestUser();
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should accept custom email with valid format', () => {
      const email = 'valid.email+tag@example.co.uk';
      const user = createTestUser({ email });
      expect(user.email).toBe(email);
    });
  });
});
