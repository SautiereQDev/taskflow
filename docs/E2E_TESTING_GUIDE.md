# E2E Testing with Docker Guide

This guide explains how to run End-to-End (E2E) tests using Playwright with Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js dependencies installed (`npm install`)

## 🚀 Quick Start

### Run E2E Tests in Docker (Recommended)

```bash
make test_e2e_docker
```

This single command will:
1. Build the Docker images
2. Start PostgreSQL database
3. Start the application server
4. Wait for services to be healthy
5. Run Playwright tests in a container
6. Cleanup containers and volumes

### Alternative: Using npm directly

```bash
npm run test:e2e:browser
```

## 📦 Available Make Commands

| Command | Description |
|---------|-------------|
| `make test_e2e` | Run E2E tests locally (requires running server) |
| `make test_e2e_ui` | Open Playwright UI for interactive testing |
| `make test_e2e_headed` | Run E2E tests in visible browser mode |
| `make test_e2e_docker` | **Run E2E tests in Docker (complete setup)** |
| `make test_e2e_docker_down` | Stop and cleanup E2E Docker containers |
| `make test_e2e_docker_logs` | View logs from E2E containers |

## 🏗️ Architecture

### Docker Compose Services

The `docker-compose.e2e.yml` defines three services:

```yaml
db (PostgreSQL)
  ↓ (waits for healthy)
app (Node.js + Express)
  ↓ (waits for healthy)
e2e (Playwright Tests)
```

#### 1. Database Service (`db`)
- **Image:** `postgres:18-alpine`
- **Port:** 5432 (internal)
- **Database:** `taskflow_test`
- **Healthcheck:** `pg_isready` every 5s

#### 2. Application Service (`app`)
- **Build:** `Dockerfile.dev` with NODE_ENV=test
- **Port:** 3000 (internal)
- **Environment:** Test configuration with seeded data
- **Healthcheck:** HTTP GET `/health` every 10s
- **Startup:** Waits for DB to be healthy

#### 3. E2E Test Service (`e2e`)
- **Image:** `mcr.microsoft.com/playwright:v1.48.2-noble`
- **Command:** `npx playwright test --config=playwright.config.docker.ts`
- **Startup:** Waits for app to be healthy
- **Exit:** Container exits after tests complete

### Network Isolation

All services run in a dedicated `e2e-network` bridge network, isolated from other Docker services.

### Volume Management

- **postgres_data_e2e:** Persistent database storage (cleaned after tests)
- **playwright-report:** Test results exported to host
- **test-results:** Test artifacts (screenshots, videos) exported to host

## 🔧 Configuration Files

### 1. docker-compose.e2e.yml

Main orchestration file defining all services, networks, and volumes.

### 2. playwright.config.docker.ts

Playwright configuration optimized for Docker:
- No `webServer` (app already running)
- `baseURL`: `http://app:3000`
- Retries: 2 (for flaky tests)
- Workers: 1 (sequential execution)
- Reporters: HTML, JSON, and list

### 3. playwright.config.ts (Local)

Default configuration for local development:
- Includes `webServer` (starts `npm run dev`)
- `baseURL`: `http://localhost:3000`
- Retries: 0 in dev, 2 in CI
- Workers: Parallel in dev, 1 in CI

## 📊 Test Results

After running tests, results are available in:

- **HTML Report:** `playwright-report/index.html`
- **JSON Results:** `playwright-report/results.json`
- **Screenshots:** `test-results/**/screenshots/`
- **Videos:** `test-results/**/videos/`

### View HTML Report

```bash
npx playwright show-report playwright-report
```

## 🐛 Troubleshooting

### Tests Fail with "Can't reach app"

**Problem:** E2E container can't reach the app service.

**Solution:**
1. Check app healthcheck: `make test_e2e_docker_logs`
2. Verify app is listening on `0.0.0.0:3000` (not `localhost`)
3. Check network configuration in `docker-compose.e2e.yml`

