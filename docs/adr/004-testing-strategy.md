# ADR-004: Testing Strategy

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Development Team  

## Context

We need a comprehensive testing strategy that ensures code quality, prevents regressions, and provides confidence for refactoring. The strategy must align with our SSR architecture and progressive enhancement approach.

## Decision

**We will implement a Testing Pyramid strategy with 85% minimum coverage:**

```
        /\
       /  \  E2E Tests (10%)
      /----\  - Playwright
     /      \  - Critical user journeys
    /--------\ Integration Tests (25%)
   /          \ - Repository + Database
  /------------\ - Service orchestration
 /______________\ Unit Tests (65%)
                  - Domain logic
                  - Business rules
                  - Pure functions
```

## Testing Levels

### 1. Unit Tests (65% of tests)

**Scope**: Test individual units in isolation (functions, classes, methods)

**Tools**: Vitest + Mock Implementations

**Coverage Target**: >90% for domain and application layers

#### What to Test

**✅ Domain Layer**
- Entity business logic
- Value object validation
- Domain events

```typescript
// Example: Task entity
describe('Task Entity', () => {
  describe('assign()', () => {
    it('should assign task to user', () => {
      const task = new Task({ title: 'Test', status: TaskStatus.TODO });
      const assignee = new User({ email: 'user@example.com' });
      
      task.assign(assignee);
      
      expect(task.assigneeId).toBe(assignee.id);
      expect(task.domainEvents).toContainEqual(
        new TaskAssignedEvent(task.id, assignee.id)
      );
    });
    
    it('should not assign completed task', () => {
      const task = new Task({ title: 'Test', status: TaskStatus.DONE });
      const assignee = new User({ email: 'user@example.com' });
      
      expect(() => task.assign(assignee)).toThrow(
        'Cannot assign completed task'
      );
    });
  });
});
```

**✅ Application Layer (Commands/Queries)**
- Command handler logic
- Query handler logic
- Service orchestration

```typescript
// Example: CreateTaskHandler
describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let mockTaskRepo: jest.Mocked<ITaskRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  
  beforeEach(() => {
    mockTaskRepo = createMockTaskRepository();
    mockUserRepo = createMockUserRepository();
    handler = new CreateTaskHandler(mockTaskRepo, mockUserRepo);
  });
  
  it('should create task with valid data', async () => {
    const command = new CreateTaskCommand({
      title: 'Test Task',
      assigneeId: 'user-123'
    });
    
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockTaskRepo.create.mockResolvedValue(mockTask);
    
    const result = await handler.handle(command);
    
    expect(result).toBeDefined();
    expect(mockTaskRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Task' })
    );
  });
  
  it('should throw error if assignee not found', async () => {
    const command = new CreateTaskCommand({
      title: 'Test Task',
      assigneeId: 'invalid-user'
    });
    
    mockUserRepo.findById.mockResolvedValue(null);
    
    await expect(handler.handle(command)).rejects.toThrow(
      'Assignee not found'
    );
  });
});
```

**✅ Utilities & Helpers**
- Pure functions
- Formatters
- Validators

```typescript
// Example: Date formatter
describe('formatDate()', () => {
  it('should format date in French locale', () => {
    const date = new Date('2025-10-31T10:00:00Z');
    expect(formatDate(date, 'fr')).toBe('31 octobre 2025');
  });
  
  it('should format date in English locale', () => {
    const date = new Date('2025-10-31T10:00:00Z');
    expect(formatDate(date, 'en')).toBe('October 31, 2025');
  });
});
```

#### What NOT to Test
- ❌ Third-party library internals (Prisma, Express)
- ❌ Simple getters/setters without logic
- ❌ Configuration files
- ❌ Type definitions

### 2. Integration Tests (25% of tests)

**Scope**: Test interaction between multiple components

**Tools**: Vitest + Test Database + Supertest

**Coverage Target**: >85% for repositories and services

#### Repository Integration Tests

```typescript
// Test with real database
describe('PrismaTaskRepository (Integration)', () => {
  let repository: PrismaTaskRepository;
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    // Setup test database
    prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL_TEST
    });
    repository = new PrismaTaskRepository(prisma);
    
    // Run migrations
    await execSync('npx prisma migrate deploy');
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  beforeEach(async () => {
    // Clean database before each test
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });
  
  describe('findById()', () => {
    it('should return task with relations', async () => {
      // Arrange
      const user = await prisma.user.create({
        data: { email: 'test@example.com', password: 'hashed' }
      });
      const task = await prisma.task.create({
        data: { 
          title: 'Test Task', 
          status: 'TODO',
          assigneeId: user.id 
        }
      });
      
      // Act
      const result = await repository.findById(task.id);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.assignee).toBeDefined();
      expect(result.assignee.email).toBe('test@example.com');
    });
    
    it('should return null if not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });
  
  describe('findMany() with filters', () => {
    it('should filter by status', async () => {
      // Create test data
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', status: 'TODO' },
          { title: 'Task 2', status: 'IN_PROGRESS' },
          { title: 'Task 3', status: 'TODO' }
        ]
      });
      
      const result = await repository.findMany({
        status: 'TODO',
        page: 1,
        limit: 10
      });
      
      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
```

