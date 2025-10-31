# ADR-002: Technology Stack Selection

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Development Team  

## Context

We need to select specific technologies for each layer of the TaskFlow application. Choices must balance developer experience, performance, maintainability, and ecosystem maturity.

## Decision Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | Node.js | 24.9+ | Latest LTS, native ESM, performance improvements |
| **Language** | TypeScript | 5.7+ | Type safety, modern features, excellent tooling |
| **Web Framework** | Express | 5.x | Stable, minimal, excellent middleware ecosystem |
| **Database** | PostgreSQL | 18 | ACID compliance, JSON support, proven at scale |
| **ORM** | Prisma | 6.x | Type-safe queries, great migrations, modern DX |
| **Templates** | EJS | 3.1+ | Simple, no DSL, familiar syntax |
| **CSS Framework** | Tailwind CSS | 4.x | Utility-first, small bundle, design system ready |
| **Component Library** | DaisyUI | 5.3.7 | Pre-built components, glassmorphism support |
| **Client Interactivity** | HTMX | 1.9+ | Partial updates, minimal JavaScript |
| **Client State** | Alpine.js | 3.x | Lightweight reactive components |
| **Dependency Injection** | TSyringe | 4.8+ | Decorator-based, simple, type-safe |
| **Validation** | Zod | 3.23+ | TypeScript-first schema validation |
| **Testing (Unit/Integration)** | Vitest | 3.x | Fast, Vite-powered, great DX |
| **Testing (E2E)** | Playwright | 1.56+ | Cross-browser, reliable, developer-friendly |
| **Logging** | Pino | 9.x | Fastest logger, structured JSON |
| **Observability** | OpenTelemetry | 0.54+ | Vendor-neutral, industry standard |

## Detailed Rationale

### Backend Stack

#### Node.js 24.9+ (LTS)
**Why:**
- Native ECMAScript Modules (ESM) support
- Performance improvements (V8 12.4+)
- Security updates and long-term support until April 2027
- Built-in test runner (backup for Vitest)

**Alternatives Considered:**
- Bun 1.x: Too new, ecosystem compatibility issues
- Deno 2.x: Less enterprise adoption, different security model

#### TypeScript 5.7+
**Why:**
- Type safety prevents entire classes of runtime errors
- Excellent IDE support (autocomplete, refactoring)
- Modern features: decorators, const type parameters
- Strict mode enforces best practices

**Configuration:**
```json
{
  "strict": true,
  "target": "ES2024",
  "module": "ESNext",
  "moduleResolution": "bundler"
}
```

#### Express 5.x
**Why:**
- Mature (13+ years), battle-tested
- Minimal framework, not opinionated
- Vast middleware ecosystem
- Familiar to most Node.js developers
- New in v5: Async/await support, improved error handling

**Alternatives Considered:**
- Fastify: Faster but less ecosystem maturity
- Koa: Too minimal, lacks built-in features
- Hono: Too new for enterprise projects

### Database Layer

#### PostgreSQL 18
**Why:**
- ACID compliance for data integrity
- JSON/JSONB support for flexible schemas
- Excellent performance (btree indexes, query planner)
- Proven at scale (GitHub, Instagram use it)
- Advanced features: CTEs, window functions, full-text search

**Configuration:**
```yaml
# Optimized for development
shared_buffers: 256MB
max_connections: 100
work_mem: 4MB
```

#### Prisma 6.x
**Why:**
- **Type Safety**: Generated types match database schema exactly
- **Migrations**: Declarative schema with automatic migration generation
- **Developer Experience**: Prisma Studio for database GUI
- **Modern**: First-class TypeScript support

**Example:**
```typescript
// Fully typed query
const tasks = await prisma.task.findMany({
  where: { assigneeId: userId },
  include: { assignee: true }
});
// tasks: Task[] with assignee: User | null
```

**Alternatives Considered:**
- TypeORM: Decorator-heavy, less type-safe
- Drizzle: Newer, less ecosystem support
- Kysely: SQL-first, steeper learning curve

### Frontend Stack

#### EJS 3.1+
**Why:**
- **Simple**: No JSX/DSL to learn, just HTML + `<% %>` tags
- **Flexible**: Supports layouts, partials, includes
- **Fast**: Compiles to plain JavaScript functions
- **Ecosystem**: Works with Express out of the box

**Example:**
```ejs
<% if (user) { %>
  <p>Welcome, <%= user.name %>!</p>
<% } else { %>
  <a href="/login">Login</a>
<% } %>
```

