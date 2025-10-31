/**
 * Password Hasher Interface
 *
 * Defines contract for password hashing and verification.
 * Abstracts the hashing implementation (bcrypt, argon2, etc.)
 * to allow for easy testing and algorithm changes.
 *
 * @example
 * ```typescript
 * const hasher = container.resolve<IPasswordHasher>('IPasswordHasher');
 * const hash = await hasher.hash('myPassword123');
 * const isValid = await hasher.verify('myPassword123', hash);
 * ```
 */
export interface IPasswordHasher {
  /**
   * Hash a plain text password
   *
   * @param plainPassword - The password to hash
   * @returns Promise resolving to the hashed password
   * @throws {Error} If hashing fails
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Verify a plain text password against a hash
   *
   * @param plainPassword - The password to verify
   * @param hashedPassword - The hash to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