#### API Integration Tests

```typescript
// Test API endpoints with Supertest
describe('POST /tasks (Integration)', () => {
  let app: Express;
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    app = createTestApp();
    prisma = getPrismaClient();
  });
  
  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });
  
  it('should create task and return 201', async () => {
    // Create authenticated user
    const user = await prisma.user.create({
      data: { email: 'test@example.com', password: 'hashed' }
    });
    const token = generateTestToken(user);
    
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Task',
        status: 'TODO',
        priority: 'MEDIUM'
      })
      .expect(201);
    
    expect(response.body).toMatchObject({
      title: 'New Task',
      status: 'TODO',
      priority: 'MEDIUM'
    });
    
    // Verify database
    const task = await prisma.task.findFirst({
      where: { title: 'New Task' }
    });
    expect(task).toBeDefined();
  });
  
  it('should return 400 for invalid data', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', password: 'hashed' }
    });
    const token = generateTestToken(user);
    
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'AB', // Too short
        status: 'INVALID_STATUS'
      })
      .expect(400);
    
    expect(response.body.errors).toBeDefined();
  });
  
  it('should return 401 for unauthenticated request', async () => {
    await request(app)
      .post('/tasks')
      .send({ title: 'New Task', status: 'TODO' })
      .expect(401);
  });
});
```

### 3. E2E Tests (10% of tests)

**Scope**: Test complete user journeys from browser perspective

**Tools**: Playwright + Docker + Test Database

**Coverage Target**: Critical user paths only

#### E2E Test Structure

```typescript
// tests/e2e/task-management.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsUser, createTestUser } from './helpers/auth';

test.describe('Task Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create user and login
    const user = await createTestUser();
    await loginAsUser(page, user.email, 'password123');
  });
  
  test('User can create, edit, and delete a task', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks');
    await expect(page).toHaveTitle(/Tasks/);
    
    // Create task
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'Test E2E Task');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.click('button[type="submit"]');
    
    // Verify creation (with HTMX, no page reload)
    await expect(page.locator('.task-item').first()).toContainText('Test E2E Task');
    
    // Edit task
    await page.click('.task-item:has-text("Test E2E Task") button:has-text("Edit")');
    await page.fill('input[name="title"]', 'Updated Task Title');
    await page.click('button:has-text("Save")');
    
    // Verify update
    await expect(page.locator('.task-item').first()).toContainText('Updated Task Title');
    
    // Delete task
    await page.click('.task-item:has-text("Updated Task Title") button:has-text("Delete")');
    
    // Confirm in modal (Alpine.js)
    await page.click('.modal button:has-text("Confirm")');
    
    // Verify deletion
    await expect(page.locator('.task-item:has-text("Updated Task Title")')).not.toBeVisible();
  });
  
  test('Task filters work correctly', async ({ page }) => {
    // Create test data
    await createTaskViaAPI({ title: 'Todo Task', status: 'TODO' });
    await createTaskViaAPI({ title: 'In Progress Task', status: 'IN_PROGRESS' });
    await createTaskViaAPI({ title: 'Done Task', status: 'DONE' });
    
    await page.goto('/tasks');
    
    // Verify all tasks visible
    await expect(page.locator('.task-item')).toHaveCount(3);
    
    // Apply filter (HTMX request)
    await page.selectOption('select[name="status"]', 'TODO');
    await page.click('button:has-text("Apply Filters")');
    
    // Wait for HTMX to update
    await page.waitForResponse(response => 
      response.url().includes('/tasks') && response.status() === 200
    );
    
    // Verify filtered results
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-item')).toContainText('Todo Task');
  });
});

test.describe('Progressive Enhancement', () => {
  test('Task creation works without JavaScript', async ({ page, context }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);
    
    const user = await createTestUser();
    await loginAsUser(page, user.email, 'password123');
    
    await page.goto('/tasks');
    await page.click('a:has-text("New Task")'); // Link, not button
    
    await page.fill('input[name="title"]', 'No-JS Task');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.click('button[type="submit"]');
    
    // Should redirect and show task
    await expect(page.url()).toContain('/tasks');
    await expect(page.locator('.task-item')).toContainText('No-JS Task');
  });
});
```

