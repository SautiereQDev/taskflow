# TaskFlow - AI Coding Agent Instructions

## Architecture Overview

**3-Layer Pattern (Strictly Enforced)**
```
Controllers → Services → Repositories
```
- **Controllers** (`src/controllers/`): HTTP I/O, validation, thin orchestration
- **Services** (`src/services/`): Business logic, coordinate repositories
- **Repositories** (`src/repositories/`): Prisma queries only, no business logic

**Dependency Injection (tsyringe)**
```typescript
// Every injectable class must be registered in src/config/di-container.ts
@injectable()
export class TaskService {
  constructor(@inject(TaskRepository) private taskRepo: TaskRepository) {}
}
```
⚠️ **CRITICAL**: Import `@config/di-container.js` before any DI-registered classes in entry files.

## TypeScript & Build

**ESM-Only (Node 24.9+)**
- Must use `.js` extensions in imports: `import { foo } from './bar.js'` ✓
- Path aliases: `@config/`, `@controllers/`, `@services/`, `@repositories/`, `@middleware/`, `@utils/`, `@types/`, `@view-models/`
- Build chain: `npm run build` → CSS → tsc → tsc-alias → `scripts/add-js-extensions.mjs`

## Development Commands

```bash
npm run dev              # Hot reload (CSS watch + tsx watch with .env)
npm run css:build        # Build Tailwind v4 + DaisyUI
npm test                 # Vitest (85% coverage required)
npm run test:e2e:browser # Playwright E2E in Docker
npm run prisma:migrate   # Create & apply migrations
npm run prisma:generate  # Regenerate client after schema changes
```

## Glassmorphism Design System (Oct 2025)

**Tailwind v4 + DaisyUI 5.3.7** with custom glass themes (`tailwind.config.ts`):

**Surface Utilities**
```html
<div class="glass-light">  <!-- Subtle (sidebar, filters) -->
<div class="glass">        <!-- Standard (cards, panels) -->
<div class="glass-heavy">  <!-- Elevated (modals, overlays) -->
<div class="glass-hover">  <!-- Interactive (hover effects) -->
```

**Layout Utilities**
```html
<div class="tf-app-shell">       <!-- Main container -->
<main class="tf-main tf-stack">  <!-- Content area -->
<aside class="tf-aside">         <!-- Sidebar -->
<div class="tf-container">       <!-- Max-width wrapper -->
```

**Typography**
- Use `tf-text-primary`, `tf-text-secondary`, `tf-text-muted` (defined in `public/css/tailwind.css`)
- Avoid raw Tailwind colors - use design tokens

**Theme Switching**
- JS: `public/js/theme-switcher.js` (localStorage + `data-theme` attribute)
- Themes: `light` / `dark` via `html[data-theme="dark"]`
- Respects `prefers-reduced-motion` and `prefers-reduced-transparency`

📖 See `docs/GLASSMORPHISM_TRANSITION_MANUAL.md` for complete migration guide.

## SSR Views & i18n

**EJS Structure**
- Layout: `views/layouts/main.ejs` (includes head, header, footer, flash)
- Partials: `views/partials/` (reusable components like filters, cards)
- Pages: `views/pages/` (route-specific views)

**Rendering Pattern**
```typescript
res.render('pages/tasks/list', {
  tasks,
  user,
  t,      // Translation function
  __,     // Alias for translation
  locale  // Current language (fr/en)
});
```

**i18n (ALWAYS update both locales)**
- Files: `locales/fr.json`, `locales/en.json`
- Server: `req.t('key')` or `req.__('key')`
- Views: `t('key')` or `__('key')`
- Never hardcode text - use translation keys

## Authentication & Sessions

**PostgreSQL Session Store** (`connect-pg-simple`)
- Middleware order matters (see `src/app.ts`):
  1. `getSessionMiddleware()` - establishes session
  2. `getFlashMiddleware()` - flash message support
  3. `attachUser(authService)` - populates `req.user`
- Route protection: Use `requireAuth()` middleware
- Logout: Call `destroySession(req, res, callback)` utility (handles cleanup)
- Session data: `req.session.userId`, `req.user` (type: `IAuthenticatedRequest`)

## Database (Prisma)

**Workflow**
1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate` (creates + applies migration)
3. Run `npm run prisma:generate` (regenerates types)

**Common Patterns**
```typescript
// Repository - Prisma queries only
async findById(id: string): Promise<Task | null> {
  return this.prisma.task.findUnique({ 
    where: { id }, 
    include: { assignee: true, creator: true } 
  });
}

