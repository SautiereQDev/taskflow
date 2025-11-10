/**
 * i18n Configuration
 *
 * Sets up internationalization with i18next and i18next-http-middleware.
 * Supports French and English with session-based persistence.
 *
 * @module config/i18n.config
 */

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as i18nextHttpMiddleware from 'i18next-http-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize i18next
 */
await i18next
  .use(Backend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    // Supported languages
    supportedLngs: ['fr', 'en'],
    fallbackLng: 'fr',
    preload: ['fr', 'en'],

    // Namespaces
    ns: ['translation'],
    defaultNS: 'translation',

    // Backend configuration (filesystem)
    backend: {
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },

    // Detection order and caches
    detection: {
      order: ['querystring', 'session', 'header'],
      lookupQuerystring: 'lang',
      lookupSession: 'locale',
      lookupHeader: 'accept-language',
      caches: ['cookie'],
      cookieSecure: process.env.NODE_ENV === 'production',
      cookieMaxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    },

    // Interpolation settings
    interpolation: {
      escapeValue: false, // Not needed for server-side
    },

    // Development settings
    debug: process.env.NODE_ENV === 'development',
    saveMissing: process.env.NODE_ENV === 'development',
    updateMissing: process.env.NODE_ENV === 'development',
  });

/**
 * i18n middleware for Express
 * Attaches i18next to request object
 */
export const i18nMiddleware = i18nextHttpMiddleware.handle(i18next, {
  // Attach translation function to res.locals for EJS
  removeLngFromUrl: false,
});

/**
 * Middleware to attach i18n functions to res.locals for EJS templates
 * Must be used after i18nMiddleware
 */
export function i18nLocalsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const t = (req as { t: (key: string) => string }).t;
  const i18n = (req as { i18n?: { language: string } }).i18n;

  // Get the actual language being used by i18next
  let detectedLang =
    i18n?.language ??
    (req as { language?: string; lng?: string }).language ??
    (req as { language?: string; lng?: string }).lng;

  if (!detectedLang) {
    // Force French as default if no language detected
    detectedLang = 'fr';
    (req as { language?: string }).language = 'fr';
    // Re-initialize i18next for this request
    void i18next.changeLanguage('fr');
  }

  if (typeof t === 'function') {
    res.locals.t = t.bind(req);
    res.locals.__ = t.bind(req);
  } else {
    // Fallback if i18next middleware didn't attach t function
    console.error('i18next t function not found on request object');
    res.locals.t = (key: string) => key;
    res.locals.__ = (key: string) => key;
  }
  res.locals.locale = detectedLang;
  next();
}

/**
 * Language detector middleware
 * Detects language from query, session, or headers
 */
export const languageDetector = i18nextHttpMiddleware.LanguageDetector;

// @ts-expect-error - ESLint rule conflict
export default i18next;