#### Critical E2E Test Scenarios
1. ✅ User registration and login
2. ✅ Task CRUD operations
3. ✅ Task filtering and search
4. ✅ Task assignment workflow
5. ✅ Dashboard statistics display
6. ✅ Progressive enhancement (no-JS mode)
7. ✅ Error handling and validation
8. ✅ Session persistence

### 4. Visual Regression Tests (Optional)

**Tools**: Playwright Screenshots + Percy/Chromatic

```typescript
test('Dashboard layout matches snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

## Test Organization

### File Structure
```
src/
├── domain/
│   ├── entities/
│   │   ├── Task.ts
│   │   └── Task.test.ts          # Unit test (co-located)
│   └── value-objects/
│       ├── Email.ts
│       └── Email.test.ts
├── application/
│   ├── commands/
│   │   ├── CreateTaskHandler.ts
│   │   └── CreateTaskHandler.test.ts
│   └── queries/
├── infrastructure/
│   ├── repositories/
│   │   ├── PrismaTaskRepository.ts
│   │   └── PrismaTaskRepository.integration.test.ts  # Integration test
tests/
├── e2e/
│   ├── task-management.spec.ts
│   ├── authentication.spec.ts
│   └── helpers/
│       ├── auth.ts
│       └── fixtures.ts
├── fixtures/
│   ├── users.fixture.ts
│   └── tasks.fixture.ts
└── setup.ts                      # Global test setup
```

### Naming Conventions
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts`

## Test Data Management

### Fixtures
```typescript
// tests/fixtures/users.fixture.ts
export const testUserFixture = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN'
  },
  user: {
    email: 'user@example.com',
    password: 'user123',
    role: 'USER'
  }
};

// tests/fixtures/tasks.fixture.ts
export const testTaskFixture = {
  todo: {
    title: 'Test Todo Task',
    status: 'TODO',
    priority: 'MEDIUM'
  },
  inProgress: {
    title: 'Test In Progress Task',
    status: 'IN_PROGRESS',
    priority: 'HIGH'
  }
};
```

### Factory Functions
```typescript
// tests/helpers/factories.ts
export async function createTestUser(
  overrides?: Partial<User>
): Promise<User> {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: await hashPassword('password123'),
      ...overrides
    }
  });
}

export async function createTestTask(
  userId: string,
  overrides?: Partial<Task>
): Promise<Task> {
  return await prisma.task.create({
    data: {
      title: `Test Task ${Date.now()}`,
      status: 'TODO',
      creatorId: userId,
      ...overrides
    }
  });
}
```

## Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 85%
- **Domain Layer**: 90%
- **Application Layer**: 90%
- **Infrastructure Layer**: 80%
- **Presentation Layer (Controllers)**: 75%

### Coverage Tools
```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      },
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'tests/',
        'src/config/'
      ]
    }
  }
});
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run prisma:migrate
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e:browser
```

## Testing Best Practices

### ✅ DO
1. **Test behavior, not implementation**
2. **Use descriptive test names** (`it('should throw error when assignee not found')`)
3. **Follow AAA pattern** (Arrange, Act, Assert)
4. **Keep tests independent** (no shared state)
5. **Use factories for test data**
6. **Mock external dependencies** (APIs, file system)
7. **Test edge cases and error paths**

### ❌ DON'T
1. **Test third-party libraries**
2. **Write flaky tests** (random data, timing issues)
3. **Use magic numbers** (use constants)
4. **Test multiple things in one test**
5. **Rely on test execution order**
6. **Mock everything** (integration tests need real dependencies)

## Consequences

### Positive
- High confidence in code correctness
- Safe refactoring
- Living documentation
- Early bug detection
- Improved code quality

### Negative
- Initial setup time
- Test maintenance overhead
- Slower CI/CD pipeline
- Learning curve for team

### Risk Mitigation
- Invest in test utilities and helpers
- Use snapshot tests for complex UI
- Parallelize test execution
- Regular test review and cleanup

## Validation Criteria

- [ ] 85% code coverage achieved
- [ ] All critical user paths have E2E tests
- [ ] CI/CD pipeline runs all tests
- [ ] Test execution time < 5 minutes
- [ ] Zero flaky tests
- [ ] All tests documented

## References
- [Testing Pyramid - Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Desiderata - Kent Beck](https://kentbeck.github.io/TestDesiderata/)