// Service - Business logic
async updateTask(id: string, data: IUpdateTaskDto): Promise<Task> {
  const task = await this.taskRepo.findById(id);
  if (!task) throw new AppError('Task not found', 404);
  return this.taskRepo.update(id, data);
}
```

## Error Handling & Logging

- Controllers: No try-catch needed (`express-async-errors` auto-catches)
- Services: Throw `AppError` or `Error` with descriptive messages
- Global handler: `src/middleware/error.middleware.ts`
- Logging: `import { logger } from '@utils/logger.util.js'`

## Testing

**Structure**
- Unit: `src/**/*.test.ts` (co-located with source)
- E2E: `tests/e2e/*.spec.ts` (Playwright)
- Setup: `src/test/setup.ts` (mocks Prisma, sessions)
- Auth helper: `tests/e2e/utils/auth.ts`
- Test credentials: `admin@example.com / admin123`

## Key Conventions

1. **DI Registration**: Register every service/controller/repository in `src/config/di-container.ts`
2. **Flash Messages**: Use `req.flash('success', 'Message')` and render via included partial
3. **Path Aliases**: Always use `@services/` not `../../services/`
4. **ESM Extensions**: Include `.js` in imports or build fails
5. **Prisma Relations**: Explicitly include relations in queries
6. **Docker Port**: PostgreSQL on `5433` (not 5432)

## Code Quality Standards

### TypeScript Best Practices
- **Strict mode enabled**: No `any`, `unknown` preferred over `any`
- **Explicit types**: Return types on all public methods
- **Type guards**: Use discriminated unions and type predicates
- **Generics**: Leverage type inference, avoid redundant annotations
- **Enums vs Unions**: Prefer `const` objects or string literal unions over enums

### Clean Code Principles

**Naming Conventions**
```typescript
// Classes: PascalCase
class TaskRepository {}

// Interfaces: PascalCase with 'I' prefix
interface ITaskFilters {}

// Functions/Methods: camelCase, verb-based
async getUserById(id: string): Promise<User>

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Private members: camelCase with underscore prefix
private _cachedData: Map<string, Task>;
```

**Function Design**
- **Single Responsibility**: One function, one purpose
- **Small functions**: Max 30 lines, ideally < 20
- **Max 3 parameters**: Use objects for > 3 params
- **Pure functions**: Avoid side effects when possible
- **Guard clauses**: Early returns for error cases

```typescript
// ✓ Good - Guard clauses, single responsibility
async updateTask(id: string, data: IUpdateTaskDto): Promise<Task> {
  if (!id) throw new AppError('Task ID required', 400);
  if (!data) throw new AppError('Update data required', 400);
  
  const task = await this.taskRepo.findById(id);
  if (!task) throw new AppError('Task not found', 404);
  
  return this.taskRepo.update(id, data);
}

// ✗ Bad - Nested conditions, multiple responsibilities
async updateTask(id: string, data: IUpdateTaskDto) {
  if (id) {
    const task = await this.taskRepo.findById(id);
    if (task) {
      if (data) {
        // validation logic mixed with business logic
        if (data.status && !['TODO','IN_PROGRESS','DONE'].includes(data.status)) {
          throw new Error('Invalid status');
        }
        return this.taskRepo.update(id, data);
      }
    } else {
      throw new Error('not found');
    }
  }
}
```

### Documentation Requirements

**JSDoc for Public APIs**
```typescript
/**
 * Retrieves paginated tasks with optional filtering
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Items per page (default: 10, max: 100)
 * @param filters - Optional filters for status, priority, assignee
 * @returns Paginated task list with total count
 * @throws {AppError} 400 if pagination params invalid
 * @throws {AppError} 404 if assignee not found
 * 
 * @example
 * ```typescript
 * const result = await taskService.getAllTasks(1, 20, { 
 *   status: 'IN_PROGRESS',
 *   assigneeId: 'user-123' 
 * });
 * ```
 */
async getAllTasks(
  page = 1, 
  limit = 10, 
  filters?: TaskFilters
): Promise<IPaginatedTasks>
```

**Inline Comments**
- Explain **why**, not **what**
- Document business rules and edge cases
- Reference external docs/tickets when relevant
```typescript
// WCAG 2.2 AA requires minimum 4.5:1 contrast ratio
const minContrastRatio = 4.5;

// Workaround for Prisma issue - cascading deletes not working
await this.prisma.task.deleteMany({ where: { projectId } });
```

### Error Handling Excellence

**Service Layer**
```typescript
// ✓ Descriptive errors with context
throw new AppError('Cannot assign task: user is inactive', 400, {
  userId,
  taskId,
  userStatus: user.status
});

