/**
 * AuthenticationService Unit Tests
 *
 * Tests authentication business logic with mocked dependencies.
 * Mocks: IUserRepository, IPasswordHasher
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationService } from '@application/services/AuthenticationService.js';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import { AppError } from '@utils/AppError.js';
describe('AuthenticationService', () => {
  let service;
  let mockUserRepository;
  let mockPasswordHasher;
  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByRole: vi.fn(),
      findActive: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByEmail: vi.fn(),
      existsById: vi.fn(),
      count: vi.fn(),
    };
    mockPasswordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };
    service = new AuthenticationService(mockUserRepository, mockPasswordHasher);
  });
  describe('login()', () => {
    it('should authenticate user with correct credentials', async () => {
      const email = 'user@example.com';
      const password = 'ValidPassword123';
      const hashedPassword = '$2a$12$hashedpassword';
      const user = User.create({
        id: 'user-1',
        name: 'Test User',
        email: Email.create(email),
        password: Password.fromHash(hashedPassword),
        role: UserRole.USER,
      });
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.verify.mockResolvedValue(true);
      const result = await service.login(email, password);
      expect(result).toBeDefined();
      expect(result.user).toBe(user);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(password, hashedPassword);
    });
    it('should throw AppError for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(service.login('nonexistent@example.com', 'password123')).rejects.toThrow(
        AppError
      );
      await expect(service.login('nonexistent@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });
    it('should throw AppError with 401 status for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      try {
        await service.login('nonexistent@example.com', 'password123');
        expect.fail('Should have thrown AppError');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
      }
    });
    it('should throw AppError for inactive user', async () => {
      const email = 'inactive@example.com';
      const hashedPassword = '$2a$12$hashedpassword';
      const inactiveUser = User.create({
        id: 'user-2',
        name: 'Inactive User',
        email: Email.create(email),
        password: Password.fromHash(hashedPassword),
        role: UserRole.USER,
      });
      inactiveUser.deactivate();
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);
      await expect(service.login(email, 'password123')).rejects.toThrow('Account is deactivated');
    });
  });
});
