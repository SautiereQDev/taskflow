import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';

export const {
  invalidCsrfTokenError,
  generateCsrfToken: generateToken, // Alias for compatibility or just rename
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET ?? 'csrf-secret-key-change-me-in-production',
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req: Request) => {
    const bodyToken = (req.body as { _csrf?: string } | undefined)?._csrf;
    const headerToken = req.headers['x-csrf-token'];
    return bodyToken ?? headerToken;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  getSessionIdentifier: (req: any) => req.session.id,
});
