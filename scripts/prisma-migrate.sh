#!/usr/bin/env bash

#
# Prisma Migration Automation Script
#
# Usage:
#   ./scripts/prisma-migrate.sh        # Run migration in dev mode
#   ./scripts/prisma-migrate.sh prod   # Deploy migration in production
#   ./scripts/prisma-migrate.sh reset  # Reset database (dev only)
#   ./scripts/prisma-migrate.sh seed   # Seed database with test data
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    exit 1
fi

MODE="${1:-dev}"

case "$MODE" in
    dev)
        print_info "Running Prisma migration in development mode..."

        # Check if database is accessible
        print_info "Checking database connectivity..."
        npx prisma db push --accept-data-loss

        # Generate Prisma Client
        print_info "Generating Prisma Client..."
        npx prisma generate

        print_info "✅ Development migration completed successfully!"
        ;;

    prod)
        print_warning "Running Prisma migration in PRODUCTION mode..."
        print_warning "This will apply migrations to the production database."
        read -p "Are you sure? (yes/no): " -n 3 -r
        echo

        if [[ ! $REPLY =~ ^yes$ ]]; then
            print_info "Migration cancelled."
            exit 0
        fi

        print_info "Deploying migrations..."
        npx prisma migrate deploy

        print_info "Generating Prisma Client..."
        npx prisma generate

        print_info "✅ Production migration completed successfully!"
        ;;

    reset)
        print_warning "This will RESET the database (delete all data)!"
        read -p "Are you sure? (yes/no): " -n 3 -r
        echo

        if [[ ! $REPLY =~ ^yes$ ]]; then
            print_info "Reset cancelled."
            exit 0
        fi

        print_info "Resetting database..."
        npx prisma migrate reset --force

        print_info "✅ Database reset completed!"
        ;;

    seed)
        print_info "Seeding database with test data..."
        npx prisma db seed

        print_info "✅ Database seeded successfully!"
        ;;

    *)
        print_error "Invalid mode: $MODE"
        echo "Usage: $0 [dev|prod|reset|seed]"
        exit 1
        ;;
esac

print_info "Done!"
