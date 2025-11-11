/**
 * User Service
 *
 * Centralized business logic service for user operations.
 * Handles authentication, authorization, profile management,
 * and administrative user operations.
 *
 * @module application/services/UserService
 * @since 2.0.0
 */

import { inject, injectable } from 'tsyringe';
import { z } from 'zod';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import type { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { EventBus } from '@application/events/EventBus.js';
import { UserRegisteredEvent } from '@domain/events/UserEvents.js';
import { AppError } from '@utils/AppError.js';
import { logger } from '@utils/logger.util.js';

// ──────────────────────────────────────────────────────────────────────────────
// Input DTOs & Validation Schemas
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Schema for user registration input validation
 *
 * @constant
 */
export const RegisterUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.MEMBER),
  locale: z.enum(['en', 'fr']).optional().default('fr'),
});

/**
 * Input type for user registration
 *
 * @typedef {Object} RegisterUserInput
 */
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

/**
 * Schema for user login input validation
 *
 * @constant
 */
export const LoginUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

/**
 * Input type for user login
 *
 * @typedef {Object} LoginUserInput
 */
export type LoginUserInput = z.infer<typeof LoginUserSchema>;

/**
 * Schema for profile update input validation
 *
 * @constant
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  locale: z.enum(['en', 'fr']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .optional(),
});

/**
 * Input type for profile update
 *
 * @typedef {Object} UpdateProfileInput
 */
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Schema for admin user update input validation
 *
 * @constant
 */
export const AdminUpdateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  locale: z.enum(['en', 'fr']).optional(),
});

/**
 * Input type for admin user update
 *
 * @typedef {Object} AdminUpdateUserInput
 */
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>;

/**
 * User filters for querying users
 *
 * @interface IUserFilters
 */
export interface IUserFilters {
  /** Filter by user role */
  role?: UserRole;
  /** Search in name and email */
  search?: string;
  /** Page number for pagination (1-indexed) */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

/**
 * Paginated user result
 *
 * @interface IPaginatedUserResult
 */
export interface IPaginatedUserResult {
  /** Array of users */
  users: User[];
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of users matching filters */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// User Service Implementation
// ──────────────────────────────────────────────────────────────────────────────

/**
 * User Service
 *
 * Provides centralized business logic for all user-related operations.
 * Handles authentication, authorization, profile management, and admin operations.
 *
 * @class UserService
 * @injectable
 *
 * @example
 * ```typescript
 * const userService = container.resolve(UserService);
 * const user = await userService.register({
 *   email: 'john@example.com',
 *   password: 'SecurePass123',
 *   name: 'John Doe'
 * });
 * ```
 */
@injectable()
export class UserService {
  /**
   * Creates an instance of UserService
   *
   * @param {IUserRepository} userRepository - Repository for user persistence
   * @param {EventBus} eventBus - Event bus for publishing domain events
   */
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject(EventBus) private readonly eventBus: EventBus
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Registers a new user in the system
   *
   * Validates input data, checks email uniqueness, hashes password,
   * creates user entity, persists it, and publishes a UserRegisteredEvent.
   *
   * @async
   * @param {RegisterUserInput} input - User registration data
   * @returns {Promise<User>} The registered user entity
   *
   * @throws {z.ZodError} If input validation fails
   * @throws {AppError} If email already exists (409)
   *
   * @example
   * ```typescript
   * const user = await userService.register({
   *   email: 'jane@example.com',
   *   password: 'SecurePass123',
   *   name: 'Jane Smith',
   *   role: UserRole.MEMBER,
   *   locale: 'en'
   * });
   * ```
   */
  async register(input: RegisterUserInput): Promise<User> {
    // Validate input with Zod schema
    const validated = RegisterUserSchema.parse(input);

    logger.debug('Registering new user', {
      email: validated.email,
      name: validated.name,
      role: validated.role,
    });

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(validated.email);
    if (existingUser) {
      throw new AppError('Email already registered', 409, {
        email: validated.email,
      });
    }

    // Create value objects
    const email = Email.create(validated.email);
    const password = await Password.create(validated.password);

    // Create domain entity
    const user = User.create({
      email,
      password,
      name: validated.name,
      role: validated.role,
      locale: validated.locale,
    });

    // Persist to database
    const savedUser = await this.userRepository.create(user);

    // Publish domain event for side effects (welcome email, analytics, etc.)
    await this.eventBus.publish(
      new UserRegisteredEvent(savedUser.id, savedUser.email.value, savedUser.name, savedUser.role)
    );

    logger.info('User registered successfully', {
      userId: savedUser.id,
      email: savedUser.email.value,
      role: savedUser.role,
    });

    return savedUser;
  }

