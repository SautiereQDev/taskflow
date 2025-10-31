import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { pino } from 'pino';
import pinoHttp from 'pino-http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { htmxMiddleware } from '@presentation/middleware/htmx.middleware.js';
import { errorHandler, notFoundHandler } from '@presentation/middleware/error.middleware.js';
import { globalLimiter } from '@presentation/middleware/rate-limit.middleware.js';
import { i18nMiddleware } from '@config/i18n.config.js';
import routes from '@presentation/routes/index.js';
import { logger } from '@utils/logger.util.js';

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

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

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
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  // Request Logging
  const pinoLogger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
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
      }),
      secret: process.env.SESSION_SECRET ?? 'taskflow-secret-change-in-prod',
      resave: false,
      saveUninitialized: false,
      name: 'taskflow.sid',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      },
    })
  );

  // View Engine (EJS)
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../views'));

  // Static Files
  app.use(express.static(path.join(__dirname, '../../public')));

  // Custom Middleware
  app.use(htmxMiddleware);
  app.use(i18nMiddleware);
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

  // Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
