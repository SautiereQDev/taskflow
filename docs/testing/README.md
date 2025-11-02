# Testing Guide - TaskFlow

**Last Updated**: 2 novembre 2025  
**Test Coverage Target**: >85%  
**Testing Framework**: Vitest + Playwright

## 📊 Test Overview

### Test Statistics

- **Total Test Files**: 14
- **Unit Tests**: 8 files
- **Integration Tests**: 3 files
- **E2E Tests**: 3 files
- **Total Tests**: 70+ individual test cases

### Coverage by Layer

- ✅ **Domain Layer**: User, Task entities
- ✅ **Application Layer**: Services, Commands, Queries
- ✅ **Infrastructure Layer**: Repositories
- ✅ **Presentation Layer**: Controllers
- ✅ **End-to-End**: Complete user workflows

---

## 🧪 Test Structure

```
tests/
├── unit/
│   ├── domain/
│   │   ├── User.test.ts                    # User entity tests
│   │   └── Task.test.ts                    # Task entity tests
│   ├── services/
│   │   ├── AuthenticationService.test.ts   # Auth logic
│   │   ├── PasswordHashingService.test.ts  # Password hashing
│   │   ├── TaskAssignmentService.test.ts   # Task assignment rules
│   │   └── DashboardMetricsService.test.ts # Stats calculations
│   └── controllers/
│       └── TaskEditPage.test.ts            # Edit page data transformations
├── integration/
│   ├── database/
│   │   ├── UserRepository.integration.test.ts
│   │   └── TaskRepository.integration.test.ts
│   └── controllers/
│       ├── AuthController.test.ts
│       └── TaskController.edit.test.ts
└── e2e/
    ├── auth-diagnostics.spec.ts           # Auth flow diagnostics
    ├── task-edit.spec.ts                  # Task edit interactions
    └── user-journey.spec.ts               # Complete user workflow
```

---

## 🚀 Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm test -- tests/unit
```

### Integration Tests Only

```bash
npm test -- tests/integration
```

### Specific Test File

```bash
npm test -- tests/unit/services/AuthenticationService.test.ts
```

### With Coverage

```bash
npm test -- --coverage
```

### Watch Mode (Development)

```bash
npm test -- --watch
```

---

## 🎭 E2E Tests (Playwright)

### Prerequisites

1. Application must be running:

   ```bash
   docker compose up
   ```

2. Wait for healthy status:
   ```bash
   docker compose ps
   ```

### Running E2E Tests

**All E2E Tests**:

```bash
npm run test:e2e:browser
```

**Specific Test File**:

```bash
npm run test:e2e:browser -- tests/e2e/user-journey.spec.ts
```

**Headed Mode (with browser visible)**:

```bash
npx playwright test --headed
```

**Debug Mode**:

```bash
npx playwright test --debug
```

**Specific Browser**:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## 📝 Test Descriptions

### Unit Tests

#### Domain Tests

**User.test.ts**:

- User entity creation and validation
- Email value object validation
- Password value object rules
- Role validation

**Task.test.ts**:

- Task entity creation
- Status transitions (TODO → IN_PROGRESS → DONE)
- Priority validation
- Due date handling

#### Service Tests

**AuthenticationService.test.ts**:

- User login flow
- Password verification
- Session management
- Invalid credentials handling

**PasswordHashingService.test.ts**:

- Password hashing with bcrypt
- Hash verification
- Salt rounds configuration

**TaskAssignmentService.test.ts**:

- Task assignment logic
- Reassignment rules
- Unassignment handling

**DashboardMetricsService.test.ts**:

- Task statistics calculation
- Status distribution
- Priority breakdown
- Completion rate

**TaskEditPage.test.ts**:

- Date formatting (ISO → datetime-local)
- Task data transformation
- View model preparation
- Special characters handling

---

### Integration Tests

#### Database Tests

**UserRepository.integration.test.ts**:

- CRUD operations with real database
- Query filtering and pagination
- Email uniqueness constraints
- Soft delete functionality

**TaskRepository.integration.test.ts**:

- Task CRUD with relations
- Complex queries (filters, search, pagination)
- Task statistics queries
- Creator/assignee relationships

#### Controller Tests

**AuthController.test.ts**:

- Login endpoint (POST /auth/login)
- Register endpoint (POST /auth/register)
- Logout endpoint (POST /auth/logout)
- Session cookie handling
- Error responses (401, 403, 400)

**TaskController.edit.test.ts**:

- Edit page rendering (GET /tasks/:id/edit)
- Pre-filled form data
- Users dropdown population
- HTMX attributes
- Alpine.js initialization
- Authentication requirements
- 404 handling

---

### E2E Tests

#### auth-diagnostics.spec.ts

- Login page accessibility
- Form submission
- Cookie validation
- Session persistence
- Redirect behavior

#### task-edit.spec.ts (23 tests)

- Navigation to edit page
- Breadcrumb functionality
- Form pre-population
- Alpine.js character counters
- Real-time validation
- HTMX form submission
- Loading states
- Delete confirmation
- Language switching
- Responsive design

#### user-journey.spec.ts (17 tests)

**Complete User Workflow**:

1. ✅ Load home page
2. ✅ Register new user
3. ✅ Login with credentials
4. ✅ View dashboard
5. ✅ Navigate to tasks list
6. ✅ Create new task
7. ✅ View task details
8. ✅ Edit task
9. ✅ Filter tasks by status
10. ✅ Search for tasks
11. ✅ Mark task as complete
12. ✅ Delete task
13. ✅ View user profile
14. ✅ Access settings
15. ✅ Switch theme
16. ✅ Logout
17. ✅ Verify 404 page

---

## 🔧 Test Configuration

### Vitest Configuration

**File**: `vitest.config.ts`

Key settings:

- Test environment: Node.js
- Coverage provider: v8
- Coverage thresholds: 85%
- Path aliases resolved
- Mock setup files

### Playwright Configuration

**File**: `playwright.config.ts`

Key settings:

- Base URL: http://localhost:3000
- Browsers: Chromium, Firefox, WebKit
- Screenshot on failure
- Video on retry
- Trace on first retry

---

## 🎯 Test Patterns

### Unit Test Pattern

```typescript
import { describe, it, expect } from 'vitest';

describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = service.method(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Test edge case
    });
  });
});
```

### Integration Test Pattern

```typescript
import supertest from 'supertest';
import { getTestApp, getTestPrisma, cleanupTestApp } from './test-app.factory';

describe('ControllerName Integration', () => {
  const app = getTestApp();
  const prisma = getTestPrisma();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await cleanupTestApp();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.task.deleteMany();
  });

  it('should handle request', async () => {
    const response = await supertest(app).get('/api/endpoint').expect(200);

    expect(response.body).toBeDefined();
  });
});
```

### E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user action', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:3000/page');

    // Interact
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL('/expected');
    await expect(page.locator('h1')).toContainText('Expected');
  });
});
```

---

## 🐛 Debugging Tests

### Vitest Debugging

```bash
# Run specific test with console output
npm test -- tests/unit/services/AuthenticationService.test.ts --reporter=verbose

# Run with Node debugger
node --inspect-brk node_modules/.bin/vitest run

# Then attach debugger in VS Code
```

### Playwright Debugging

```bash
# UI Mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test --debug tests/e2e/user-journey.spec.ts

# Trace viewer (after test run)
npx playwright show-trace trace.zip
```

---

## 📊 Coverage Reports

### Generate Coverage

```bash
npm test -- --coverage
```

### View HTML Report

```bash
# Generate coverage
npm test -- --coverage

# Open in browser
open coverage/index.html
```

### Coverage Targets

- **Statements**: >85%
- **Branches**: >80%
- **Functions**: >85%
- **Lines**: >85%

---

## 🚨 Common Issues

### Issue: Database Connection Timeout

**Solution**:

```bash
# Start test database
docker compose up db-test

# Run migrations
DATABASE_URL="postgresql://test_user:test_password@localhost:5434/test_taskflow" npm run prisma:migrate
```

### Issue: E2E Tests Fail - App Not Running

**Solution**:

```bash
# Terminal 1: Start app
docker compose up

# Terminal 2: Wait for healthy status
docker compose ps

# Terminal 3: Run E2E tests
npm run test:e2e:browser
```

### Issue: HTMX Tests Fail

**Solution**:

- Increase timeouts in test
- Check for loading indicators
- Verify HTMX attributes in HTML
- Use `page.waitForTimeout()` after HTMX actions

### Issue: Flaky E2E Tests

**Solution**:

- Use proper wait conditions (`waitForURL`, `waitForSelector`)
- Avoid hardcoded `waitForTimeout` when possible
- Check for element visibility before interaction
- Verify network idle state

---

## 📚 Additional Resources

### Documentation

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](../docs/TESTING_BEST_PRACTICES.md)

### Related Docs

- `docs/testing/TASK_EDIT_TESTS.md` - Task edit page tests
- `docs/HTMX_PATTERNS.md` - HTMX testing patterns
- `docs/ARCHITECTURE.md` - Application architecture

---

## ✅ Test Checklist

Before committing code, ensure:

- [ ] All unit tests pass
- [ ] All integration tests pass (if DB changes)
- [ ] E2E tests pass (if UI changes)
- [ ] Coverage remains >85%
- [ ] No console errors in tests
- [ ] New features have tests
- [ ] Edge cases are covered

---

**Maintainer**: Development Team  
**Last Review**: 2 novembre 2025  
**Status**: ✅ Active