  /**
   * Authenticates a user with email and password
   *
   * Validates credentials, checks if user exists, and verifies password.
   * Does NOT create session/token - that's the controller's responsibility.
   *
   * @async
   * @param {LoginUserInput} input - User login credentials
   * @returns {Promise<User>} The authenticated user entity
   *
   * @throws {z.ZodError} If input validation fails
   * @throws {AppError} If credentials are invalid (401)
   *
   * @example
   * ```typescript
   * const user = await userService.login({
   *   email: 'jane@example.com',
   *   password: 'SecurePass123'
   * });
   * // Controller handles session creation
   * req.session.userId = user.id;
   * ```
   */
  async login(input: LoginUserInput): Promise<User> {
    // Validate input
    const validated = LoginUserSchema.parse(input);

    logger.debug('User login attempt', { email: validated.email });

    // Find user by email
    const user = await this.userRepository.findByEmail(validated.email);
    if (!user) {
      // Generic error to prevent email enumeration
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await user.password.compare(validated.password);
    if (!isValidPassword) {
      logger.warn('Failed login attempt', {
        email: validated.email,
        userId: user.id,
      });
      throw new AppError('Invalid email or password', 401);
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email.value,
    });

    return user;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // READ Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves a single user by their unique identifier
   *
   * @async
   * @param {string} userId - Unique user identifier
   * @returns {Promise<User | null>} The user entity or null if not found
   *
   * @example
   * ```typescript
   * const user = await userService.findById('user-123');
   * if (!user) {
   *   throw new Error('User not found');
   * }
   * ```
   */
  async findById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);

    if (user) {
      logger.debug('User found', { userId, email: user.email.value });
    } else {
      logger.debug('User not found', { userId });
    }

    return user;
  }

  /**
   * Retrieves a single user by their email address
   *
   * @async
   * @param {string} email - User email address
   * @returns {Promise<User | null>} The user entity or null if not found
   *
   * @example
   * ```typescript
   * const user = await userService.findByEmail('jane@example.com');
   * ```
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email.toLowerCase().trim());
  }

  /**
   * Retrieves all users with optional filters and pagination
   *
   * @async
   * @param {IUserFilters} [filters={}] - Optional filter criteria including pagination
   * @returns {Promise<User[] | IPaginatedUserResult>} Array of users or paginated result
   *
   * @example
   * ```typescript
   * // Get all admin users
   * const admins = await userService.findAll({ role: UserRole.ADMIN });
   *
   * // Search users with pagination
   * const results = await userService.findAll({ search: 'john', page: 1, limit: 10 });
   * ```
   */
  async findAll(filters: IUserFilters = {}): Promise<User[] | IPaginatedUserResult> {
    const { page, limit, ...otherFilters } = filters;

    // If pagination is requested
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.userRepository.findAll({ ...otherFilters, skip, take: limit }),
        this.userRepository.count(otherFilters),
      ]);

      return {
        users,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Non-paginated query
    return await this.userRepository.findAll(otherFilters);
  }

  /**
   * Retrieves all users with a specific role
   *
   * @async
   * @param {UserRole} role - User role to filter by
   * @returns {Promise<User[]>} Array of users with the specified role
   *
   * @example
   * ```typescript
   * const managers = await userService.findByRole(UserRole.MANAGER);
   * ```
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.findByRole(role);
  }

  /**
   * Counts total users with optional filters
   *
   * @async
   * @param {IUserFilters} [filters={}] - Optional filter criteria
   * @returns {Promise<number>} Total number of users matching filters
   *
   * @example
   * ```typescript
   * const totalAdmins = await userService.count({ role: UserRole.ADMIN });
   * ```
   */
  async count(filters: IUserFilters = {}): Promise<number> {
    return await this.userRepository.count(filters);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE Operations (Profile Management)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Updates a user's profile information
   *
   * Allows users to update their name, locale, and password.
   * Password change requires current password verification.
   *
   * @async
   * @param {string} userId - Unique user identifier
   * @param {UpdateProfileInput} input - Profile update data
   * @returns {Promise<User>} The updated user entity
   *
   * @throws {z.ZodError} If input validation fails
   * @throws {AppError} If user not found (404)
   * @throws {AppError} If current password is invalid (401)
   * @throws {AppError} If password change requires current password (400)
   *
   * @example
   * ```typescript
   * const updated = await userService.updateProfile('user-123', {
   *   name: 'Jane Doe',
   *   locale: 'en',
   *   currentPassword: 'OldPass123',
   *   newPassword: 'NewSecurePass456'
   * });
   * ```
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    // Validate input
    const validated = UpdateProfileSchema.parse(input);

    // Find existing user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, { userId });
    }

    logger.debug('Updating user profile', { userId, updates: validated });

    // Handle password change
    if (validated.newPassword) {
      await this.changeUserPassword(user, validated.currentPassword, validated.newPassword);
    }

    // Apply profile updates
    if (validated.name !== undefined) {
      user.updateName(validated.name);
    }

