#!/bin/sh
set -e

echo "🚀 TaskFlow Docker Entrypoint"
echo "================================"

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run Prisma migrations
echo "🔧 Running database migrations..."
npx prisma migrate deploy

# Seed database if SEED_DATABASE is true
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run prisma:seed || echo "⚠️  Seed failed or already seeded"
fi

echo "✅ Database setup complete!"

# Execute the main command
echo "🎯 Starting application..."
exec "$@"
