import crypto from 'node:crypto';

/**
 * Email Value Object
 *
 * Ensures email addresses are valid and normalized.
 * Immutable once created.
 *
 * @example
 * ```typescript
 * const email = Email.create('user@example.com');
 * console.log(email.value); // 'user@example.com'
 * ```
 */
export class Email {
  private constructor(private readonly _value: string) {}

  /**
   * Create an Email instance from a string
   *
   * @param email - Email address to validate
   * @returns Email instance
   * @throws Error if email is invalid
   */
  static create(email: string): Email {
    if (!email) {
      throw new Error('Email cannot be empty');
    }

    const normalized = email.trim().toLowerCase();

    if (!this.isValid(normalized)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    return new Email(normalized);
  }

  /**
   * Validate email format
   *
   * Uses a comprehensive regex that covers most valid email formats
   */
  private static isValid(email: string): boolean {
    // RFC 5322 Official Standard (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Additional checks
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check length constraints
    if (email.length > 254) {
      return false; // RFC 5321 max length
    }

    // Check local part (before @) length
    const [localPart, domain] = email.split('@');
    if (localPart.length > 64) {
      return false; // RFC 5321 max local part length
    }

    // Check domain part
    if (domain.length > 255) {
      return false;
    }

    return true;
  }

  /**
   * Get the email value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Compare with another Email instance
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * String representation
   */
  toString(): string {
    return this._value;
  }

  /**
   * Get hash for this email (useful for password reset tokens, etc.)
   */
  getHash(): string {
    return crypto.createHash('sha256').update(this._value).digest('hex');
  }
}
