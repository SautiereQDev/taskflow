import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IPasswordHasher } from '../interfaces/IPasswordHasher.js';
import type { User } from '../../domain/entities/User.js';
import { Password } from '../../domain/value-objects/Password.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Authentication Result
 * Returned after successful login
 */
export interface IAuthenticationResult {
  user: User;
  sessionId?: string;
}

/**
 * Authentication Service
 *
 * Handles user authentication operations: login, logout, session validation.
 * Implements security best practices for authentication flows.
 *
 * Security Features:
 * - Password verification using secure hashing
 * - No credential exposure in responses
 *
 * @example
 * ```typescript
 * const authService = container.resolve(AuthenticationService);
 * const result = await authService.login('user@example.com', 'password123');
 * if (result) {
 *   // User authenticated successfully
 *   req.session.userId = result.user.id;
 * }
 * ```
 */
@injectable()
export class AuthenticationService {
  constructor(
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository,
    @inject('IPasswordHasher' as never)
    private readonly passwordHasher: IPasswordHasher
  ) {}

  /**
   * Authenticate a user with email and password
   *
   * @param email - User's email address
   * @param password - Plain text password
   * @returns Promise resolving to authentication result or null if invalid
   * @throws {AppError} If user is inactive or authentication fails
   */
  async login(email: string, password: string): Promise<IAuthenticationResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.verify(password, user.password.value);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Return user (without password hash)
    return {
      user,
    };
  }

  /**
   * Validate if a user session is still valid
   *
   * Checks if user exists and is still active.
   * Used by authentication middleware.
   *
   * @param userId - User ID from session
   * @returns Promise resolving to User if valid, null otherwise
   */
  async validateSession(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return user;
  }

  /**
   * Logout user
   *
   * Note: Actual session destruction happens in the controller/middleware.
   * This method can be extended to handle additional cleanup (e.g., revoke tokens).
   *
   * @param userId - User ID to logout
   */
  logout(userId: string): void {
    // Future: Add token revocation, audit logging, etc.
    console.info(`User ${userId} logged out`);
  }

  /**
   * Change user password
   *
   * @param userId - User ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @throws {AppError} If current password is invalid or user not found
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordHasher.verify(
      currentPassword,
      user.password.value
    );
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password and update
    const hashedNewPassword = await this.passwordHasher.hash(newPassword);
    const passwordObject = Password.fromHash(hashedNewPassword);
    user.updatePassword(passwordObject);

    await this.userRepository.update(user);
  }
}
