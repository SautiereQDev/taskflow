import './config/di-container.js'; // MUST be first for DI
import { initializeTelemetry } from './config/telemetry.config.js';
import { createApp } from './config/express.config.js';
import { logger } from './utils/logger.util.js';
import { PrismaClient } from '@prisma/client';
import { validateEnvVars } from './config/security.config.js';

/**
 * Server Entry Point
 *
 * Initializes and starts the Express server
 */

// Initialize OpenTelemetry (must be before any application code)
initializeTelemetry();

// Validate environment variables at startup (security best practice)
validateEnvVars();
// Force restart
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST ?? '0.0.0.0';

// Create Express application
const app = createApp();

// Create Prisma client for graceful shutdown
const prisma = new PrismaClient();

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server started`, {
        port: PORT,
        host: HOST,
        env: process.env.NODE_ENV ?? 'development',
        nodeVersion: process.version,
      });
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string): void => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');

        // Disconnect from database
        void prisma.$disconnect().then(() => {
          logger.info('Database disconnected');
          logger.info('Graceful shutdown complete');
          process.exit(0);
        });
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000); // 10 seconds
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the application
void start();
