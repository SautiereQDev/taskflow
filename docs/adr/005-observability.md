# ADR-005: Observability Strategy

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Development Team  

## Context

A production-ready application requires comprehensive observability to monitor health, diagnose issues, and understand user behavior. We need a strategy that provides visibility without overwhelming complexity or cost.

## Decision

**We will implement a three-pillar observability strategy using open standards:**

```
┌─────────────────────────────────────┐
│        Application Code             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      OpenTelemetry SDK              │
│  ┌─────────┬─────────┬─────────┐   │
│  │ Traces  │ Metrics │  Logs   │   │
│  └─────────┴─────────┴─────────┘   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      OTLP Exporters                 │
│  (Vendor-neutral protocol)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Backend (Jaeger/Prometheus/Loki)  │
│   or SaaS (Datadog/New Relic/etc)   │
└─────────────────────────────────────┘
```

## Three Pillars of Observability

### 1. Structured Logging (Pino)

**Purpose**: Capture application events and errors

**Implementation**: Pino 9.x with JSON output

#### Logger Configuration
```typescript
// src/config/logger.config.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Production: JSON for log aggregation
  // Development: Pretty-print for readability
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  
  // Base fields for all logs
  base: {
    env: process.env.NODE_ENV,
    service: 'taskflow-api',
    version: process.env.npm_package_version
  },
  
  // Redact sensitive data
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'user.password'],
    remove: true
  },
  
  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
});
```

#### HTTP Request Logging
```typescript
// src/middleware/logger.middleware.ts
import pinoHttp from 'pino-http';
import { logger } from '@config/logger.config.js';

export const httpLogger = pinoHttp({
  logger,
  
  // Custom request ID
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  
  // Log level based on status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  
  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  
  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  
  // Additional fields
  customProps: (req, res) => ({
    userId: req.user?.id,
    sessionId: req.sessionID,
    userAgent: req.headers['user-agent']
  })
});
```

#### Application Logging Patterns

**Info Level**: Business events
```typescript
logger.info({
  action: 'task_created',
  taskId: task.id,
  userId: req.user.id,
  title: task.title
}, 'Task created successfully');
```

**Error Level**: Exceptions and failures
```typescript
logger.error({
  err,
  action: 'task_create_failed',
  userId: req.user.id,
  payload: req.body
}, 'Failed to create task');
```

**Debug Level**: Detailed debugging info
```typescript
logger.debug({
  action: 'database_query',
  query: 'findMany',
  filters: { status: 'TODO' },
  duration: Date.now() - startTime
}, 'Database query executed');
```

**Child Loggers**: Request-scoped context
```typescript
// Middleware adds child logger to request
app.use((req, res, next) => {
  req.log = logger.child({
    requestId: req.id,
    userId: req.user?.id
  });
  next();
});

// Controllers use request logger
async create(req: Request, res: Response) {
  req.log.info({ action: 'create_task_start' }, 'Creating task');
  // ... task creation logic
  req.log.info({ action: 'create_task_success', taskId }, 'Task created');
}
```

### 2. Distributed Tracing (OpenTelemetry)

**Purpose**: Track request flow across services and identify bottlenecks

**Implementation**: OpenTelemetry SDK with OTLP exporter

#### Tracing Configuration
```typescript
// src/config/telemetry.config.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const sdk = new NodeSDK({
  // Resource identifies this service
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'taskflow-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV
  }),
  
  // Export traces via OTLP
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  }),
  
  // Auto-instrument common libraries
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingPaths: ['/health', '/metrics']
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-prisma': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true }
    })
  ]
});

// Start SDK
sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

#### Manual Span Creation
```typescript
// For custom business logic
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('taskflow-api');

