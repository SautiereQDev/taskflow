/**
 * CSP Nonce Middleware
 *
 * Generates cryptographically secure nonces for Content Security Policy
 * to allow inline scripts and styles without 'unsafe-inline' directive.
 *
 * @module middleware/csp-nonce
 */

import { randomBytes } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Generate CSP Nonce Middleware
 *
 * Creates a unique, cryptographically secure nonce for each HTTP request.
 * The nonce is attached to res.locals for use in EJS templates and
 * the CSP header configuration.
 *
 * Requirements:
 * - Nonce must be unique per request (prevent replay attacks)
 * - Minimum 128 bits of entropy (32 hex chars or 24 base64 chars)
 * - Use cryptographically secure random generator
 *
 * Usage in EJS templates:
 * ```html
 * <script nonce="<%= cspNonce %>">
 *   // Your inline script here
 * </script>
 * ```
 *
 * @see https://content-security-policy.com/nonce/
 */
export function generateCspNonce(req: Request, res: Response, next: NextFunction): void {
  // Generate 128-bit (16 bytes) cryptographically secure random nonce
  // Using base64url encoding (URL-safe, no padding)
  const nonce = randomBytes(16).toString('base64url');

  // Attach nonce to response locals for EJS templates
  res.locals.cspNonce = nonce;

  // Also attach to response object for helmet CSP configuration
  // @ts-expect-error - Adding custom property to Response
  res.cspNonce = nonce;

  next();
}
