import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { pino } from 'pino';
import pinoHttp from 'pino-http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import expressLayouts from 'express-ejs-layouts';
import { htmxMiddleware } from '@presentation/middleware/htmx.middleware.js';
import { errorHandler, notFoundHandler } from '@presentation/middleware/error.middleware.js';
import { generateCspNonce } from '@presentation/middleware/csp-nonce.middleware.js';
import { csrfMiddleware } from '@presentation/middleware/csrf.middleware.js';
import { globalLimiter } from '@presentation/middleware/rate-limit.middleware.js';
import { performanceMonitoring } from '@presentation/middleware/performance.middleware.js';
import { i18nMiddleware, i18nLocalsMiddleware } from '@config/i18n.config.js';
import { attachUser } from '@presentation/middleware/authentication.middleware.js';
import routes from '@presentation/routes/index.js';
import { logger } from '@utils/logger.util.js';
import { helmetConfig } from '@config/security.config.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express Application Configuration
 *
 * Configures Express 5 application with:
 * - Security middleware (helmet)
 * - CORS configuration
 * - Compression
 * - Session management (PostgreSQL store)
 * - Request logging (pino-http)
 * - HTMX detection
 * - Error handling
 * - EJS templating
 *
 * @returns Configured Express application
 */
export function createApp(): Express {
  const app = express();

  // Trust proxy in production (for rate limiting behind reverse proxy)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Generate CSP nonce early (required for helmet CSP configuration)
  app.use(generateCspNonce);

  // Security Middleware - Helmet with comprehensive CSP (uses nonce from middleware)
  app.use(helmet(helmetConfig));

  // CORS configuration
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'production'
          ? (process.env.ALLOWED_ORIGINS?.split(',') ?? [])
          : true,
      credentials: true,
    })
  );

  // Body Parsing & Compression
  app.use(cookieParser()); // Required for CSRF cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  // Request Logging (pino-pretty only available in local development, not in Docker)
  const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV;
  const pinoLogger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    transport: isLocalDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });

  app.use(
    pinoHttp({
      logger: pinoLogger,
      autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/ready',
      },
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // Session Management
  const PgSession = ConnectPgSimple(session);
  const prisma = new PrismaClient();

  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        tableName: 'session',
        // Prune expired session rows from database table daily
        pruneSessionInterval: 24 * 60 * 60, // 24 hours in seconds
      }),
      secret: process.env.SESSION_SECRET ?? 'taskflow-secret-change-in-prod',
      resave: false, // Don't save session if unmodified
      saveUninitialized: false, // Don't create session until something stored
      rolling: true, // Reset maxAge on every request (extends session lifetime with user activity)
      name: 'sessionId',
      cookie: {
        httpOnly: true, // Prevent XSS attacks (no JavaScript access)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection (only send cookie on same-site requests)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (automatically refreshed with rolling: true)
        domain: undefined, // Let browser determine domain (works for localhost)
        path: '/',
      },
    })
  );

  // View Engine (EJS)
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');

  // Static Files
  app.use(express.static(path.join(__dirname, '../../public')));

  // Custom Middleware
  app.use(performanceMonitoring); // Track TTFB and response times
  app.use(htmxMiddleware);
  app.use(i18nMiddleware);
  app.use(i18nLocalsMiddleware); // Attach i18n functions to res.locals for EJS
  app.use(attachUser); // Attach user to request if authenticated
  app.use(csrfMiddleware); // CSRF protection (must be after session & body parsing)
  app.use(globalLimiter);

  // Health Checks
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.get('/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ready', database: 'connected' });
    } catch (error) {
      logger.error('Database health check failed', { error });
      res.status(503).json({ status: 'not ready', database: 'disconnected' });
    }
  });

  // Application Routes
  app.use('/', routes);

  // Error Handling must be last
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
