#!/usr/bin/env node

/**
 * Script to generate secure random secrets for production environment
 * Usage: node scripts/generate-secrets.js
 */

import crypto from 'node:crypto';

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the secret in bytes (will be base64 encoded)
 * @returns {string} Base64 encoded random string
 */
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Generate a secure password with mixed characters
 * @param {number} length - Length of the password
 * @returns {string} Random password
 */
function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

console.log('# Production Environment Secrets');
console.log('# Generated on:', new Date().toISOString());
console.log('# WARNING: Keep this file secure and never commit to version control');
console.log('');

console.log('# Database Configuration');
console.log(`POSTGRES_USER=taskflow_prod`);
console.log(`POSTGRES_PASSWORD=${generatePassword(20)}`);
console.log(`POSTGRES_DB=taskflow_prod`);
console.log('');

console.log('# Test Database Configuration');
console.log(`TEST_POSTGRES_USER=test_prod`);
console.log(`TEST_POSTGRES_PASSWORD=${generatePassword(20)}`);
console.log(`TEST_POSTGRES_DB=taskflow_test_prod`);
console.log('');

console.log('# Application Secrets');
console.log(`SESSION_SECRET=${generateSecret(64)}`);
console.log(`JWT_SECRET=${generateSecret(64)}`);
console.log('');

console.log('# Additional Security Settings');
console.log('NODE_ENV=production');
console.log('LOG_LEVEL=warn');
console.log('ENABLE_HSTS=true');
console.log('RATE_LIMIT_WINDOW_MS=900000');
console.log('RATE_LIMIT_MAX_REQUESTS=100');