    if (validated.locale !== undefined) {
      user.updateLocale(validated.locale);
    }

    // Persist changes
    const updatedUser = await this.userRepository.update(user);

    logger.info('User profile updated successfully', {
      userId: updatedUser.id,
      email: updatedUser.email.value,
    });

    return updatedUser;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADMIN Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Updates a user's information (admin operation)
   *
   * Allows admins to update any user's name, email, role, and locale.
   * More powerful than updateProfile - requires admin authorization.
   *
   * @async
   * @param {string} userId - Unique user identifier
   * @param {AdminUpdateUserInput} input - Admin update data
   * @returns {Promise<User>} The updated user entity
   *
   * @throws {z.ZodError} If input validation fails
   * @throws {AppError} If user not found (404)
   * @throws {AppError} If email already exists (409)
   *
   * @example
   * ```typescript
   * const updated = await userService.adminUpdateUser('user-123', {
   *   name: 'John Updated',
   *   role: UserRole.MANAGER,
   *   email: 'newemail@example.com'
   * });
   * ```
   */
  async adminUpdateUser(userId: string, input: AdminUpdateUserInput): Promise<User> {
    // Validate input
    const validated = AdminUpdateUserSchema.parse(input);

    // Find existing user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, { userId });
    }

    logger.debug('Admin updating user', { userId, updates: validated });

    // Check email uniqueness if changing email
    if (validated.email !== undefined && validated.email !== user.email.value) {
      const existingUser = await this.userRepository.findByEmail(validated.email);
      if (existingUser) {
        throw new AppError('Email already registered', 409, {
          email: validated.email,
        });
      }

      // Update email
      const newEmail = Email.create(validated.email);
      user.updateEmail(newEmail);
    }

    // Apply other updates
    if (validated.name !== undefined) {
      user.updateName(validated.name);
    }

    if (validated.role !== undefined) {
      user.updateRole(validated.role);
    }

    if (validated.locale !== undefined) {
      user.updateLocale(validated.locale);
    }

    // Persist changes
    const updatedUser = await this.userRepository.update(user);

    logger.info('User updated by admin', {
      userId: updatedUser.id,
      email: updatedUser.email.value,
      role: updatedUser.role,
    });

    return updatedUser;
  }

  /**
   * Deletes a user from the system (admin operation)
   *
   * Permanently removes a user. Use with caution.
   *
   * @async
   * @param {string} userId - Unique user identifier
   * @returns {Promise<void>}
   *
   * @throws {AppError} If user not found (404)
   *
   * @example
   * ```typescript
   * await userService.adminDeleteUser('user-123');
   * console.log('User deleted successfully');
   * ```
   */
  async adminDeleteUser(userId: string): Promise<void> {
    // Validate user exists before deletion
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, { userId });
    }

    logger.debug('Admin deleting user', { userId, email: user.email.value });

    await this.userRepository.delete(userId);

    logger.info('User deleted by admin', {
      userId,
      email: user.email.value,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AUTHORIZATION Helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Checks if a user has a specific role
   *
   * @async
   * @param {string} userId - Unique user identifier
   * @param {UserRole} requiredRole - Required role
   * @returns {Promise<boolean>} True if user has the role, false otherwise
   *
   * @example
   * ```typescript
   * const isAdmin = await userService.hasRole('user-123', UserRole.ADMIN);
   * if (!isAdmin) {
   *   throw new Error('Unauthorized');
   * }
   * ```
   */
  async hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user?.role === requiredRole;
  }

  /**
   * Checks if a user has any of the specified roles
   *
   * @async
   * @param {string} userId - Unique user identifier
   * @param {UserRole[]} allowedRoles - Array of allowed roles
   * @returns {Promise<boolean>} True if user has any of the roles, false otherwise
   *
   * @example
   * ```typescript
   * const canManage = await userService.hasAnyRole('user-123', [
   *   UserRole.ADMIN,
   *   UserRole.MANAGER
   * ]);
   * ```
   */
  async hasAnyRole(userId: string, allowedRoles: UserRole[]): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user ? allowedRoles.includes(user.role) : false;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helper Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Changes a user's password with verification
   *
   * @private
   * @async
   * @param {User} user - User entity
   * @param {string | undefined} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @throws {AppError} If current password not provided (400)
   * @throws {AppError} If current password is invalid (401)
   */
  private async changeUserPassword(
    user: User,
    currentPassword: string | undefined,
    newPassword: string
  ): Promise<void> {
    // Require current password for security
    if (!currentPassword) {
      throw new AppError('Current password is required to change password', 400);
    }

    // Verify current password
    const isValidPassword = await user.password.compare(currentPassword);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Create and set new password
    const newPasswordVO = await Password.create(newPassword);
    user.updatePassword(newPasswordVO);

    logger.info('User password changed', { userId: user.id });
  }
}
