import bcrypt from 'bcryptjs';

/**
 * Password Value Object
 *
 * Handles password hashing, validation, and comparison.
 * Never stores passwords in plain text.
 *
 * @example
 * ```typescript
 * // Hash a plain password
 * const password = await Password.create('mySecurePass123');
 *
 * // Compare with plain text
 * const isValid = await password.compare('mySecurePass123'); // true
 * ```
 */
export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  private static readonly SALT_ROUNDS = 12;

  private constructor(private readonly _hashedValue: string) {}

  /**
   * Create a Password instance from plain text
   * Automatically hashes the password
   *
   * @param plainPassword - Plain text password
   * @returns Password instance with hashed value
   * @throws Error if password doesn't meet requirements
   */
  static async create(plainPassword: string): Promise<Password> {
    this.validate(plainPassword);
    const hashed = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    return new Password(hashed);
  }

  /**
   * Create a Password instance from an already hashed value
   * Used when loading from database
   *
   * @param hashedValue - Already hashed password
   * @returns Password instance
   */
  static fromHash(hashedValue: string): Password {
    if (!hashedValue?.startsWith('$2')) {
      throw new Error('Invalid hashed password format');
    }
    return new Password(hashedValue);
  }

  /**
   * Validate password requirements
   *
   * @param plainPassword - Password to validate
   * @throws Error if password doesn't meet requirements
   */
  private static validate(plainPassword: string): void {
    if (!plainPassword) {
      throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < this.MIN_LENGTH) {
      throw new Error(`Password must be at least ${this.MIN_LENGTH} characters`);
    }

    if (plainPassword.length > this.MAX_LENGTH) {
      throw new Error(`Password must be at most ${this.MAX_LENGTH} characters`);
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one letter');
    }

    // Check for at least one number
    if (!/\d/.test(plainPassword)) {
      throw new Error('Password must contain at least one number');
    }

    // Optional: Check for special characters (uncomment if required)
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(plainPassword)) {
    //   throw new Error('Password must contain at least one special character');
    // }
  }

  /**
   * Compare plain text password with hashed password
   *
   * @param plainPassword - Plain text password to compare
   * @returns True if passwords match
   */
  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hashedValue);
  }

  /**
   * Get the hashed password value
   * Use this when storing in database
   */
  get value(): string {
    return this._hashedValue;
  }

  /**
   * Check if password needs rehashing
   * (e.g., if SALT_ROUNDS was increased)
   */
  needsRehash(): boolean {
    // Extract current rounds from hash
    const rounds = Number.parseInt(this._hashedValue.split('$')[2], 10);
    return rounds < Password.SALT_ROUNDS;
  }
}
