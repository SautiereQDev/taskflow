#!/usr/bin/env bash
# Test Database Management Script
# Manages test PostgreSQL database lifecycle

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.test.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Start test database
start() {
  log_info "Starting test database..."
  docker compose -f "$COMPOSE_FILE" up -d
  
  log_info "Waiting for database to be ready..."
  sleep 5
  
  local max_attempts=30
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if docker compose -f "$COMPOSE_FILE" exec -T postgres-test pg_isready -U test -d taskflow_test > /dev/null 2>&1; then
      log_info "Test database is ready!"
      log_info "Connection string: postgresql://test:test@localhost:5435/taskflow_test"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "Waiting... (attempt $attempt/$max_attempts)"
    sleep 1
  done
  
  log_error "Test database failed to start"
  return 1
}

# Stop test database
stop() {
  log_info "Stopping test database..."
  docker compose -f "$COMPOSE_FILE" down
  log_info "Test database stopped"
}

# Reset test database (drop and recreate)
reset() {
  log_info "Resetting test database..."
  
  # Run migrations
  cd "$PROJECT_ROOT"
  DATABASE_URL="postgresql://test:test@localhost:5435/taskflow_test" npx prisma migrate reset --force --skip-seed
  
  log_info "Test database reset complete"
}

# Clean (remove volumes)
clean() {
  log_warn "Cleaning test database volumes..."
  docker compose -f "$COMPOSE_FILE" down -v
  log_info "Test database volumes removed"
}

# Show status
status() {
  log_info "Test database status:"
  docker compose -f "$COMPOSE_FILE" ps
}

# Show logs
logs() {
  docker compose -f "$COMPOSE_FILE" logs -f postgres-test
}

# Main command dispatcher
case "${1:-}" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  reset)
    reset
    ;;
  clean)
    clean
    ;;
  status)
    status
    ;;
  logs)
    logs
    ;;
  restart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|reset|clean|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start test database container"
    echo "  stop    - Stop test database container"
    echo "  restart - Restart test database container"
    echo "  reset   - Reset database schema (run migrations)"
    echo "  clean   - Remove database volumes (DELETES ALL DATA)"
    echo "  status  - Show container status"
    echo "  logs    - Show container logs"
    exit 1
    ;;
esac
