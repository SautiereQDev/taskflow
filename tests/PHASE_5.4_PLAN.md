# Phase 5.4: Controller Integration Tests - Detailed Plan

**Status**: Infrastructure Complete, Ready for Implementation  
**Created**: October 31, 2025  
**Target**: >85% controller layer coverage with ~50-60 integration tests

## 🎯 Overview

Phase 5.4 focuses on integration testing of the HTTP presentation layer using **supertest** to test Express controllers, routes, middleware, and session management. These tests verify the complete request-response cycle from HTTP endpoint to database.

## ✅ Infrastructure Complete

### Test Framework Setup
- ✅ **test-app.factory.ts**: Creates Express app instance for testing with DI container
- ✅ **auth.helpers.ts**: Authentication utilities (createTestUser, loginAndGetCookie, cleanupTestUsers)
- ✅ **AuthController.test.ts**: Minimal test structure (1 test, ready to expand)
- ✅ **Supertest installed**: Version 7.1.4 with TypeScript types
- ✅ **Database configuration**: Test database URL configured (needs DB running)

### Source File Fixes Applied
- ✅ Fixed `PrismaService.ts` file corruption (merged content removed)
- ✅ Fixed `UpdateUserHandler.ts` file corruption  
- ✅ Created `CreateUserHandler.ts` (was missing)
- ✅ Fixed AppError import paths in query handlers (errors.util.js → AppError.js)
- ✅ DI container loads successfully

### Verification Status
```bash
npm test tests/integration/controllers/AuthController.test.ts
# ✅ Code compiles successfully
# ✅ DI container initializes
# ✅ Test structure loads
# ⚠️  Needs: Database connection (start Docker container)
```

## 📋 Implementation Plan

### Step 1: Database Setup (5-10 minutes)

**Goal**: Start test database and verify connection

**Actions**:
1. Start Docker containers:
   ```bash
   docker-compose up -d postgres
   ```

2. Verify database is running:
   ```bash
   docker ps | grep postgres
   ```

3. Run migrations if needed:
   ```bash
   npm run prisma:migrate
   ```

4. Test database connection:
   ```bash
   npm test tests/integration/controllers/AuthController.test.ts
   ```

