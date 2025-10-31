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
import middleware from 'i18next-http-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize i18next
 */
await i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
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
export const i18nMiddleware = middleware.handle(i18next);

/**
 * Language detector middleware
 * Detects language from query, session, or headers
 */
export const languageDetector = middleware.LanguageDetector;

export default i18next;
