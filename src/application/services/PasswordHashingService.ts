import bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';
import type { IPasswordHasher } from '../interfaces/IPasswordHasher.js';

/**
 * Password Hashing Service
 *
 * Implements secure password hashing using bcrypt algorithm.
 *
 * Security Features:
 * - 12 salt rounds (2^12 iterations)
 * - Resistant to rainbow table attacks
 * - Adaptive cost factor (can be increased over time)
 * - Industry-standard algorithm
 *
 * @example
 * ```typescript
 * const hasher = container.resolve(PasswordHashingService);
 * const hash = await hasher.hash('userPassword123');
 * const isValid = await hasher.verify('userPassword123', hash); // true
 * ```
 */
@injectable()
export class PasswordHashingService implements IPasswordHasher {
  /**
   * Salt rounds for bcrypt hashing
   * 12 rounds = 2^12 iterations (recommended for 2024+)
   * Higher values = more secure but slower
   */
  private readonly SALT_ROUNDS = 12;

  /**
   * Hash a plain text password using bcrypt
   *
   * @param plainPassword - The password to hash
   * @returns Promise resolving to bcrypt hash string
   * @throws {Error} If password is empty or hashing fails
   */
  async hash(plainPassword: string): Promise<string> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    try {
      return await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    } catch (error) {
      throw new Error(
        `Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify a plain text password against a bcrypt hash
   *
   * Uses constant-time comparison to prevent timing attacks.
   *
   * @param plainPassword - The password to verify
   * @param hashedPassword - The bcrypt hash to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      // Log error but don't expose internals
      console.error('Password verification failed:', error);
      return false;
    }
  }
}
