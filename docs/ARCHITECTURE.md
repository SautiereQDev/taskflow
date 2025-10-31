# TaskFlow Architecture Documentation

**Project**: TaskFlow - Modern SSR Task Management Application  
**Version**: 3.0  
**Last Updated**: 2025-10-31  

## Overview

TaskFlow is a fullstack Server-Side Rendering (SSR) application for collaborative task management built with modern web standards and progressive enhancement principles.

### Core Philosophy

```
Progressive Enhancement
└── Layer 1: HTML + Server Rendering (Required)
    └── Layer 2: HTMX (Progressive - Partial Updates)
        └── Layer 3: Alpine.js (Progressive - Local Interactivity)
```

**Key Principles:**
1. **SSR First**: Server renders complete HTML, no client-side routing
2. **Progressive Enhancement**: Core features work without JavaScript
3. **Performance**: Time to Interactive (TTI) < 2 seconds
4. **Accessibility**: WCAG 2.2 AA compliant
5. **Type Safety**: TypeScript strict mode throughout

## Technology Stack

### Backend
- **Runtime**: Node.js 24.9+ (LTS)
- **Language**: TypeScript 5.7+ (ESM)
- **Framework**: Express 5.x
- **Database**: PostgreSQL 18
- **ORM**: Prisma 6.x
- **Dependency Injection**: TSyringe 4.8+
- **Validation**: Zod 3.23+

### Frontend
- **Templates**: EJS 3.1+
- **CSS Framework**: Tailwind CSS 4.x
- **Component Library**: DaisyUI 5.3.7
- **Client Interactivity**: HTMX 1.9+ + Alpine.js 3.x

### Observability
- **Logging**: Pino 9.x (structured JSON logging)
- **Tracing**: OpenTelemetry 0.54+
- **Metrics**: OpenTelemetry Metrics API

### Testing
- **Unit/Integration**: Vitest 3.x
- **E2E**: Playwright 1.56+
- **Coverage Target**: 85% minimum

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────┐
│          Presentation Layer                     │
│  (Controllers, Routes, Views, Middleware)       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          Application Layer                      │
│  (Commands, Queries, Services, DTOs)            │
│           CQRS Pattern                          │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Domain Layer                         │
│  (Entities, Value Objects, Domain Events)       │
│           Business Logic                        │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        Infrastructure Layer                     │
│  (Repositories, Database, External APIs)        │
└─────────────────────────────────────────────────┘
```

### Data Flow

#### Write Operations (Commands)
```
HTTP Request
  → Controller validates input
    → Command Handler executes business logic
      → Repository persists to database
        → Domain Events dispatched
          → HTTP Response (HTML or redirect)
```

#### Read Operations (Queries)
```
HTTP Request
  → Controller validates input
    → Query Handler retrieves data
      → Repository queries database
        → DTO transformed to View Model
          → EJS renders HTML
            → HTTP Response
```

### HTMX Integration

```
Browser                Server
   │                      │
   │  1. Form Submit      │
   │────hx-post──────────>│
   │                      │
   │                   2. Process
   │                      │
   │  3. HTML Fragment    │
   │<─────────────────────│
   │                      │
   │  4. DOM Swap         │
   │  (No page reload)    │
```

**Key Pattern**: Server returns HTML fragments for HTMX requests, full pages for standard requests.

## Project Structure

```
taskflow/
├── docs/
│   ├── adr/                          # Architecture Decision Records
│   │   ├── 001-ssr-pure-architecture.md
│   │   ├── 002-technology-stack.md
│   │   ├── 003-progressive-enhancement.md
│   │   ├── 004-testing-strategy.md
│   │   ├── 005-observability.md
│   │   └── 006-htmx-conventions.md
│   ├── ARCHITECTURE.md               # This file
│   └── HTMX_PATTERNS.md              # HTMX usage patterns
├── src/
│   ├── domain/                       # Domain Layer
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── events/
│   │   └── repositories/             # Interfaces only
│   ├── application/                  # Application Layer
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── services/
│   │   └── dtos/
│   ├── infrastructure/               # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   └── mappers/
│   │   └── i18n/
│   ├── presentation/                 # Presentation Layer
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── validators/
│   ├── config/                       # Configuration
│   │   ├── di-container.ts
│   │   ├── express.config.ts
│   │   ├── logger.config.ts
│   │   └── telemetry.config.ts
│   ├── app.ts                        # Express app setup
│   └── server.ts                     # Entry point
├── views/                            # EJS Templates
│   ├── layouts/
│   │   └── main.ejs
│   ├── pages/
│   │   ├── auth/
│   │   ├── tasks/
│   │   └── dashboard/
│   └── partials/
│       ├── tasks/
│       └── ui/
├── public/                           # Static assets
│   ├── css/
│   │   └── tailwind.css
│   └── js/
│       ├── htmx.min.js
│       └── alpine.min.js
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── e2e/                          # Playwright tests
│   ├── fixtures/                     # Test data
│   └── helpers/                      # Test utilities
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Key Design Decisions

### 1. SSR Pure Architecture
**Decision**: Use server-side rendering with EJS templates instead of SPA.

**Rationale**:
- ✅ Better SEO (HTML rendered server-side)
- ✅ Faster TTI (no JavaScript bundle download/parse)
- ✅ Works without JavaScript (accessibility)
- ✅ Simpler mental model (no client state management)

**See**: [ADR-001: SSR Pure Architecture](./adr/001-ssr-pure-architecture.md)

### 2. Progressive Enhancement with HTMX
**Decision**: Use HTMX for partial page updates, Alpine.js for local UI state.