**Alternatives Considered:**
- Handlebars: Less flexible, logic-less limits reusability
- Pug: DSL increases learning curve
- Nunjucks: More complex, less ecosystem support

#### Tailwind CSS 4.x
**Why:**
- **Utility-First**: Rapid prototyping, consistent design
- **Performance**: Purges unused CSS (< 10KB in production)
- **Design Tokens**: Easy to implement design system
- **DX**: JIT compiler, autocomplete, IntelliSense

**v4 New Features:**
- CSS-first configuration (no JS config)
- Improved @apply directive
- Better performance

#### DaisyUI 5.3.7
**Why:**
- Pre-built components (buttons, cards, modals)
- Glassmorphism theme support
- Tailwind CSS plugin (seamless integration)
- Accessibility built-in (ARIA attributes)

#### HTMX 1.9+
**Why:**
- **Minimal**: ~14KB minified
- **Progressive Enhancement**: Adds AJAX to HTML
- **Server-Centric**: Backend returns HTML, not JSON
- **No Build Step**: CDN or self-hosted

**Key Features:**
```html
<button hx-post="/tasks" hx-target="#task-list">
  Add Task
</button>
<!-- Server returns HTML that replaces #task-list -->
```

#### Alpine.js 3.x
**Why:**
- **Lightweight**: ~15KB, no build step
- **Reactive**: Vue-like syntax for local state
- **Composable**: Works alongside HTMX
- **No Virtual DOM**: Direct DOM manipulation

**Use Cases:**
- Modals, dropdowns, tabs
- Client-side form validation
- UI state (theme toggle, filters)

### Architecture & Quality

#### TSyringe 4.8+
**Why:**
- **Decorator-Based**: Clean, declarative DI
- **Type-Safe**: Compile-time checking
- **Lightweight**: ~10KB
- **Standard**: Uses TypeScript decorators

**Example:**
```typescript
@injectable()
class TaskService {
  constructor(
    @inject(TaskRepository) private taskRepo: TaskRepository
  ) {}
}
```

#### Zod 3.23+
**Why:**
- **TypeScript-First**: Infers types from schemas
- **Composable**: Reusable validation schemas
- **Excellent Errors**: Detailed, actionable messages
- **Runtime Safety**: Validates at API boundaries

**Example:**
```typescript
const TaskSchema = z.object({
  title: z.string().min(3).max(200),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  dueDate: z.date().optional()
});
```

### Testing Stack

#### Vitest 3.x
**Why:**
- **Fast**: Vite-powered, instant HMR
- **Compatible**: Jest-like API, easy migration
- **ESM Native**: No configuration needed
- **Great DX**: UI, coverage, watch mode

#### Playwright 1.56+
**Why:**
- **Multi-Browser**: Chromium, Firefox, WebKit
- **Reliable**: Auto-wait, web-first assertions
- **Developer Tools**: Codegen, trace viewer, inspector
- **Docker Support**: Consistent CI/CD environment

### Observability

#### Pino 9.x
**Why:**
- **Performance**: Fastest JSON logger (5x faster than Winston)
- **Structured**: JSON output for log aggregation
- **Transports**: Easy integration with monitoring services
- **Child Loggers**: Request context tracking

#### OpenTelemetry 0.54+
**Why:**
- **Vendor-Neutral**: Works with any APM (Datadog, New Relic, etc.)
- **Standards-Based**: CNCF project, industry standard
- **Comprehensive**: Traces, metrics, logs
- **Auto-Instrumentation**: Minimal code changes

## Consequences

### Positive
- Modern, type-safe development experience
- Excellent ecosystem support and documentation
- Long-term stability (LTS versions)
- Clear upgrade paths

### Negative
- Team must learn HTMX and Alpine.js (new paradigm)
- Prisma generates code (larger node_modules)
- TypeScript compilation step (mitigated by tsx in dev)

### Risk Mitigation
- **Documentation**: Create ADRs, HTMX pattern library
- **Training**: Team workshops on HTMX/Alpine.js
- **Code Reviews**: Enforce patterns and best practices

## Validation Criteria

- [ ] All dependencies receive active maintenance
- [ ] No critical security vulnerabilities (npm audit)
- [ ] TypeScript strict mode passes
- [ ] Test coverage > 85%
- [ ] Build time < 30s

## References
- [Node.js 24 Release Notes](https://nodejs.org/en/blog/release/v24.0.0)
- [TypeScript 5.7 Announcement](https://devblogs.microsoft.com/typescript/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [HTMX Essays](https://htmx.org/essays/)
- [Alpine.js Documentation](https://alpinejs.dev/)