async createTask(data: CreateTaskDto): Promise<Task> {
  // Create span for business logic
  return tracer.startActiveSpan('TaskService.createTask', async (span) => {
    try {
      span.setAttributes({
        'task.title': data.title,
        'task.status': data.status,
        'user.id': data.creatorId
      });
      
      const task = await this.taskRepo.create(data);
      
      span.setStatus({ code: SpanStatusCode.OK });
      return task;
    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

#### Trace Context Propagation
```typescript
// Express middleware extracts trace context
import { propagation, context } from '@opentelemetry/api';

app.use((req, res, next) => {
  // Extract trace context from headers (W3C Trace Context)
  const extractedContext = propagation.extract(context.active(), req.headers);
  
  context.with(extractedContext, () => {
    next();
  });
});
```

### 3. Metrics (OpenTelemetry)

**Purpose**: Quantify system behavior and performance

**Implementation**: OpenTelemetry Metrics API with Prometheus exporter

#### Metrics Configuration
```typescript
// src/config/metrics.config.ts
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics'
});

const meterProvider = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000 // Export every 60s
    })
  ]
});

export const meter = meterProvider.getMeter('taskflow-api');
```

#### Business Metrics
```typescript
// src/services/TaskService.ts
import { meter } from '@config/metrics.config.js';

export class TaskService {
  // Counter: Total tasks created
  private tasksCreatedCounter = meter.createCounter('tasks_created_total', {
    description: 'Total number of tasks created',
    unit: '1'
  });
  
  // Histogram: Task creation duration
  private taskCreationDuration = meter.createHistogram('task_creation_duration', {
    description: 'Time taken to create a task',
    unit: 'ms'
  });
  
  // UpDownCounter: Active tasks
  private activeTasksGauge = meter.createUpDownCounter('tasks_active', {
    description: 'Number of active (non-completed) tasks',
    unit: '1'
  });
  
  async createTask(data: CreateTaskDto): Promise<Task> {
    const startTime = Date.now();
    
    try {
      const task = await this.taskRepo.create(data);
      
      // Increment counters
      this.tasksCreatedCounter.add(1, {
        status: task.status,
        priority: task.priority
      });
      
      this.activeTasksGauge.add(1);
      
      // Record duration
      this.taskCreationDuration.record(Date.now() - startTime, {
        status: 'success'
      });
      
      return task;
    } catch (error) {
      this.taskCreationDuration.record(Date.now() - startTime, {
        status: 'error'
      });
      throw error;
    }
  }
}
```

#### System Metrics
```typescript
// Automatically collected by OpenTelemetry auto-instrumentation
- http_server_request_duration
- http_server_response_size
- db_client_query_duration
- process_cpu_usage
- process_memory_usage
- nodejs_event_loop_delay
```

## Health Checks

### Endpoints
```typescript
// src/routes/health.routes.ts
import express from 'express';
import { prisma } from '@config/database.config.js';

const router = express.Router();

// Liveness probe (is app running?)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});

// Readiness probe (is app ready to serve traffic?)
router.get('/ready', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ready',
      checks: {
        database: 'ok'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      checks: {
        database: 'failed',
        error: error.message
      }
    });
  }
});

// Startup probe (has app finished initialization?)
router.get('/startup', (req, res) => {
  const isInitialized = app.locals.initialized === true;
  
  if (isInitialized) {
    res.json({ status: 'started' });
  } else {
    res.status(503).json({ status: 'starting' });
  }
});

export default router;
```

## Error Tracking

### Structured Error Logging
```typescript
// src/middleware/error.middleware.ts
import { logger } from '@config/logger.config.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error with full context
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query
    },
    user: req.user,
    requestId: req.id
  }, 'Request error');
  
  // Send error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message,
      code: err.code,
      requestId: req.id,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}
```

### Error Aggregation
- Errors logged to structured logs
- Searchable by request ID, user ID, error type
- Alerts configured for error rate thresholds

## Alerting Strategy

### Critical Alerts (PagerDuty/Opsgenie)
1. **API Error Rate > 5%**: Indicates system issues
2. **Database Connection Failures**: Database unavailable
3. **Memory Usage > 90%**: Memory leak or high load
4. **Response Time P99 > 5s**: Performance degradation

### Warning Alerts (Slack/Email)
1. **Task Creation Rate Drop > 50%**: Potential issue
2. **Failed Login Attempts Spike**: Security concern
3. **Disk Space < 20%**: Need to clean up logs

### Configuration Example (Prometheus)
```yaml
# alerting_rules.yml
groups:
  - name: taskflow_api
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_server_request_duration_count{status=~"5.."}[5m])
          /
          rate(http_server_request_duration_count[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on TaskFlow API"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      - alert: SlowResponseTime
        expr: |
          histogram_quantile(0.99, 
            rate(http_server_request_duration_bucket[5m])
          ) > 5000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response times"
          description: "P99 latency is {{ $value }}ms"
```

## Dashboards

### Application Dashboard (Grafana)
```
┌─────────────────────────────────────┐
│  TaskFlow API - Overview            │
├─────────────────────────────────────┤
│  Request Rate:     ████████ 150 rps │
│  Error Rate:       ██       2.1%    │
│  P50 Latency:      50ms              │
│  P99 Latency:      350ms             │
├─────────────────────────────────────┤
│  [Request Rate Graph]               │
│  [Error Rate Graph]                 │
│  [Latency Percentiles Graph]        │
├─────────────────────────────────────┤
│  Top Endpoints by Volume:           │
│  1. GET /tasks       (45%)          │
│  2. POST /tasks      (20%)          │
│  3. GET /dashboard   (15%)          │
├─────────────────────────────────────┤
│  Database Query Performance:        │
│  [Query Duration Graph]             │
│  [Connection Pool Graph]            │
└─────────────────────────────────────┘
```

### Business Metrics Dashboard
```
┌─────────────────────────────────────┐
│  TaskFlow - Business Metrics        │
├─────────────────────────────────────┤
│  Tasks Created Today:   127         │
│  Tasks Completed Today: 89          │
│  Active Users:          34          │
├─────────────────────────────────────┤
│  [Tasks Created Over Time]          │
│  [Task Status Distribution]         │
│  [User Activity Heatmap]            │
└─────────────────────────────────────┘
```

## Development vs Production

### Development Environment
```yaml
# .env.development
LOG_LEVEL=debug
OTEL_TRACES_SAMPLER=always_on
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

**Local Observability Stack** (Docker Compose):
- Jaeger UI: http://localhost:16686 (traces)
- Prometheus: http://localhost:9090 (metrics)
- Grafana: http://localhost:3000 (dashboards)

### Production Environment
```yaml
# .env.production
LOG_LEVEL=info
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # Sample 10% of traces
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadog.com
```

**Production Stack**:
- Logs: CloudWatch Logs / Elasticsearch
- Traces: Datadog / New Relic / Honeycomb
- Metrics: Prometheus + Grafana Cloud
- Alerts: PagerDuty

## Privacy & Compliance

### Data Redaction
```typescript
// Redact sensitive fields in logs
const logger = pino({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.email',
      'user.password',
      'user.email'
    ],
    remove: true
  }
});
```

### Log Retention
- **Development**: 7 days
- **Staging**: 30 days
- **Production**: 90 days (or per compliance requirements)

### GDPR Compliance
- User data removed from logs on account deletion
- PII not stored in metrics (use user IDs, not emails)
- Traces scrubbed of sensitive data

## Consequences

### Positive
- Fast issue detection and resolution
- Data-driven performance optimization
- Improved user experience through proactive monitoring
- Vendor-neutral (can switch backends easily)

### Negative
- Initial setup complexity
- Increased resource usage (CPU, memory, network)
- Cost of observability backend (SaaS or self-hosted)
- Learning curve for team

### Risk Mitigation
- Start with sampling in production (10% of traces)
- Use async log transports to minimize performance impact
- Set up cost alerts for SaaS backends
- Provide training and documentation

## Validation Criteria

- [ ] All HTTP requests logged with context
- [ ] Critical business events tracked
- [ ] Distributed traces end-to-end
- [ ] Custom metrics for key business KPIs
- [ ] Health check endpoints functional
- [ ] Dashboards created and useful
- [ ] Alerts configured and tested

## References
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Pino Best Practices](https://getpino.io/#/docs/best-practices)
- [The Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)
- [Google SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
