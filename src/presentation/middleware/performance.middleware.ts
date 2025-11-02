/**
 * Performance Monitoring Middleware
 *
 * Tracks request performance metrics (TTFB, response time)
 * and provides structured logging for observability
 *
 * @module presentation/middleware/performance
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger.util.js';

/**
 * Performance monitoring middleware
 *
 * Tracks:
 * - Time To First Byte (TTFB)
 * - Total response time
 * - Response status
 * - Request metadata
 *
 * Logs warnings for slow requests based on performance budgets
 *
 * @example
 * ```typescript
 * app.use(performanceMonitoring);
 * ```
 */
export function performanceMonitoring(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const startHrTime = process.hrtime.bigint();

  // Store start time in request for use in controllers
  (req as any).startTime = startTime;

  // Capture response when headers are sent (TTFB)
  const originalWriteHead = res.writeHead.bind(res);
  let ttfbLogged = false;

  res.writeHead = function (statusCode: number, ...args: any[]): Response {
    if (!ttfbLogged) {
      const ttfb = Date.now() - startTime;
      (req as any).ttfb = ttfb;
      ttfbLogged = true;

      // Log warning if TTFB exceeds budget (600ms)
      if (ttfb > 600) {
        logger.warn('Slow TTFB detected', {
          method: req.method,
          url: req.url,
          ttfb,
          threshold: 600,
        });
      }
    }

    return originalWriteHead(statusCode, ...args);
  };

  // Capture response completion
  res.on('finish', () => {
    const endHrTime = process.hrtime.bigint();
    const duration = Number(endHrTime - startHrTime) / 1_000_000; // Convert to ms

    // Skip health checks from performance logs
    if (req.url === '/health' || req.url === '/ready') {
      return;
    }

    const performanceLog = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimals
      ttfb: (req as any).ttfb ?? 0,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      isHtmx: (req as any).isHtmx ?? false,
    };

    // Log based on performance and status
    if (res.statusCode >= 500) {
      logger.error('Request failed', performanceLog);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', performanceLog);
    } else if (duration > 1000) {
      // Warn if response time > 1s
      logger.warn('Slow request', { ...performanceLog, threshold: 1000 });
    } else {
      logger.info('Request completed', performanceLog);
    }
  });

  next();
}

/**
 * Database query performance tracker
 *
 * Wrapper for Prisma queries to track execution time
 * and log slow queries
 *
 * @example
 * ```typescript
 * const result = await trackQuery(
 *   'findMany tasks',
 *   () => prisma.task.findMany()
 * );
 * ```
 */
export async function trackQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;

    // Log warning if query exceeds budget (50ms)
    if (duration > 50) {
      logger.warn('Slow database query', {
        query: queryName,
        duration,
        threshold: 50,
      });
    } else {
      logger.debug('Database query executed', {
        query: queryName,
        duration,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Database query failed', {
      query: queryName,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Cache performance tracker
 *
 * Tracks cache hits and misses for monitoring
 *
 * @example
 * ```typescript
 * const value = await getCached('user:123', async () => {
 *   return await fetchUser(123);
 * });
 * ```
 */
export async function trackCache<T>(
  cacheKey: string,
  cacheFn: () => Promise<T | null>,
  fetchFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    // Try to get from cache
    const cached = await cacheFn();

    if (cached !== null) {
      const duration = Date.now() - startTime;
      logger.debug('Cache hit', {
        key: cacheKey,
        duration,
      });
      return cached;
    }

    // Cache miss - fetch from source
    logger.debug('Cache miss', { key: cacheKey });
    const result = await fetchFn();

    return result;
  } catch (error) {
    logger.error('Cache operation failed', {
      key: cacheKey,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Performance metrics summary
 *
 * Generates summary statistics for a time window
 * Useful for monitoring dashboards
 */
export interface PerformanceMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
  };
  ttfb: {
    avg: number;
    p95: number;
    p99: number;
    slow: number; // Count of requests > 600ms
  };
  errors: {
    total: number;
    rate: number; // Errors per total requests
  };
}

/**
 * In-memory metrics collector
 * For production, use proper time-series database (Prometheus, InfluxDB)
 */
class MetricsCollector {
  private durations: number[] = [];
  private ttfbs: number[] = [];
  private errorCount = 0;
  private requestCount = 0;

  record(duration: number, ttfb: number, isError: boolean): void {
    this.durations.push(duration);
    this.ttfbs.push(ttfb);
    this.requestCount++;
    if (isError) this.errorCount++;

    // Keep only last 1000 requests to avoid memory leak
    if (this.durations.length > 1000) {
      this.durations.shift();
      this.ttfbs.shift();
    }
  }

  getSummary(): PerformanceMetrics {
    const sortedDurations = [...this.durations].sort((a, b) => a - b);
    const sortedTtfbs = [...this.ttfbs].sort((a, b) => a - b);

    const p95Index = Math.floor(sortedDurations.length * 0.95);
    const p99Index = Math.floor(sortedDurations.length * 0.99);

    return {
      requests: {
        total: this.requestCount,
        successful: this.requestCount - this.errorCount,
        failed: this.errorCount,
        avgDuration: this.average(this.durations),
        p95Duration: sortedDurations[p95Index] ?? 0,
        p99Duration: sortedDurations[p99Index] ?? 0,
      },
      ttfb: {
        avg: this.average(this.ttfbs),
        p95: sortedTtfbs[p95Index] ?? 0,
        p99: sortedTtfbs[p99Index] ?? 0,
        slow: this.ttfbs.filter((t) => t > 600).length,
      },
      errors: {
        total: this.errorCount,
        rate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      },
    };
  }

  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  reset(): void {
    this.durations = [];
    this.ttfbs = [];
    this.errorCount = 0;
    this.requestCount = 0;
  }
}

// Export singleton metrics collector
export const metricsCollector = new MetricsCollector();
