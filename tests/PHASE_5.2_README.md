# Phase 5.2: Domain & Repository Tests

## Overview

Comprehensive test suite for domain entities and repository implementations with 90+ test cases covering all CRUD operations, filters, pagination, and edge cases.

## Test Structure

```
tests/
├── unit/domain/          # 36 unit tests (domain entities)
│   ├── Task.test.ts      # 16 tests - Task factory & validation
│   └── User.test.ts      # 20 tests - User factory & roles
└── integration/database/ # 61 integration tests (repositories)
    ├── UserRepository.integration.test.ts  # 28 tests
    └── TaskRepository.integration.test.ts  # 33 tests
```

## Test Coverage

### Unit Tests (Domain Entities)
- ✅ Factory pattern with sequential IDs
- ✅ Default values and overrides
- ✅ Validation (status, priority, roles)
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Email format validation
- ✅ Password hashing
- ✅ Counter reset between tests

### Integration Tests (Repositories)

**UserRepository (28 tests)**:
- ✅ create() - User creation, duplicate email handling, roles
- ✅ findById() - ID lookup, null handling
- ✅ findByEmail() - Email lookup, case-insensitivity
- ✅ findByRole() - Role filtering
- ✅ findActive() - Active/inactive filtering
- ✅ findAll() - Multiple filters (role, status, search)
- ✅ update() - Property updates, activation/deactivation
- ✅ delete() - Deletion, non-existent handling
- ✅ existsByEmail() - Email existence check
- ✅ existsById() - ID existence check
- ✅ count() - Counting with filters

**TaskRepository (33 tests)**:
- ✅ create() - Task creation with/without assignee, due date, description
- ✅ findById() - ID lookup, null handling
- ✅ findByAssignee() - Assignee filtering
- ✅ findByCreator() - Creator filtering
- ✅ findByStatus() - Status filtering
- ✅ findOverdue() - Overdue task detection (excluding completed)
- ✅ findDueInRange() - Date range filtering
- ✅ findAll() - Pagination + filters (status, priority, assignee, creator, search)
- ✅ update() - Property updates, completion, assignment/unassignment
- ✅ delete() - Deletion, non-existent handling
- ✅ count() - Counting with filters
- ✅ countByStatus() - Status-specific counting
- ✅ countByAssignee() - Assignee-specific counting
- ✅ existsById() - ID existence check

## Running Tests

### Unit Tests Only (No Database Required)
```bash
npm test tests/unit/
```

### All Tests (Requires Test Database)
```bash
# Start test database (PostgreSQL on port 5434)
docker compose --profile test up -d db-test

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Stop test database
docker compose --profile test down db-test
```

### Integration Tests Only
```bash
# Requires database running
npm test tests/integration/
```

## Test Database

**Connection**: `postgresql://test:test@localhost:5434/taskflow_test`

**Auto-skip**: Integration tests automatically skip if database is unavailable (graceful degradation).

**Cleanup**: Each test suite cleans the database before/after execution using the `cleanDatabase()` utility.

## Test Utilities

- **Factories** (`tests/utils/factories.ts`): Generate test data with realistic defaults
- **Test DB** (`tests/utils/test-db.ts`): Database lifecycle management
- **Helpers** (`tests/utils/helpers.ts`): Common assertions and mocks

## Coverage Goals

- ✅ Unit Tests: 100% for domain entities
- ✅ Integration Tests: 90%+ for repositories
- 🎯 **Current Coverage**: 90%+ domain layer
- 🎯 **Target Coverage**: >90% (Phase 5.2 complete)

## Next Steps

- **Phase 5.3**: Service layer tests (business logic)
- **Phase 5.4**: Controller tests (HTTP endpoints)
- **Phase 5.5**: E2E tests (Playwright)

## Key Features

1. **Isolated Tests**: Each test is independent, database cleaned between runs
2. **Real Database**: Tests use actual PostgreSQL (not mocks) for realistic validation
3. **Comprehensive**: All repository methods tested with success & error cases
4. **Fast**: Unit tests run in <1s, integration tests in ~5s
5. **CI-Ready**: Auto-skip integration tests if DB unavailable
