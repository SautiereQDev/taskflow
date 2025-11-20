import { Request, Response, NextFunction } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as i18nextHttpMiddleware from 'i18next-http-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { IAuthenticatedRequest, IUser } from './types.js';
import { prisma } from './db.js';
import { AppError, logger } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize i18next
await i18next
  .use(Backend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    supportedLngs: ['fr', 'en'],
    fallbackLng: 'fr',
    preload: ['fr', 'en'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    detection: {
      order: ['querystring', 'session', 'cookie', 'header'],
      lookupQuerystring: 'lang',
      lookupSession: 'locale',
      lookupCookie: 'i18next',
      caches: ['cookie', 'session'],
    },
  });

// Force reload for i18n changes - update 2
export const i18nMiddleware = i18nextHttpMiddleware.handle(i18next);

export const i18nLocalsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as IAuthenticatedRequest;
  const i18n = authReq.i18n;

  // Manually persist language if changed via query param to ensure it sticks
  if (req.query.lang) {
    const lang = req.query.lang as string;
    if (['fr', 'en'].includes(lang)) {
      res.cookie('i18next', lang, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      if (authReq.session) {
        authReq.session.locale = lang;
      }
      // Force language change for current request
      if (i18n) {
        await i18n.changeLanguage(lang);
      }
    }
  }

  const t = authReq.t;
  const detectedLang = i18n?.language ?? 'fr';

  if (typeof t === 'function') {
    res.locals.t = t.bind(req);
    res.locals.__ = t.bind(req);
  } else {
    res.locals.t = (k: string) => k;
    res.locals.__ = (k: string) => k;
  }
  res.locals.locale = detectedLang;
  next();
};

export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as IAuthenticatedRequest;
  if (authReq.session?.userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: authReq.session.userId } });
      if (user) {
        // Cast to unknown first to avoid linter errors about incompatible types if any
        authReq.user = user as unknown as IUser;
        res.locals.user = user;
      }
    } catch (e) {
      console.error('Failed to attach user', e);
    }
  }
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as IAuthenticatedRequest;
  if (!authReq.session?.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

export const htmxMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.isHtmx = req.headers['hx-request'] === 'true';
  next();
};

export const cspNonceMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
  next();
};

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  logger.error(error.message, { stack: error.stack });

  if (req.isHtmx) {
    res.status(statusCode).send(`<div class="alert alert-error">${error.message}</div>`);
  } else {
    res.status(statusCode).render('pages/500', { error });
  }
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  if (/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/.exec(req.path)) {
    return next();
  }
  res.status(404).render('pages/404', { title: 'Page non trouvée' });
};
