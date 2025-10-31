import { PrismaClient } from '@prisma/client';
import { injectable } from 'tsyringe';

/**
 * Prisma Client Singleton
 *
 * Manages a single instance of PrismaClient throughout the application lifecycle.
 * Implements best practices for connection pooling and graceful shutdown.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */
@injectable()
export class PrismaService {
  private static instance: PrismaClient | null = null;
  private static isShuttingDown = false;

  /**
   * Get Prisma Client instance
   * Creates a new instance if none exists
   */
  get client(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = this.createClient();
      this.setupHooks();
    }
    return PrismaService.instance;
  }

  /**
   * Create new Prisma Client with optimized configuration
   */
  private createClient(): PrismaClient {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'error' },
              { emit: 'stdout', level: 'warn' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
      errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    });
  }

  /**
   * Setup lifecycle hooks for logging and cleanup
   */
  private setupHooks(): void {
    if (!PrismaService.instance) return;

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      PrismaService.instance.$on('query' as never, (e: { query: string; duration: number }) => {
        if (e.duration > 1000) {
          console.warn(`⚠️  Slow query detected (${e.duration}ms):`, e.query);
        }
      });
    }

    // Graceful shutdown handlers
    const cleanup = async () => {
      if (PrismaService.isShuttingDown) return;
      PrismaService.isShuttingDown = true;

      console.info('🔌 Disconnecting from database...');
      await this.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('beforeExit', cleanup);
  }

  /**
   * Disconnect from database
   * Should be called before application shutdown
   */
  async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
    }
  }

  /**
   * Test database connection
   * Useful for health checks
   */
  async ping(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute operations in a transaction
   *
   * @example
   * ```typescript
   * await prismaService.transaction(async (tx) => {
   *   await tx.user.create({ data: userData });
   *   await tx.task.create({ data: taskData });
   * });
   * ```
   */
  async transaction<T>(
    fn: (
      tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>
    ) => Promise<T>
  ): Promise<T> {
    return this.client.$transaction(fn);
  }
}