**Expected**: Test runs and connects to database (may fail on assertions, that's OK)

---

### Step 2: AuthController Tests (~30 tests, 2-3 hours)

**File**: `tests/integration/controllers/AuthController.test.ts`

**Test Coverage**:

#### 2.1 GET /auth/login (3 tests)
- [x] Should render login page (HTML response)
- [ ] Should not be accessible when authenticated (redirect to dashboard)
- [ ] Should accept HTMX request (return partial)

#### 2.2 POST /auth/login (8 tests)
- [ ] Should login with valid credentials (302 redirect, set cookie)
- [ ] Should reject invalid email (401)
- [ ] Should reject invalid password (401)
- [ ] Should reject inactive user (403)
- [ ] Should validate email format (400)
- [ ] Should require password (400)
- [ ] Should handle SQL injection attempts
- [ ] Should set session cookie with correct attributes

#### 2.3 GET /auth/register (3 tests)
- [ ] Should render registration page
- [ ] Should not be accessible when authenticated
- [ ] Should accept HTMX request

#### 2.4 POST /auth/register (10 tests)
- [ ] Should register new user with valid data (302, create DB record)
- [ ] Should reject duplicate email (409)
- [ ] Should reject mismatched passwords (400)
- [ ] Should validate email format (400)
- [ ] Should require minimum password length (400)
- [ ] Should require name (400)
- [ ] Should hash password before storage
- [ ] Should create user with default role (MEMBER)
- [ ] Should login user after registration (set session)

#### 2.5 POST /auth/logout (3 tests)
- [ ] Should logout authenticated user (clear session)
- [ ] Should redirect to login page
- [ ] Should handle logout when not authenticated

#### 2.6 Protected Routes (4 tests)
- [ ] Should block unauthenticated access to /dashboard (302 → /auth/login)
- [ ] Should allow authenticated access to /dashboard (200)
- [ ] Should block unauthenticated access to /tasks (302)
- [ ] Should allow authenticated access to /tasks (200)

#### 2.7 Session Management (3 tests)
- [ ] Should persist session across requests
- [ ] Should invalidate session on logout
- [ ] Should handle session expiration

**Test Pattern Example**:
```typescript
describe('POST /auth/login', () => {
  beforeEach(async () => {
    await createTestUser(prisma, TEST_CREDENTIALS.user);
  });

  it('should login with valid credentials', async () => {
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      })
      .expect(302);

    expect(response.headers.location).toBe('/dashboard');
    
    const cookies = response.headers['set-cookie'];
    expect(Array.isArray(cookies)).toBe(true);
    expect(cookies.some(c => c.includes('taskflow.sid'))).toBe(true);
  });
});
```

---

### Step 3: TaskController Tests (~25 tests, 2-3 hours)

**File**: `tests/integration/controllers/TaskController.test.ts`

**Test Coverage**:

#### 3.1 GET /tasks (List) - 8 tests
- [ ] Should list tasks for authenticated user (200, HTML)
- [ ] Should block unauthenticated access (302)
- [ ] Should filter by status query param
- [ ] Should filter by priority query param
- [ ] Should filter by assignee query param
- [ ] Should paginate results (page, limit params)
- [ ] Should return HTMX partial when HX-Request header present
- [ ] Should search tasks by title

#### 3.2 GET /tasks/:id (Detail) - 4 tests
- [ ] Should show task detail for authenticated user (200)
- [ ] Should return 404 for non-existent task
- [ ] Should block unauthenticated access
- [ ] Should return HTMX partial for detail view

#### 3.3 POST /tasks (Create) - 6 tests
- [ ] Should create task with valid data (302 or HTMX response)
- [ ] Should validate required fields (400)
- [ ] Should validate status enum (400)
- [ ] Should validate priority enum (400)
- [ ] Should set creator to authenticated user
- [ ] Should return HTMX partial with HX-Trigger header

#### 3.4 PUT /tasks/:id (Update) - 5 tests
- [ ] Should update task with valid data
- [ ] Should return 404 for non-existent task
- [ ] Should validate status transitions
- [ ] Should only allow owner/admin to update
- [ ] Should return HTMX partial on success

#### 3.5 DELETE /tasks/:id - 4 tests
- [ ] Should delete task (204 or 302)
- [ ] Should return 404 for non-existent task
- [ ] Should only allow owner/admin to delete
- [ ] Should return HX-Trigger for HTMX requests

**HTMX Test Pattern**:
```typescript
it('POST /tasks with HTMX should return partial', async () => {
  const cookie = await loginAndGetCookie(app, TEST_CREDENTIALS.user);
  
  const response = await supertest(app)
    .post('/tasks')
    .set('Cookie', cookie)
    .set('HX-Request', 'true')
    .send({
      title: 'New Task',
      status: 'TODO',
      priority: 'MEDIUM'
    })
    .expect(200);

  expect(response.headers['hx-trigger']).toBeDefined();
  expect(response.text).toContain('task-item');
});
```

---

### Step 4: UserController Tests (~10 tests, 1-2 hours)

**File**: `tests/integration/controllers/UserController.test.ts`

**Test Coverage**:

#### 4.1 GET /users/profile - 2 tests
- [ ] Should show user profile for authenticated user
- [ ] Should block unauthenticated access

#### 4.2 PUT /users/profile - 5 tests
- [ ] Should update user profile (name)
- [ ] Should not update email (forbidden)
- [ ] Should not update role (forbidden)
- [ ] Should validate name length
- [ ] Should block unauthenticated access

#### 4.3 GET /users/settings - 2 tests
- [ ] Should show settings page
- [ ] Should block unauthenticated access

#### 4.4 POST /users/settings - 2 tests
- [ ] Should update user settings (theme, locale)
- [ ] Should validate settings values

---

### Step 5: DashboardController Tests (~8 tests, 1 hour)

**File**: `tests/integration/controllers/DashboardController.test.ts`

**Test Coverage**:

#### 5.1 GET /dashboard - 5 tests
- [ ] Should show dashboard for authenticated user
- [ ] Should display task statistics
- [ ] Should show recent tasks
- [ ] Should show user metrics
- [ ] Should block unauthenticated access

#### 5.2 GET /dashboard/stats (API endpoint) - 3 tests
- [ ] Should return JSON stats
- [ ] Should include task counts by status
- [ ] Should include task counts by priority

---

### Step 6: Documentation & Commit (30 minutes)

**Create**: `tests/PHASE_5.4_README.md`

**Content**:
- Overview of controller integration tests
- Test infrastructure (supertest, test-app.factory, auth helpers)
- Test patterns (authentication, HTMX, sessions)
- Running tests
- Coverage achieved (~85%+)
- Key learnings

**Commit Message**:
```
feat(tests): complete Phase 5.4 - Controller Integration Tests

Implement comprehensive integration tests for HTTP presentation layer:

**Controllers Tested:**
- AuthController: 30 tests (login, register, logout, sessions)
- TaskController: 25 tests (CRUD, filters, pagination, HTMX)
- UserController: 10 tests (profile, settings)
- DashboardController: 8 tests (stats, metrics)

**Total:** 73 integration tests, >85% controller coverage

**Test Infrastructure:**
- Supertest for HTTP testing
- Test app factory with DI container
- Authentication helpers (login, user creation)
- HTMX testing patterns
- Session management testing

**Key Features:**
- Full request-response cycle testing
- Database integration (PostgreSQL)
- Session persistence testing
- HTMX partial response testing
- Protected route testing
- Input validation testing

Execution time: ~15s (database integration)

Closes Phase 5.4, opens Phase 5.5 (E2E Tests)
```

---

## 🔧 Test Utilities Reference

### Authentication Helpers

```typescript
// Create test user
const user = await createTestUser(prisma, TEST_CREDENTIALS.user);

// Login and get cookie
const cookie = await loginAndGetCookie(app, {
  email: 'user@example.com',
  password: 'password123'
});

// Use in request
await supertest(app)
  .get('/protected-route')
  .set('Cookie', cookie)
  .expect(200);

// Cleanup
await cleanupTestUsers(prisma);
```

### HTMX Testing

```typescript
// Test HTMX request
const response = await supertest(app)
  .post('/tasks')
  .set('HX-Request', 'true')
  .set('Cookie', cookie)
  .send(taskData)
  .expect(200);

// Verify HTMX headers
expect(response.headers['hx-trigger']).toBe('taskCreated');
expect(response.headers['hx-location']).toBeUndefined();

// Verify partial content
expect(response.text).not.toContain('<!DOCTYPE html>');
expect(response.text).toContain('task-item');
```

### Session Testing

```typescript
// Test session persistence
const cookie = await loginAndGetCookie(app, credentials);

// Make multiple requests
await supertest(app).get('/dashboard').set('Cookie', cookie).expect(200);
await supertest(app).get('/tasks').set('Cookie', cookie).expect(200);

// Test session invalidation
await supertest(app).post('/auth/logout').set('Cookie', cookie).expect(302);
await supertest(app).get('/dashboard').set('Cookie', cookie).expect(302);
```

---

## 📊 Progress Tracking

### Current Status
- ✅ **Infrastructure**: Test framework, helpers, minimal test
- ⏳ **Database**: Needs Docker container running
- ⏳ **AuthController**: 1/30 tests (3%)
- ⏳ **TaskController**: 0/25 tests (0%)
- ⏳ **UserController**: 0/10 tests (0%)
- ⏳ **DashboardController**: 0/8 tests (0%)

### Overall Progress: 1/73 tests (1%)

### Estimated Time Remaining
- Database setup: 10 minutes
- AuthController: 2-3 hours
- TaskController: 2-3 hours
- UserController: 1-2 hours
- DashboardController: 1 hour
- Documentation: 30 minutes

**Total: 7-10 hours of focused work**

---

## 🎯 Success Criteria

- [x] Test infrastructure working (compiles, DI loads)
- [ ] Database connection established
- [ ] AuthController: >90% coverage (~30 tests passing)
- [ ] TaskController: >85% coverage (~25 tests passing)
- [ ] UserController: >80% coverage (~10 tests passing)
- [ ] DashboardController: >80% coverage (~8 tests passing)
- [ ] **Overall**: >85% controller layer coverage
- [ ] All tests pass in <20s execution time
- [ ] Documentation complete
- [ ] Git commit with detailed message

---

## 🚀 Next Steps After Phase 5.4

### Phase 5.5: E2E Tests (Playwright)
- Critical user flows (login → dashboard → create task → logout)
- HTMX interactions
- Alpine.js components
- Cross-browser testing
- Target: 10-15 E2E tests

### Phase 6: Performance Testing
- Load testing (artillery, k6)
- Database query optimization
- Response time benchmarks
- Target: TTI < 2s, p95 < 500ms

---

## 📝 Notes

### Database Considerations
- Use test database (port 5434 not 5432)
- Clean up data between tests (beforeEach hooks)
- Use transactions for test isolation (optional)
- Seed minimal data for each test

### HTMX Testing Best Practices
- Always set `HX-Request: true` header
- Verify `HX-Trigger` response headers
- Check partial responses don't include full HTML structure
- Test both full page and HTMX partial paths

### Session Testing Best Practices
- Test cookie attributes (httpOnly, secure, sameSite)
- Verify session persistence across requests
- Test session expiration
- Test logout clears session properly

### Performance Tips
- Run tests in parallel when possible
- Use test database transactions for isolation
- Minimize database connections (singleton pattern)
- Clean up resources in afterAll hooks

---

**Last Updated**: October 31, 2025  
**Status**: Ready for implementation, needs database connection
