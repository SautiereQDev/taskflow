/**
 * Authentication Validation Schemas
 *
 * @module presentation/validation/auth.validation
 */

import {
  emailValidation,
  passwordValidation,
  nameValidation,
} from '../utils/validation.helpers.js';

/**
 * Validation rules for user login
 * Validates email format and password presence
 */
export const loginValidation = [...emailValidation, ...passwordValidation];

/**
 * Validation rules for user registration
 * Validates name, email, and password with strength requirements
 */
export const registerValidation = [...nameValidation, ...emailValidation, ...passwordValidation];
