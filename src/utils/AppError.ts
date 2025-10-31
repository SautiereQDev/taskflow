/**
 * Application Error Class
 *
 * Custom error class for handling application-specific errors with HTTP status codes.
 * Used throughout the application for consistent error handling.
 *
 * @example
 * ```typescript
 * throw new AppError('User not found', 404, { userId: '123' });
 * throw new AppError('Validation failed', 400, { field: 'email' });
 * ```
 */
export class AppError extends Error {
  /**
   * HTTP status code for the error response
   */
  public readonly statusCode: number;

  /**
   * Additional context/metadata about the error
   */
  public readonly context?: Record<string, unknown>;

  /**
   * Whether the error is operational (expected) vs programming error
   */
  public readonly isOperational: boolean;

  /**
   * Create a new AppError instance
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param context - Additional error context/metadata
   * @param isOperational - Whether error is operational (default: true)
   */
  constructor(
    message: string,
    statusCode = 500,
    context?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message);

    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = isOperational;

    // Capture stack trace (excluding constructor call from it)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to plain object for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      isOperational: this.isOperational,
      stack: this.stack,
    };
  }
}
