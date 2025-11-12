/**
 * PrismaUserRepository Integration Tests
 * Tests actual database operations with PostgreSQL test database
 */
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaUserRepository } from '@infrastructure/database/prisma/PrismaUserRepository.js';
import { PrismaService } from '@infrastructure/database/prisma/PrismaService.js';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import { disconnectTestDatabase } from '@tests/utils/test-db.js';
describe('PrismaUserRepository Integration Tests', () => {
  let prismaService;
  let repository;
  beforeAll(async () => {
    // Use test database
    prismaService = new PrismaService();
    repository = new PrismaUserRepository(prismaService);
    // Ensure database connection
    await prismaService.ping();
  });
  afterAll(async () => {
    // Cleanup only users created by these tests
    await prismaService.client.user.deleteMany({
      where: {
        email: {
          not: {
            in: ['task-creator@test.com', 'task-assignee@test.com'], // Preserve TaskRepository test users
          },
        },
      },
    });
    await disconnectTestDatabase();
    await prismaService.disconnect();
  });
  beforeEach(async () => {
    // Clean only users created by these tests (not TaskRepository users)
    await prismaService.client.user.deleteMany({
      where: {
        email: {
          not: {
            in: ['task-creator@test.com', 'task-assignee@test.com'],
          },
        },
      },
    });
  });
  describe('create()', () => {
    it('should create a new user in database', async () => {
      // Arrange
      const email = Email.create('test-create@example.com');
      const password = await Password.create('SecurePass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'Test User Create',
        email,
        password,
        role: UserRole.MEMBER,
      });
      // Act
      const createdUser = await repository.create(user);
      // Assert
      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBe(user.id);
      expect(createdUser.name).toBe('Test User Create');
      expect(createdUser.email.value).toBe('test-create@example.com');
      expect(createdUser.role).toBe(UserRole.MEMBER);
      expect(createdUser.createdAt).toBeInstanceOf(Date);
      expect(createdUser.updatedAt).toBeInstanceOf(Date);
    });
    it('should throw error on duplicate email', async () => {
      // Arrange
      const email = Email.create('duplicate@example.com');
      const password = await Password.create('SecurePass123!');
      const user1 = User.create({
        id: randomUUID(),
        name: 'User 1',
        email,
        password,
        role: UserRole.MEMBER,
      });
      await repository.create(user1);
      const user2 = User.create({
        id: randomUUID(),
        name: 'User 2',
        email,
        password,
        role: UserRole.MEMBER,
      });
      // Act & Assert
      await expect(repository.create(user2)).rejects.toThrow();
    });
    it('should create user with ADMIN role', async () => {
      // Arrange
      const email = Email.create('admin@example.com');
      const password = await Password.create('AdminPass123!');
      const admin = User.create({
        id: randomUUID(),
        name: 'Admin User',
        email,
        password,
        role: UserRole.ADMIN,
      });
      // Act
      const createdAdmin = await repository.create(admin);
      // Assert
      expect(createdAdmin.role).toBe(UserRole.ADMIN);
    });
  });
  describe('findById()', () => {
    it('should find user by ID', async () => {
      // Arrange
      const email = Email.create('findbyid@example.com');
      const password = await Password.create('FindPass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'Find By ID User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      const created = await repository.create(user);
      // Act
      const found = await repository.findById(created.id);
      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Find By ID User');
      expect(found?.email.value).toBe('findbyid@example.com');
    });
    it('should return null for non-existent ID', async () => {
      // Act
      const found = await repository.findById('non-existent-id');
      // Assert
      expect(found).toBeNull();
    });
  });
  describe('findByEmail()', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = Email.create('findbyemail@example.com');
      const password = await Password.create('EmailPass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'Find By Email User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      await repository.create(user);
      // Act
      const found = await repository.findByEmail('findbyemail@example.com');
      // Assert
      expect(found).toBeDefined();
      expect(found?.email.value).toBe('findbyemail@example.com');
      expect(found?.name).toBe('Find By Email User');
    });
    it('should return null for non-existent email', async () => {
      // Act
      const found = await repository.findByEmail('nonexistent@example.com');
      // Assert
      expect(found).toBeNull();
    });
    it('should be case-insensitive', async () => {
      // Arrange
      const email = Email.create('CaseSensitive@Example.com');
      const password = await Password.create('CasePass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'Case Test User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      await repository.create(user);
      // Act
      const found = await repository.findByEmail('casesensitive@example.com');
      // Assert
      expect(found).toBeDefined();
      expect(found?.email.value.toLowerCase()).toBe('casesensitive@example.com');
    });
  });
  describe('findByRole()', () => {
    it('should find users by role', async () => {
      // Arrange - Create users with different roles
      const password = await Password.create('RolePass123!');
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Manager 1',
          email: Email.create('manager1@example.com'),
          password,
          role: UserRole.MANAGER,
        })
      );
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Manager 2',
          email: Email.create('manager2@example.com'),
          password,
          role: UserRole.MANAGER,
        })
      );
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Regular User',
          email: Email.create('user@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      // Act
      const managers = await repository.findByRole(UserRole.MANAGER);
      // Assert
      expect(managers.length).toBe(2);
      expect(managers.every((u) => u.role === UserRole.MANAGER)).toBe(true);
    });
  });
  describe('findAll()', () => {
    it('should return all users', async () => {
      // Arrange
      const password = await Password.create('AllPass123!');
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'User 1',
          email: Email.create('user1@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'User 2',
          email: Email.create('user2@example.com'),
          password,
          role: UserRole.MANAGER,
        })
      );
      // Act
      const allUsers = await repository.findAll();
      // Assert
      expect(allUsers.length).toBeGreaterThanOrEqual(2);
    });
    it('should filter by role', async () => {
      // Arrange
      const password = await Password.create('FilterPass123!');
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Admin',
          email: Email.create('admin-filter@example.com'),
          password,
          role: UserRole.ADMIN,
        })
      );
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'User',
          email: Email.create('user-filter@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      // Act
      const adminUsers = await repository.findAll({ role: UserRole.ADMIN });
      // Assert
      expect(adminUsers.length).toBeGreaterThanOrEqual(1);
      expect(adminUsers.every((u) => u.role === UserRole.ADMIN)).toBe(true);
    });
    it('should search by name', async () => {
      // Arrange
      const password = await Password.create('SearchPass123!');
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'John Doe Search',
          email: Email.create('john-search@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Jane Smith',
          email: Email.create('jane@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      // Act
      const searchResults = await repository.findAll({ search: 'John' });
      // Assert
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(searchResults.find((u) => u.name.includes('John'))).toBeDefined();
    });
  });
  describe('update()', () => {
    it('should update user properties', async () => {
      // Arrange
      const email = Email.create('update@example.com');
      const password = await Password.create('UpdatePass123!');
      let user = User.create({
        id: randomUUID(),
        name: 'Original Name',
        email,
        password,
        role: UserRole.MEMBER,
      });
      user = await repository.create(user);
      // Act
      user.updateName('Updated Name');
      const updated = await repository.update(user);
      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(user.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(updated.createdAt.getTime());
    });
  });

  describe('delete()', () => {
    it('should delete user from database', async () => {
      // Arrange
      const email = Email.create('delete@example.com');
      const password = await Password.create('DeletePass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'User To Delete',
        email,
        password,
        role: UserRole.MEMBER,
      });
      const created = await repository.create(user);
      // Act
      await repository.delete(created.id);
      // Assert
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
    it('should not throw error when deleting non-existent user', async () => {
      // Act & Assert
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });
  describe('existsByEmail()', () => {
    it('should return true for existing email', async () => {
      // Arrange
      const email = Email.create('exists@example.com');
      const password = await Password.create('ExistsPass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'Exists User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      await repository.create(user);
      // Act
      const exists = await repository.existsByEmail('exists@example.com');
      // Assert
      expect(exists).toBe(true);
    });
    it('should return false for non-existent email', async () => {
      // Act
      const exists = await repository.existsByEmail('nonexistent@example.com');
      // Assert
      expect(exists).toBe(false);
    });
  });
  describe('existsById()', () => {
    it('should return true for existing user ID', async () => {
      // Arrange
      const email = Email.create('existsid@example.com');
      const password = await Password.create('ExistsIdPass123!');
      const user = User.create({
        id: randomUUID(),
        name: 'Exists By ID User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      const created = await repository.create(user);
      // Act
      const exists = await repository.existsById(created.id);
      // Assert
      expect(exists).toBe(true);
    });
    it('should return false for non-existent user ID', async () => {
      // Act
      const exists = await repository.existsById('non-existent-id');
      // Assert
      expect(exists).toBe(false);
    });
  });
  describe('count()', () => {
    it('should count all users', async () => {
      // Arrange
      const password = await Password.create('CountPass123!');
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Count User 1',
          email: Email.create('count1@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Count User 2',
          email: Email.create('count2@example.com'),
          password,
          role: UserRole.MEMBER,
        })
      );
      // Act
      const total = await repository.count();
      // Assert
      expect(total).toBeGreaterThanOrEqual(2);
    });
    it('should count users by role', async () => {
      // Arrange
      const password = await Password.create('CountRolePass123!');
      await repository.create(
        User.create({
          id: randomUUID(),
          name: 'Manager Count',
          email: Email.create('manager-count@example.com'),
          password,
          role: UserRole.MANAGER,
        })
      );
      // Act
      const managerCount = await repository.count({ role: UserRole.MANAGER });
      // Assert
      expect(managerCount).toBeGreaterThanOrEqual(1);
    });
  });
});
