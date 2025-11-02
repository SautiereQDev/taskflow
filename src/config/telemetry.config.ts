/**
 * OpenTelemetry Configuration
 *
 * Distributed tracing and metrics collection for observability
 *
 * @module config/telemetry
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

/**
 * Check if OpenTelemetry is enabled
 * Disabled in test environment to avoid overhead
 */
const isEnabled = process.env.OTEL_ENABLED === 'true' && process.env.NODE_ENV !== 'test';

/**
 * OTLP Exporter Configuration
 * Compatible with Jaeger, Prometheus, Grafana Cloud, etc.
 */
const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';

/**
 * Service Resource Information
 * Identifies this service in distributed traces
 */
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'taskflow',
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '1.0.0',
  environment: process.env.NODE_ENV ?? 'development',
  'service.namespace': 'taskflow',
});

/**
 * Trace Exporter Configuration
 * Exports spans to OTLP collector
 */
const traceExporter = new OTLPTraceExporter({
  url: `${OTLP_ENDPOINT}/v1/traces`,
  headers: {
    // Add authentication if using cloud providers
    // 'x-api-key': process.env.OTEL_API_KEY,
  },
});

/**
 * Metrics Exporter Configuration
 * Exports metrics to OTLP collector
 */
const metricExporter = new OTLPMetricExporter({
  url: `${OTLP_ENDPOINT}/v1/metrics`,
  headers: {
    // Add authentication if using cloud providers
  },
});

/**
 * Metric Reader Configuration
 * Periodic export every 60 seconds
 */
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 60000, // 60 seconds
});

/**
 * OpenTelemetry SDK Configuration
 *
 * Auto-instrumentation for:
 * - HTTP/HTTPS (Express routes)
 * - PostgreSQL (Prisma queries)
 * - DNS lookups
 * - FS operations
 * - Net sockets
 */
const sdk = isEnabled
  ? new NodeSDK({
      resource,
      traceExporter,
      metricReader,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Fine-tune instrumentations
          '@opentelemetry/instrumentation-http': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-pg': {
            // Enhance database spans
            enhancedDatabaseReporting: true,
          },
          '@opentelemetry/instrumentation-fs': {
            // Disable FS instrumentation (too verbose)
            enabled: false,
          },
        }),
      ],
    })
  : null;

/**
 * Initialize OpenTelemetry SDK
 * Must be called before any application code
 *
 * @example
 * ```typescript
 * // In server.ts (first import)
 * import './config/telemetry.config.js';
 * ```
 */
export function initializeTelemetry(): void {
  if (!isEnabled) {
    console.info('📊 OpenTelemetry disabled (set OTEL_ENABLED=true to enable)');
    return;
  }

  try {
    sdk?.start();
    console.info('📊 OpenTelemetry initialized successfully');
    console.info(`   Service: taskflow`);
    console.info(`   Environment: ${process.env.NODE_ENV}`);
    console.info(`   Endpoint: ${OTLP_ENDPOINT}`);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk
        ?.shutdown()
        .then(() => console.info('📊 OpenTelemetry shutdown complete'))
        .catch((error) => console.error('📊 OpenTelemetry shutdown error:', error))
        .finally(() => process.exit(0));
    });
  } catch (error) {
    console.error('📊 Failed to initialize OpenTelemetry:', error);
  }
}

/**
 * Performance Metrics
 *
 * Custom metrics for application-specific monitoring
 */
export const performanceMetrics = {
  /**
   * Track request duration
   * Used for TTFB (Time To First Byte) monitoring
   */
  requestDuration: {
    name: 'http.request.duration',
    description: 'HTTP request duration in milliseconds',
    unit: 'ms',
  },

  /**
   * Track database query duration
   */
  dbQueryDuration: {
    name: 'db.query.duration',
    description: 'Database query duration in milliseconds',
    unit: 'ms',
  },

  /**
   * Track cache hits/misses
   */
  cacheHitRate: {
    name: 'cache.hit_rate',
    description: 'Cache hit rate percentage',
    unit: '%',
  },

  /**
   * Track task creation rate
   */
  taskCreationRate: {
    name: 'tasks.created.rate',
    description: 'Number of tasks created per minute',
    unit: 'count',
  },

  /**
   * Track authentication attempts
   */
  authAttempts: {
    name: 'auth.attempts',
    description: 'Authentication attempts (success/failure)',
    unit: 'count',
  },
};

/**
 * Performance Budgets
 *
 * Target metrics for application performance
 * Based on Google's Core Web Vitals and best practices
 */
export const performanceBudgets = {
  /**
   * Server-Side Metrics
   */
  server: {
    // Time To First Byte - Should be < 600ms
    ttfb: {
      target: 600,
      warning: 800,
      unit: 'ms',
    },
    // API response time - Should be < 200ms
    apiResponseTime: {
      target: 200,
      warning: 500,
      unit: 'ms',
    },
    // Database query time - Should be < 50ms
    dbQueryTime: {
      target: 50,
      warning: 100,
      unit: 'ms',
    },
  },

  /**
   * Client-Side Metrics (Web Vitals)
   */
  client: {
    // Largest Contentful Paint - Should be < 2.5s
    lcp: {
      target: 2500,
      warning: 4000,
      unit: 'ms',
    },
    // First Input Delay - Should be < 100ms
    fid: {
      target: 100,
      warning: 300,
      unit: 'ms',
    },
    // Cumulative Layout Shift - Should be < 0.1
    cls: {
      target: 0.1,
      warning: 0.25,
      unit: 'score',
    },
    // Time To Interactive - Should be < 3.8s
    tti: {
      target: 3800,
      warning: 7300,
      unit: 'ms',
    },
    // First Contentful Paint - Should be < 1.8s
    fcp: {
      target: 1800,
      warning: 3000,
      unit: 'ms',
    },
  },

  /**
   * Resource Budgets
   */
  resources: {
    // Total page weight - Should be < 1MB
    pageWeight: {
      target: 1024,
      warning: 2048,
      unit: 'KB',
    },
    // JavaScript bundle size - Should be < 170KB
    jsBundleSize: {
      target: 170,
      warning: 350,
      unit: 'KB',
    },
    // CSS bundle size - Should be < 100KB
    cssBundleSize: {
      target: 100,
      warning: 200,
      unit: 'KB',
    },
    // Image size - Should be < 500KB
    imageSize: {
      target: 500,
      warning: 1000,
      unit: 'KB',
    },
  },
};

/**
 * Observability Best Practices Checklist
 *
 * - [x] OpenTelemetry SDK configured
 * - [x] Auto-instrumentation enabled (HTTP, PostgreSQL)
 * - [x] Trace exporter configured (OTLP)
 * - [x] Metric exporter configured (OTLP)
 * - [x] Custom metrics defined
 * - [x] Performance budgets documented
 * - [ ] Grafana dashboards created
 * - [ ] Alerting rules configured
 * - [ ] SLOs/SLIs defined
 * - [ ] Error tracking integration
 */
