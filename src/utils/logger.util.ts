/**
 * Simple Logger Utility
 *
 * Provides structured logging for the application.
 * In production, this would use Pino or Winston.
 */

/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private readonly minLevel: LogLevel;
  private readonly sensitiveKeys: Set<string>;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    this.minLevel = envLevel || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

    // Keys that contain sensitive information and should be masked in logs
    this.sensitiveKeys = new Set([
      'password',
      'secret',
      'token',
      'key',
      'auth',
      'session_secret',
      'jwt_secret',
      'database_url',
      'db_url',
      'api_key',
      'private_key',
      'access_token',
      'refresh_token',
      'smtp_pass',
      'redis_url',
    ]);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  /**
   * Sanitize context object by masking sensitive values
   */
  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return context;

    const sanitized = { ...context };

    for (const [key, value] of Object.entries(sanitized)) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive keywords
      if (
        this.sensitiveKeys.has(lowerKey) ||
        this.sensitiveKeys.has(lowerKey.replaceAll('_', '')) ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('token')
      ) {
        if (typeof value === 'string') {
          sanitized[key] = this.maskValue(value);
        } else if (value && typeof value === 'object') {
          // Handle nested objects (like DATABASE_URL parsing)
          sanitized[key] = '[OBJECT_MASKED]';
        }
      }
    }

    return sanitized;
  }

  private maskValue(value: string): string {
    if (value.length <= 8) return '[MASKED]';
    return (
      value.substring(0, 4) +
      '*'.repeat(Math.max(8, value.length - 8)) +
      value.substring(value.length - 4)
    );
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): string {
    const timestamp = new Date().toISOString();
    const sanitizedContext = this.sanitizeContext(context);
    const contextStr = sanitizedContext ? ` ${JSON.stringify(sanitizedContext)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }
  }
}

export const logger = new Logger();
