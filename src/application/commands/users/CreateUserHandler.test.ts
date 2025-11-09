/**
 * CreateUserHandler Unit Tests
 *
 * Tests for the CreateUserHandler command handler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateUserHandler } from './CreateUserHandler.js';
import { CreateUserCommand } from './CreateUserCommand.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { PasswordHashingService } from '../../services/PasswordHashingService.js';
import { User, UserRole } from '../../../domain/entities/User.js';
import { Email } from '../../../domain/value-objects/Email.js';
import { Password } from '../../../domain/value-objects/Password.js';
import { AppError } from '../../../utils/AppError.js';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockUserRepository: IUserRepository;
  let mockPasswordHasher: PasswordHashingService;

  beforeEach(() => {
    // Mock UserRepository
    mockUserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Mock PasswordHashingService
    mockPasswordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    } as unknown as PasswordHashingService;

    handler = new CreateUserHandler(mockUserRepository, mockPasswordHasher);
  });

  describe('execute', () => {
    it('should create user with valid data', async () => {
      const command = new CreateUserCommand({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: UserRole.MANAGER,
      });

      const hashedPassword = '$2b$12$hashedpassword';
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue(hashedPassword);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      const expectedUser = User.create({
        id: 'user-123',
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: Password.fromHash(hashedPassword),
        role: UserRole.MANAGER,
      });

      vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email.value).toBe('john@example.com');
      expect(result.role).toBe(UserRole.MANAGER);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Password123');
      expect(mockUserRepository.create).toHaveBeenCalledOnce();
    });

    it('should reject duplicate email', async () => {
      const command = new CreateUserCommand({
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'Password123',
      });

      const existingUser = User.create({
        id: 'existing-user',
        name: 'Existing User',
        email: Email.create('existing@example.com'),
        password: Password.fromHash('$2b$12$hashed'),
        role: UserRole.MEMBER,
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      await expect(handler.execute(command)).rejects.toThrow(AppError);
      await expect(handler.execute(command)).rejects.toThrow('User with this email already exists');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should default to MEMBER role when role not specified', async () => {
      const command = new CreateUserCommand({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      });

      const hashedPassword = '$2b$12$hashedpassword';
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue(hashedPassword);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      const expectedUser = User.create({
        id: 'user-456',
        name: 'Jane Doe',
        email: Email.create('jane@example.com'),
        password: Password.fromHash(hashedPassword),
        role: UserRole.MEMBER,
      });

      vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

      const result = await handler.execute(command);

      expect(result.role).toBe(UserRole.MEMBER);
    });

    it('should hash password before creating user', async () => {
      const command = new CreateUserCommand({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Plaintext123',
      });

      const hashedPassword = '$2b$12$verysecurehash';
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue(hashedPassword);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      const capturedUser = vi.fn();
      vi.mocked(mockUserRepository.create).mockImplementation((user) => {
        capturedUser(user);
        return user;
      });

      await handler.execute(command);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Plaintext123');
      expect(mockPasswordHasher.hash).toHaveBeenCalledOnce();
      expect(capturedUser).toHaveBeenCalled();

      const createdUser = capturedUser.mock.calls[0][0];
      expect(createdUser.password.value).toBe(hashedPassword);
    });

    it('should generate unique ID for new user', async () => {
      const command = new CreateUserCommand({
        name: 'UUID User',
        email: 'uuid@example.com',
        password: 'Password123',
      });

      const hashedPassword = '$2b$12$hash';
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue(hashedPassword);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      let capturedUserId: string | undefined;
      vi.mocked(mockUserRepository.create).mockImplementation((user) => {
        capturedUserId = user.id;
        return user;
      });

      await handler.execute(command);

      expect(capturedUserId).toBeDefined();
      expect(typeof capturedUserId).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(capturedUserId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should propagate repository errors', async () => {
      const command = new CreateUserCommand({
        name: 'Error User',
        email: 'error@example.com',
        password: 'Password123',
      });

      const hashedPassword = '$2b$12$hash';
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue(hashedPassword);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(handler.execute(command)).rejects.toThrow('Database connection failed');
    });

    it('should call repository methods in correct order', async () => {
      const command = new CreateUserCommand({
        name: 'Order User',
        email: 'order@example.com',
        password: 'Password123',
      });

      const callOrder: string[] = [];

      const hashedPassword = '$2b$12$hash';
      vi.mocked(mockPasswordHasher.hash).mockImplementation(() => {
        callOrder.push('hash');
        return hashedPassword;
      });

      vi.mocked(mockUserRepository.findByEmail).mockImplementation(() => {
        callOrder.push('findByEmail');
        return null;
      });

      vi.mocked(mockUserRepository.create).mockImplementation((user) => {
        callOrder.push('create');
        return user;
      });

      await handler.execute(command);

      expect(callOrder).toEqual(['findByEmail', 'hash', 'create']);
    });
  });
});
