/**
 * CSRF Protection Middleware
 *
 * Implements CSRF protection using csrf-csrf package with Double Submit Cookie pattern.
 * Provides token generation and validation for all unsafe HTTP methods.
 *
 * @module presentation/middleware/csrf
 */

import { doubleCsrf } from 'csrf-csrf';
import type { Request, Response, NextFunction } from 'express';
import { csrfConfig } from '@config/security.config.js';
import { logger } from '@utils/logger.util.js';

/**
 * Initialize Double CSRF Protection
 *
 * Uses HMAC-based Double Submit Cookie pattern for enhanced security:
 * 1. Server generates a random token and HMAC signature
 * 2. Token sent to client in cookie (httpOnly, secure, sameSite)
 * 3. Client includes token in requests (body, header, or query)
 * 4. Server verifies token matches cookie and validates HMAC
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */
const {
  invalidCsrfTokenError: _invalidCsrfTokenError,
  generateCsrfToken,
  validateRequest: _validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET ?? 'taskflow-secret-change-in-prod',
  getSessionIdentifier: (req) => req.sessionID || req.session?.id || 'anonymous',
  cookieName: csrfConfig.tokenConfig.cookieName,
  cookieOptions: csrfConfig.cookieOptions,
  size: csrfConfig.tokenConfig.size,
  ignoredMethods: csrfConfig.tokenConfig.ignoredMethods as ('GET' | 'HEAD' | 'OPTIONS')[],
  getCsrfTokenFromRequest: csrfConfig.tokenConfig.getTokenFromRequest,
});

/**
 * CSRF Token Generation Middleware
 *
 * Generates CSRF token and makes it available in res.locals for templates.
 * Token is automatically sent to client via httpOnly cookie.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 *
 * @example
 * ```ejs
 * <!-- In EJS templates -->
 * <input type="hidden" name="_csrf" value="<%= csrfToken %>">
 * ```
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = generateCsrfToken(req, res);
    res.locals.csrfToken = token;

    logger.debug('CSRF token generated', {
      method: req.method,
      path: req.path,
      hasToken: Boolean(token),
    });

    next();
  } catch (error) {
    // Don't fail the request if token generation fails
    // This ensures the app remains functional even if CSRF has issues
    logger.warn('CSRF token generation failed', {
      error: error instanceof Error ? error.message : String(error),
      method: req.method,
      path: req.path,
    });

    res.locals.csrfToken = ''; // Provide empty token as fallback
    next();
  }
}

/**
 * CSRF Token Validation Middleware
 *
 * Validates CSRF token for unsafe HTTP methods (POST, PUT, PATCH, DELETE).
 * Tokens can be provided in request body, headers, or query string.
 *
 * Safe methods (GET, HEAD, OPTIONS) are automatically ignored.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 *
 * @throws {403} CSRF token validation failed
 *
 * @example
 * ```javascript
 * // HTMX requests with CSRF token
 * htmx.config.headers = { 'X-CSRF-Token': csrfToken };
 * ```
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF validation for safe methods
  if (csrfConfig.tokenConfig.ignoredMethods.includes(req.method)) {
    return next();
  }

  // Validate CSRF token using double submit cookie pattern
  doubleCsrfProtection(req, res, (error) => {
    if (error) {
      logger.warn('CSRF validation failed', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        error: error instanceof Error ? error.message : String(error),
        context: {
          hasBodyToken: Boolean((req.body as Record<string, unknown>)?._csrf),
          hasHeaderToken: Boolean(req.headers['x-csrf-token']),
          hasQueryToken: Boolean((req.query as Record<string, unknown>)?._csrf),
        },
      });

      // HTMX-aware error response
      if (req.headers['hx-request'] === 'true') {
        res.setHeader(
          'HX-Trigger',
          JSON.stringify({
            showToast: {
              message: 'Security token expired. Please refresh the page.',
              type: 'error',
            },
          })
        );
        return res.status(403).json({
          error: 'CSRF validation failed',
          message: 'Invalid or missing security token. Please refresh the page and try again.',
        });
      }

      // Traditional form submission - render 403 page
      return res.status(403).render('pages/error/403', {
        title: 'Forbidden',
        error: {
          message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
          context:
            process.env.NODE_ENV === 'development'
              ? {
                  method: req.method,
                  path: req.path,
                  hasBodyToken: Boolean((req.body as Record<string, unknown>)?._csrf),
                  hasHeaderToken: Boolean(req.headers['x-csrf-token']),
                  hasQueryToken: Boolean((req.query as Record<string, unknown>)?._csrf),
                }
              : undefined,
        },
      });
    }

    next();
  });
}

/**
 * Combined CSRF Middleware
 *
 * Combines token generation and validation in a single middleware.
 * Use this in Express app configuration for comprehensive CSRF protection.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 *
 * @example
 * ```typescript
 * // In express.config.ts
 * app.use(csrfMiddleware);
 * ```
 */
export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  csrfTokenMiddleware(req, res, (err) => {
    if (err) return next(err);
    csrfProtectionMiddleware(req, res, next);
  });
}