// ✗ Generic errors
throw new Error('Invalid user');
```

**Controller Layer**
```typescript
// ✓ No try-catch needed (express-async-errors handles it)
async create(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.createTask(req.body);
  res.status(201).json(task);
}

// ✗ Unnecessary error handling
async create(req: Request, res: Response) {
  try {
    const task = await this.taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed' }); // Don't do this!
  }
}
```

**Validation**
```typescript
// Use express-validator for input validation
const taskValidationRules = [
  body('title').trim().notEmpty().isLength({ min: 3, max: 200 }),
  body('status').isIn(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601()
];
```

### Testing Requirements

**Coverage Threshold: 85%**
- Unit tests for all services and repositories
- Integration tests for critical workflows
- E2E tests for user journeys

**Test Structure**
```typescript
describe('TaskService.createTask', () => {
  it('should create task with valid data', async () => {
    // Arrange
    const taskData = { title: 'Test', status: 'TODO' };
    
    // Act
    const result = await taskService.createTask(taskData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe('Test');
  });
  
  it('should throw AppError when assignee not found', async () => {
    const taskData = { title: 'Test', assigneeId: 'invalid' };
    
    await expect(taskService.createTask(taskData))
      .rejects
      .toThrow(AppError);
  });
});
```

### Logging Best Practices

**Structured Logging**
```typescript
// ✓ Good - Structured with context
logger.info('Task created', {
  taskId: task.id,
  userId: req.user.id,
  requestId: req.id,
  duration: Date.now() - startTime
});

// ✗ Bad - Unstructured strings
console.log(`User ${userId} created task ${taskId}`);
```

**Log Levels**
- `error`: Exceptions, failures requiring attention
- `warn`: Deprecated features, recoverable issues
- `info`: Important business events (task created, user logged in)
- `debug`: Development debugging (not in production)

### Performance Optimization

**Database Queries**
```typescript
// ✓ Efficient - Select only needed fields
const tasks = await this.prisma.task.findMany({
  select: { id: true, title: true, status: true },
  where: { assigneeId }
});

// ✗ Inefficient - Fetching all fields
const tasks = await this.prisma.task.findMany({
  where: { assigneeId }
});

// ✓ Use pagination for large datasets
const tasks = await this.prisma.task.findMany({
  take: limit,
  skip: (page - 1) * limit
});
```

**Avoid N+1 Queries**
```typescript
// ✓ Good - Single query with include
const tasks = await this.prisma.task.findMany({
  include: { assignee: true, creator: true }
});

// ✗ Bad - N+1 problem
const tasks = await this.prisma.task.findMany();
for (const task of tasks) {
  task.assignee = await this.prisma.user.findUnique({ 
    where: { id: task.assigneeId } 
  });
}
```

### Security Best Practices

- **Input Validation**: Always validate and sanitize user input
- **SQL Injection**: Use Prisma parameterized queries (never raw SQL)
- **XSS Prevention**: EJS auto-escapes by default, use `<%- %>` only for trusted HTML
- **Session Security**: Secure cookies in production, rotate session secrets
- **Password Hashing**: bcrypt with salt rounds ≥ 12
- **Rate Limiting**: Implement for auth endpoints

### Git Commit Standards

**Conventional Commits**
```bash
feat(tasks): add priority filtering to task list
fix(auth): resolve session persistence issue on logout
docs(readme): update database setup instructions
refactor(services): extract task validation logic
test(tasks): add e2e tests for task CRUD operations
perf(db): optimize task queries with selective includes
style(css): apply glassmorphism to dashboard cards
```

### Code Review Checklist

Before submitting code, verify:
- [ ] All tests passing (`npm test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] TypeScript strict mode satisfied
- [ ] JSDoc on all public methods
- [ ] Error cases handled with descriptive messages
- [ ] i18n keys added to both `fr.json` and `en.json`
- [ ] Database migrations tested
- [ ] No `console.log` or debugging code
- [ ] Glassmorphism utilities used (not raw Tailwind)
- [ ] Path aliases used (not relative imports)

## Quick Reference

- **New Feature**: Controller → Service → Repository (bottom-up), register in DI
- **DB Schema**: Edit schema → migrate → generate
- **New Route**: Add to `src/routes/`, import in `src/routes/index.ts`
- **CSS Changes**: Use glass utilities, update `public/css/tailwind.css` if needed
- **i18n**: Add keys to BOTH `locales/fr.json` and `locales/en.json`

📚 **Documentation**: 
- `docs/DESIGN_SYSTEM_V2.md` - Design system blueprint
- `docs/GLASSMORPHISM_TRANSITION_MANUAL.md` - UI implementation guide
- `README.md` - Complete setup and usage