**Rationale**:
- ✅ No full page reloads for common actions
- ✅ Small JavaScript footprint (~30KB total)
- ✅ Server-centric (backend developers productive)
- ✅ Degrades gracefully when JavaScript disabled

**See**: [ADR-003: Progressive Enhancement](./adr/003-progressive-enhancement.md)

### 3. CQRS Pattern
**Decision**: Separate read (queries) and write (commands) operations.

**Rationale**:
- ✅ Clear separation of concerns
- ✅ Optimized query models for reads
- ✅ Scalable (can separate read/write databases later)
- ✅ Testable (mock commands/queries independently)

### 4. Dependency Injection with TSyringe
**Decision**: Use decorator-based DI container.

**Rationale**:
- ✅ Loose coupling between layers
- ✅ Easy to test (inject mocks)
- ✅ Type-safe (compile-time checking)
- ✅ Familiar pattern (Spring/NestJS developers)

### 5. OpenTelemetry for Observability
**Decision**: Use OpenTelemetry for logs, traces, and metrics.

**Rationale**:
- ✅ Vendor-neutral (switch backends easily)
- ✅ Industry standard (CNCF project)
- ✅ Comprehensive (all three pillars)
- ✅ Auto-instrumentation available

**See**: [ADR-005: Observability](./adr/005-observability.md)

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server (with hot reload)
npm run dev

# Access application
open http://localhost:3000
```

### Testing
```bash
# Run unit and integration tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e:browser

# Run specific test file
npm test src/domain/entities/Task.test.ts
```

### Building for Production
```bash
# Build CSS
npm run css:build

# Compile TypeScript
npm run build

# Start production server
npm start
```

## API Conventions

### REST Endpoints
```
GET    /tasks              → List tasks (with filters)
GET    /tasks/new          → Show create form
POST   /tasks              → Create task
GET    /tasks/:id          → Show task detail
GET    /tasks/:id/edit     → Show edit form
POST   /tasks/:id          → Update task
POST   /tasks/:id/delete   → Delete task
```

### HTMX Partial Endpoints
```
Same routes, but:
- Check `HX-Request` header
- Return HTML fragments instead of full pages
- No layout rendering
```

### Response Format

**Full Page Request:**
```typescript
res.render('pages/tasks/index', {
  tasks,
  user,
  t,
  locale
});
```

**HTMX Partial Request:**
```typescript
if (req.isHtmx) {
  res.render('partials/tasks/task-list', {
    tasks,
    layout: false
  });
}
```

## Accessibility Guidelines

### WCAG 2.2 AA Requirements
- ✅ Semantic HTML (h1-h6, nav, main, article)
- ✅ Keyboard navigation (all interactive elements)
- ✅ ARIA labels and roles
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ Focus indicators visible
- ✅ Form labels and error messages
- ✅ Screen reader announcements for dynamic updates

### HTMX Accessibility
```html
<!-- ARIA live regions for dynamic content -->
<div hx-get="/tasks" 
     hx-target="#task-list" 
     aria-live="polite" 
     aria-atomic="false">
  <div id="task-list" role="list"></div>
</div>

<!-- Focus management after updates -->
<button hx-post="/tasks" 
        hx-swap="outerHTML" 
        hx-on::after-swap="this.focus()">
  Create
</button>
```

## Performance Targets

| Metric | Target | Measured With |
|--------|--------|---------------|
| Time to Interactive (TTI) | < 2s | Lighthouse |
| First Contentful Paint (FCP) | < 1s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Total Blocking Time (TBT) | < 200ms | Lighthouse |
| Lighthouse Performance Score | > 90 | Lighthouse |
| API Response Time (P95) | < 500ms | OpenTelemetry |
| Database Query Time (P95) | < 100ms | OpenTelemetry |

## Security Considerations

### Authentication
- Session-based authentication (connect-pg-simple)
- HttpOnly, Secure, SameSite cookies
- CSRF protection for all mutating requests

### Input Validation
- Server-side validation (Zod schemas)
- Client-side validation (UX only, not security)
- Sanitize all user input

### Security Headers
```typescript
// Helmet middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // HTMX requires unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

### Rate Limiting
```typescript
// Express rate limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.use('/api', limiter);
```

## Deployment

### Docker Production Build
```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY views/ ./views/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/taskflow

# Session
SESSION_SECRET=your-secret-key

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadog.com
LOG_LEVEL=info
```

### Health Checks
```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Contributing

### Code Review Checklist
- [ ] ADRs followed (SSR, HTMX, progressive enhancement)
- [ ] TypeScript strict mode passes
- [ ] Tests written and passing (85% coverage)
- [ ] HTMX elements have fallback behavior
- [ ] Accessibility requirements met (WCAG 2.2 AA)
- [ ] Error handling comprehensive
- [ ] Logging includes context
- [ ] Documentation updated

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, refactor, test, perf, style, chore

**Example**:
```
feat(tasks): add HTMX-powered task filters

- Implement active search with debouncing
- Add status and priority filter dropdowns
- Server returns HTML fragments for partial updates
- Maintains full-page fallback for non-JS users

Closes #42
```

## References

### Documentation
- [Architecture Decision Records](./adr/)
- [HTMX Patterns](./HTMX_PATTERNS.md)
- [Design System](./DESIGN_SYSTEM_V2.md)
- [API Documentation](./API.md)

### External Resources
- [HTMX Documentation](https://htmx.org/docs/)
- [Alpine.js Guide](https://alpinejs.dev/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

## Support

For questions or issues:
- Review [ADRs](./adr/) for architectural decisions
- Check [ROADMAP.md](../ROADMAP.md) for implementation status
- Consult team documentation in `docs/`

---

**Last Updated**: 2025-10-31  
**Next Review**: After Phase 4 completion
