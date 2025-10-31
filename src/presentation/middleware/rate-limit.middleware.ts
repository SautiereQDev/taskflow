/**
 * Rate Limiting Middleware
 *
 * Protects routes from abuse using express-rate-limit.
 * Different limits for different route types.
 *
 * @module presentation/middleware/rate-limit.middleware
 */

import rateLimit from 'express-rate-limit';

/**
 * Check if running in test environment
 */
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

/**
 * Global rate limiter
 * Applies to all routes unless overridden
 *
 * Limit: 100 requests per 15 minutes per IP
 * Disabled in test environment
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: () => isTestEnvironment, // Skip rate limiting in tests
  handler: (req, res) => {
    if (req.isHtmx) {
      // HTMX request: send trigger event
      res.setHeader(
        'HX-Trigger',
        JSON.stringify({
          showError: 'Too many requests. Please slow down.',
        })
      );
      res.status(429).send('<div class="alert alert-error">Rate limit exceeded</div>');
    } else {
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later',
      });
    }
  },
});

/**
 * Strict rate limiter for authentication routes
 * Prevents brute force attacks
 *
 * Limit: 5 requests per 15 minutes per IP
 * Disabled in test environment
 *
 * @example
 * ```typescript
 * router.post('/auth/login', authLimiter, authController.login);
 * ```
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skip: () => isTestEnvironment, // Skip rate limiting in tests
  handler: (req, res) => {
    if (req.isHtmx) {
      res.setHeader(
        'HX-Trigger',
        JSON.stringify({
          showError: 'Too many login attempts. Please wait.',
        })
      );
      res.status(429).send('<div class="alert alert-error">Too many attempts</div>');
    } else {
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts, please try again later',
      });
    }
  },
});

/**
 * API rate limiter for data modification routes
 * Moderate protection for POST/PATCH/DELETE operations
 *
 * Limit: 50 requests per 15 minutes per IP
 * Disabled in test environment
 *
 * @example
 * ```typescript
 * router.post('/tasks', apiLimiter, requireAuth, taskController.create);
 * ```
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTestEnvironment || req.method === 'GET', // Skip in tests and for GET requests
  handler: (req, res) => {
    if (req.isHtmx) {
      res.setHeader(
        'HX-Trigger',
        JSON.stringify({
          showError: 'API rate limit exceeded.',
        })
      );
      res.status(429).send('<div class="alert alert-error">Too many requests</div>');
    } else {
      res.status(429).json({
        success: false,
        error: 'Too many API requests, please try again later',
      });
    }
  },
});
