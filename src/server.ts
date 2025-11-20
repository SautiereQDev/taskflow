import express from 'express';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import expressLayouts from 'express-ejs-layouts';
import { prisma } from './db.js';
import { logger } from './utils.js';
import routes from './routes.js';
import {
  i18nMiddleware,
  i18nLocalsMiddleware,
  attachUser,
  htmxMiddleware,
  cspNonceMiddleware,
  errorHandler,
  notFoundHandler,
} from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

// Body Parsing
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de sécurité (CSP Nonce) - Doit être avant expressLayouts
app.use(cspNonceMiddleware);

// Session Management
const PgSession = ConnectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET ?? 'taskflow-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(htmxMiddleware);
app.use(i18nMiddleware);
app.use(i18nLocalsMiddleware);
app.use(attachUser);

// Routes
app.use('/', routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
try {
  await prisma.$connect();
  logger.info('Database connected');
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server started on port ${PORT}`);
  });
} catch (error) {
  logger.error('Failed to start server', error);
  process.exit(1);
}
