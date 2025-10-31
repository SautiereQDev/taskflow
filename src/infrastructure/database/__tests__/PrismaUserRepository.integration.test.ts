import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaService } from '../prisma/PrismaService.js';
import { PrismaUserRepository } from '../prisma/PrismaUserRepository.js';
import { User } from '../../../domain/entities/User.js';
import { Email } from '../../../domain/value-objects/Email.js';
import { Password } from '../../../domain/value-objects/Password.js';
import { UserRole } from '../../../domain/value-objects/UserRole.js';

/**
 * Integration Tests for PrismaUserRepository
 *
 * Tests actual database interactions with PostgreSQL.
 * Requires running database (Docker container).
 */
describe('PrismaUserRepository Integration Tests', () => {
  let prismaService: PrismaService;
  let repository: PrismaUserRepository;

  beforeAll(async () => {
    prismaService = new PrismaService();
    repository = new PrismaUserRepository(prismaService);

    // Ensure database connection
    await prismaService.ping();
  });

  afterAll(async () => {
    // Cleanup and disconnect
    await prismaService.client.user.deleteMany({
      where: {
        email: {
          contains: 'test-integration',
        },
      },
    });
    await prismaService.disconnect();
  });

  beforeEach(async () => {
    // Clean test data before each test
    await prismaService.client.user.deleteMany({
      where: {
        email: {
          contains: 'test-integration',
        },
      },
    });
  });

  describe('create()', () => {
    it('should create a new user in database', async () => {
      // Arrange
      const email = Email.create('test-integration-1@example.com');
      const password = await Password.create('SecurePass123!');
      const user = User.create({
        name: 'Test User 1',
        email,
        password,
        role: UserRole.MEMBER,
      });

      // Act
      const createdUser = await repository.create(user);

      // Assert
      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBe(user.id);
      expect(createdUser.name).toBe('Test User 1');
      expect(createdUser.email.value).toBe('test-integration-1@example.com');
      expect(createdUser.role).toBe(UserRole.MEMBER);
      expect(createdUser.isActive).toBe(true);
    });

    it('should throw error on duplicate email', async () => {
      // Arrange
      const email = Email.create('test-integration-duplicate@example.com');
      const password = await Password.create('SecurePass123!');
      const user1 = User.create({
        name: 'User 1',
        email,
        password,
        role: UserRole.MEMBER,
      });

      await repository.create(user1);

      const user2 = User.create({
        name: 'User 2',
        email,
        password,
        role: UserRole.MEMBER,
      });

      // Act & Assert
      await expect(repository.create(user2)).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    it('should find user by ID', async () => {
      // Arrange
      const email = Email.create('test-integration-findbyid@example.com');
      const password = await Password.create('SecurePass123!');
      const user = User.create({
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
      const email = Email.create('test-integration-findbyemail@example.com');
      const password = await Password.create('SecurePass123!');
      const user = User.create({
        name: 'Find By Email User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      await repository.create(user);

      // Act
      const found = await repository.findByEmail('test-integration-findbyemail@example.com');

      // Assert
      expect(found).toBeDefined();
      expect(found?.email.value).toBe('test-integration-findbyemail@example.com');
      expect(found?.name).toBe('Find By Email User');
    });

    it('should return null for non-existent email', async () => {
      // Act
      const found = await repository.findByEmail('nonexistent@example.com');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update user properties', async () => {
      // Arrange
      const email = Email.create('test-integration-update@example.com');
      const password = await Password.create('SecurePass123!');
      let user = User.create({
        name: 'Original Name',
        email,
        password,
        role: UserRole.MEMBER,
      });
      user = await repository.create(user);

      // Act
      user.updateProfile({ name: 'Updated Name' });
      const updated = await repository.update(user);

      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(user.id);
    });

    it('should deactivate user', async () => {
      // Arrange
      const email = Email.create('test-integration-deactivate@example.com');
      const password = await Password.create('SecurePass123!');
      let user = User.create({
        name: 'Active User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      user = await repository.create(user);

      // Act
      user.deactivate();
      const updated = await repository.update(user);

      // Assert
      expect(updated.isActive).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delete user from database', async () => {
      // Arrange
      const email = Email.create('test-integration-delete@example.com');
      const password = await Password.create('SecurePass123!');
      const user = User.create({
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
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      // Arrange
      const users = [
        User.create({
          name: 'User 1',
          email: Email.create('test-integration-all-1@example.com'),
          password: await Password.create('SecurePass123!'),
          role: UserRole.MEMBER,
        }),
        User.create({
          name: 'User 2',
          email: Email.create('test-integration-all-2@example.com'),
          password: await Password.create('SecurePass123!'),
          role: UserRole.MANAGER,
        }),
      ];

      for (const user of users) {
        await repository.create(user);
      }

      // Act
      const allUsers = await repository.findAll();

      // Assert
      expect(allUsers.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by role', async () => {
      // Arrange
      await repository.create(
        User.create({
          name: 'Admin User',
          email: Email.create('test-integration-admin@example.com'),
          password: await Password.create('SecurePass123!'),
          role: UserRole.ADMIN,
        })
      );

      // Act
      const adminUsers = await repository.findByRole(UserRole.ADMIN);

      // Assert
      expect(adminUsers.length).toBeGreaterThanOrEqual(1);
      expect(adminUsers.every((u) => u.role === UserRole.ADMIN)).toBe(true);
    });
  });

  describe('existsByEmail()', () => {
    it('should return true for existing email', async () => {
      // Arrange
      const email = Email.create('test-integration-exists@example.com');
      const password = await Password.create('SecurePass123!');
      const user = User.create({
        name: 'Exists User',
        email,
        password,
        role: UserRole.MEMBER,
      });
      await repository.create(user);

      // Act
      const exists = await repository.existsByEmail('test-integration-exists@example.com');

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

  describe('count()', () => {
    it('should count users with filters', async () => {
      // Arrange
      await repository.create(
        User.create({
          name: 'Manager 1',
          email: Email.create('test-integration-count-1@example.com'),
          password: await Password.create('SecurePass123!'),
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
