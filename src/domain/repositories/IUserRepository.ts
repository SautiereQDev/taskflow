import type { User, UserRole } from '../entities/User.js';

/**
 * User Repository Interface (Port)
 *
 * Defines contract for user persistence operations
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users with optional filters
   */
  findAll(filters?: {
    role?: UserRole;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<User[]>;

  /**
   * Find users by role
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Save a new user
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Check if user exists by ID
   */
  existsById(id: string): Promise<boolean>;

  /**
   * Count users with optional filters
   */
  count(filters?: { role?: UserRole }): Promise<number>;
}
