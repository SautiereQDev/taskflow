# Local PostgreSQL 18 (Docker)

This project ships with a ready-to-use PostgreSQL **18** service powered by Docker Compose. It mirrors the defaults referenced in `.env`, so the application connects without extra tweaks.

> **Important**
> The stack is validated only against PostgreSQL 18. Do **not** switch to SQLite or earlier Postgres majors: extensions (`citext`, `pg_trgm`) and enum migrations depend on PostgreSQL features that are absent elsewhere.

## Prerequisites

- Docker Engine / Docker Desktop 4.33+
- `docker compose` CLI plugin available in your shell

## Quick start

```pwsh
npm run db:up
# wait for the healthcheck to report "healthy"
node ace migration:run
node ace db:seed
```

## Useful commands

| Command | Description |
| --- | --- |
| `npm run db:up` | Start (or recreate) the PostgreSQL container in the background |
| `npm run db:down` | Stop the stack and remove the container/volume |
| `npm run db:logs` | Stream container logs (Ctrl+C to exit) |
| `npm run db:ps` | Show container status and exposed port |

## Configuration

The following variables in `.env` drive both Adonis and Docker Compose:

```
DB_HOST=127.0.0.1
DB_PORT=5450
DB_USER=taskflow
DB_PASSWORD=taskflow
DB_DATABASE=taskflow
```

Change them if you need different credentials/ports. Compose automatically reuses the same values via variable substitution. Remember to restart the container (`npm run db:down && npm run db:up`) after changing the settings.

## Housekeeping

Persistent data lives inside the named volume `postgres-data`. Run `docker volume rm task_flow_adonis_adonis_app_postgres-data` (exact name shown in `docker compose ls`) if you need a clean slate.
