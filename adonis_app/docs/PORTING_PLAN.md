# TaskFlow → AdonisJS Porting Plan

> Target framework: AdonisJS 6 (Edge, Vite, ESM build)

## 1. Scope & Goals

- Rebuild the original Express + EJS + Prisma SSR app on top of AdonisJS while preserving all product capabilities (auth, dashboard, task CRUD, admin tools, filters, i18n, theming, HTMX interactions, Alpine-powered widgets).
- Adopt first-class Adonis tooling (Edge templates, Lucid models, Vine validators, Shield/CORS middleware, Session/Auth providers).
- Improve DX via clear modules (domain, services, HTTP layer) and comprehensive tests/seed data.
- Keep SSR-first UX with HTMX partial refreshes and progressive enhancement.

## 2. Core Packages

| Area          | Packages                                                                      |
| ------------- | ----------------------------------------------------------------------------- |
| Database      | `@adonisjs/lucid`, `pg`, `luxon`                                              |
| Validation    | `vinejs` (bundled) + custom validators                                        |
| Sessions/Auth | `@adonisjs/session`, `@adonisjs/auth`, `@adonisjs/hash`, `argon2`             |
| Views/Assets  | `@adonisjs/view`, `@adonisjs/static`, Vite Edge plugin, Alpine + HTMX bundles |
| Security      | `@adonisjs/shield`, `@adonisjs/cors`, CSP nonce middleware                    |
| i18n          | `@adonisjs/i18n` with JSON catalogs from `locales/`                           |
| Tooling       | `@adonisjs/prettier-config`, ESLint config already present                    |

## 3. Data Model Mapping

| Prisma Model | Lucid Model                                             | Notes                                               |
| ------------ | ------------------------------------------------------- | --------------------------------------------------- |
| `User`       | `app/models/user.ts`                                    | cuid primary key, enum role, locale, password hash  |
| `Task`       | `app/models/task.ts`                                    | Enum status/priority, relations to creator/assignee |
| `Session`    | Adonis session table (Lucid migration + session driver) |

Migrations:

- `database/migrations/0000_users.ts`
- `database/migrations/0001_tasks.ts`
- `database/migrations/0002_sessions.ts`

Enums realized through PostgreSQL enums + Lucid TypeScript unions.

## 4. Application Architecture

```
app/
  controllers/ (Auth, Dashboard, Task, User, Page, Diagnostic)
  middleware/ (Auth, Guest, Htmx, Locale, CSPNonce, Performance, RateLimit)
  models/ (User, Task, Session)
  services/
    auth_service.ts
    task_service.ts
    user_service.ts
    dashboard_service.ts
  validators/
    auth/
    task/
    user/
  view_models/
    tasks/
    dashboard/
```

Service layer keeps Prisma-era business rules (filter composition, pagination, statistics) reusable for HTTP controllers + future API.

## 5. HTTP Layer

| Route                | Controller                                                      | Description                        |
| -------------------- | --------------------------------------------------------------- | ---------------------------------- |
| `/`                  | `PagesController.home`                                          | Landing vs redirect to dashboard   |
| `/dashboard`         | `DashboardController.index`                                     | Task stats, filters, HTMX partials |
| `/tasks`             | `TasksController.index/create/store/edit/update/destroy/toggle` |
| `/auth/login` `POST` | `AuthController.storeLogin`                                     |
| `/auth/register`     | `AuthController.storeRegister`                                  |
| `/auth/logout`       | `AuthController.destroy`                                        |
| `/users`             | `UsersController.index/store/update/destroy` (admin only)       |
| `/profile`           | `UsersController.profile/updateLocale/updatePassword`           |
| `/pages/*`           | Static informational Edge views                                 |
| `/diagnostic`        | Guarded dev route returning telemetry + config glimpses         |

Routing is defined in `start/routes.ts` with route groups (`middleware.auth`, `middleware.admin`, `middleware.guest`).

## 6. Middleware Stack

1. Global: `Server.middleware` = `['@adonisjs/core/bodyparser', 'App/Middleware/HtmxDetector', 'App/Middleware/LocaleSwitcher', 'App/Middleware/PerformanceTracker']`
2. Named: `auth`, `guest`, `adminRole`, `rateLimit:global`, `csrf`, `cspNonce`, `shareSession`, `htmxPartial`.
3. Shield config handles CSP, CSRF cookie, frame-ancestors; custom middleware injects nonce into Edge globals for inline scripts (Alpine init, theme script).

## 7. Edge Views & Frontend

- Convert `views/layouts/main.ejs` to `resources/views/layouts/main.edge` preserving slots, includes, and helpers.
- Componentize repeated UI into Edge components under `resources/views/components/*` (cards, modals, filters, badges, nav, footers).
- Keep AlpineJS & HTMX bundles in `resources/js/` built via Vite; include hashed assets via `asset()` helper.
- Provide `resources/lang/{fr,en}.json` seeded from original `locales/` data.

## 8. Environment & Config

- `.env` keys: `APP_KEY`, `NODE_ENV`, `PORT`, `HOST`, `SESSION_DRIVER=database`, `DB_*`, `RATE_LIMIT_MAX`, `LOCALE_FALLBACK`, etc.
- Dockerized Postgres lives in `docker-compose.yml` (see `docs/LOCAL_DATABASE.md`) and shares credentials with the Adonis env file.
- `config/app.ts` updated with Edge, logger, hash driver Argon.
- `config/session.ts`, `config/database.ts`, `config/shield.ts`, `config/cors.ts`, `config/i18n.ts` tuned to original settings.

## 9. Testing Strategy

- Port Vitest suites into `tests/functional` using Japa runner (auth flow, tasks CRUD, dashboard filters, admin guard).
- Add `tests/unit/services` for service-layer logic (filter builder, stats aggregator).
- Provide factories (`database/factories/*.ts`) for User/Task for seeding + tests.

## 10. Migration Path

1. **Bootstrap packages** – install & configure Lucid, Auth, Session, Shield, View, I18n.
2. **Database layer** – migrations + models + factories + seed script replicating Prisma data shapes.
3. **Services & Validators** – convert application layer to TypeScript classes under `app/services` with Vine validators.
4. **Controllers & Routes** – implement HTTP endpoints, apply middleware, integrate session auth.
5. **Views & Assets** – port EJS layouts/partials to Edge, re-hook Alpine/HTMX, add translation helpers.
6. **QA** – run migrations, seeds, `npm run test`, manual smoke of dashboard + HTMX actions.

## 11. Outstanding Questions

- Keep Docker assets? (Plan: re-author Dockerfile for Adonis once server stabilized.)
- Telemetry/OpenTelemetry integration? (Optional follow-up once base port stable.)

This document will guide the subsequent implementation steps.
