/**
 * Express Session Type Augmentation
 *
 * Extends Express Session with custom properties.
 *
 * @module types/express-session
 */

import 'express-session';

declare module 'express-session' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface SessionData {
    userId?: string;
    theme?: 'light' | 'dark';
    locale?: 'fr' | 'en';
  }
}