### Database Connection Errors

**Problem:** App can't connect to PostgreSQL.

**Solution:**
1. Check DB healthcheck: `docker compose -f docker-compose.e2e.yml ps`
2. Verify `DATABASE_URL` in app service environment
3. Ensure DB is fully started (check logs)

### Playwright Version Mismatch

**Problem:** `mcr.microsoft.com/playwright:v1.48.2-noble` not found.

**Solution:**
1. Check latest Playwright version: https://playwright.dev/docs/docker
2. Update image tag in `docker-compose.e2e.yml`
3. Run `npm install @playwright/test@latest` locally

### Tests Timeout

**Problem:** Tests timeout waiting for app to start.

**Solution:**
1. Increase `start_period` in app healthcheck (currently 30s)
2. Check app logs for startup errors: `make test_e2e_docker_logs`
3. Verify `SEED_DATABASE` isn't causing delays

### Port Already in Use

**Problem:** Port 3000 already in use.

**Solution:**
E2E tests use internal Docker networking (no port mapping to host). This error shouldn't occur. If it does:
1. Check if local dev server is running: `lsof -i :3000`
2. Stop dev server: `Ctrl+C` or `docker compose -f docker-compose.dev.yml down`

## 🔬 Advanced Usage

### Run Specific Test File

```bash
docker compose -f docker-compose.e2e.yml run --rm e2e \
  npx playwright test tests/e2e/auth.spec.ts --config=playwright.config.docker.ts
```

### Debug Tests with UI

Unfortunately, Playwright UI doesn't work in headless Docker. For debugging:

1. Run tests locally with UI:
   ```bash
   make test_e2e_ui
   ```

2. Or run in headed mode locally:
   ```bash
   make test_e2e_headed
   ```

### Keep Containers Running for Inspection

```bash
# Run without --abort-on-container-exit
docker compose -f docker-compose.e2e.yml up --build

# In another terminal, inspect logs
docker compose -f docker-compose.e2e.yml logs -f app

# Cleanup when done
docker compose -f docker-compose.e2e.yml down -v
```

### Run Tests Against Different Browsers

Update `playwright.config.docker.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],
```

Then rebuild and run:
```bash
make test_e2e_docker
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      
      - name: Run E2E Tests
        run: make test_e2e_docker
      
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7
```

## 📚 Best Practices

### 1. Test Isolation

Each E2E run uses fresh database volumes:
- Database is seeded with consistent test data
- No state persists between runs
- Tests can be run in any order

### 2. Waiting for Services

Services use healthchecks to ensure readiness:
- DB: `pg_isready` command
- App: HTTP GET `/health` endpoint
- E2E: Waits for app healthcheck to pass

### 3. Resource Cleanup

Always cleanup after tests:
```bash
make test_e2e_docker  # Includes automatic cleanup
# OR manually
make test_e2e_docker_down
```

### 4. Performance Optimization

- Use `fullyParallel: false` in Docker (limited resources)
- Enable `fullyParallel: true` locally (better performance)
- Adjust `workers` based on available CPU cores

## 🆘 Support

For issues or questions:
1. Check container logs: `make test_e2e_docker_logs`
2. Review test results: `playwright-report/index.html`
3. Inspect Docker state: `docker compose -f docker-compose.e2e.yml ps`
4. Consult Playwright docs: https://playwright.dev/docs/intro

## 📝 Summary

**Recommended Workflow:**

```bash
# 1. Run E2E tests in Docker (complete setup)
make test_e2e_docker

# 2. View results
npx playwright show-report playwright-report

# 3. If tests fail, check logs
make test_e2e_docker_logs

# 4. Debug locally with UI (if needed)
make test_e2e_ui
```

This ensures:
- ✅ Isolated test environment
- ✅ Consistent results across machines
- ✅ No interference with local dev environment
- ✅ Automatic cleanup
- ✅ CI/CD ready
