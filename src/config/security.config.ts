/**
 * Security Configuration
 *
 * Comprehensive security settings following OWASP best practices
 *
 * @module config/security
 */

import { type HelmetOptions } from 'helmet';
import { type RateLimitRequestHandler, rateLimit } from 'express-rate-limit';

/**
 * Helmet Security Headers Configuration
 *
 * Implements defense-in-depth approach with multiple security layers:
 * - Content Security Policy (CSP) - Prevent XSS attacks
 * - HSTS - Force HTTPS connections
 * - Frame options - Prevent clickjacking
 * - Content type sniffing protection
 * - XSS filter protection
 *
 * @see https://helmetjs.github.io/
 */
export const helmetConfig: HelmetOptions = {
  // Content Security Policy - Define trusted sources
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for HTMX, Alpine.js (TODO: migrate to nonce)
        'https://unpkg.com', // CDN for HTMX, Alpine.js
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline styles (TODO: migrate to nonce)
      ],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // HTTP Strict Transport Security - Force HTTPS
  // Only enable in production with valid SSL certificate
  hsts:
    process.env.NODE_ENV === 'production'
      ? {
          maxAge: 31536000, // 1 year in seconds
          includeSubDomains: true,
          preload: true,
        }
      : false,

  // Frame options - Prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Disable X-Powered-By header
  hidePoweredBy: true,

  // Content type sniffing protection
  noSniff: true,

  // XSS filter (legacy but adds defense-in-depth)
  xssFilter: true,

  // Referrer policy - Control referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // DNS prefetch control
  dnsPrefetchControl: {
    allow: false,
  },
};

/**
 * Rate Limiting Configuration
 *
 * Protects against brute force attacks and DDoS
 * Different limits for different endpoint types
 */

/**
 * Global rate limiter - Apply to all requests
 * 100 requests per 15 minutes per IP
 */
export const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

/**
 * Authentication rate limiter - Stricter limits
 * Protects against brute force login attempts
 * 5 attempts per 15 minutes per IP
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful requests (only count failures)
  skipSuccessfulRequests: true,
});

/**
 * API rate limiter - Moderate limits for API endpoints
 * 50 requests per 15 minutes per IP
 */
export const apiRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    error: 'API rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter - Very strict
 * 3 attempts per hour per IP
 */
export const passwordResetRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per window
  message: {
    error: 'Too many password reset attempts. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CSRF Token Configuration
 *
 * Cross-Site Request Forgery protection
 *
 * Note: express-session with sameSite: 'strict' provides good CSRF protection
 * For additional protection, we could use csurf middleware
 */
export const csrfConfig = {
  // Session-based CSRF protection via sameSite cookies
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

/**
 * Input Validation Configuration
 *
 * express-validator settings for XSS prevention
 */
export const validationConfig = {
  // Sanitization options
  sanitize: {
    trim: true,
    escape: true, // Escape HTML entities to prevent XSS
    stripLow: true, // Remove ASCII control characters
  },

  // Max lengths to prevent DoS via large inputs
  maxLengths: {
    email: 255,
    password: 128,
    name: 100,
    title: 200,
    description: 2000,
    url: 2048,
  },
};

/**
 * Environment Variables Validation Schema
 *
 * Ensures all required security-critical env vars are set
 */
export const requiredEnvVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'SESSION_SECRET'] as const;

/**
 * Validate that all required environment variables are present
 *
 * @throws {Error} If any required env var is missing
 */
export function validateEnvVars(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate SESSION_SECRET strength
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.length < 32) {
    console.warn(
      '⚠️  WARNING: SESSION_SECRET is too short (< 32 characters).\n' +
        '   For production, use a strong random secret of at least 32 characters.'
    );
  }

  // Warn if running in production without HTTPS
  if (process.env.NODE_ENV === 'production' && process.env.HTTPS !== 'true') {
    console.warn(
      '⚠️  WARNING: Running in production without HTTPS.\n' +
        '   Set HTTPS=true in your environment or configure a reverse proxy with SSL.'
    );
  }
}

/**
 * Security Best Practices Checklist
 *
 * - [x] Helmet configured with CSP, HSTS, frame protection
 * - [x] Rate limiting for all endpoints
 * - [x] Stricter rate limiting for authentication
 * - [x] CSRF protection via sameSite cookies
 * - [x] Input validation and sanitization
 * - [x] Environment variables validation
 * - [x] Secure session configuration
 * - [x] Password hashing with bcrypt (>= 12 rounds)
 * - [x] SQL injection prevention (Prisma parameterized queries)
 * - [x] XSS prevention (CSP + validation + EJS auto-escaping)
 * - [ ] Regular dependency audits (npm audit)
 * - [ ] Security headers testing (securityheaders.com)
 * - [ ] Penetration testing
 * - [ ] Security logging and monitoring
 */
