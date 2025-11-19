# Plan de Portage vers AdonisJS 6

## Objectif

Rebâtir TaskFlow sur AdonisJS 6 (kit web Edge) en profitant de l'écosystème natif :

- HTTP server + router typé
- Authentification session via `@adonisjs/auth`
- ORM Lucid + migrations Postgres
- Edge pour le SSR + Vite pour les assets (Alpine, HTMX, Tailwind)
- Middlewares core (Shield, Cors, Static, Logger)
- Services + Repositories via IoC container intégré
- I18n natif (`@adonisjs/i18n`) pour profiter des locales existantes

## Cartographie Express → Adonis

| Domaine | Express actuel | Adonis cible |
| --- | --- | --- |
| Bootstrap | `src/server.ts` + `createApp` | `start/kernel.ts`, `start/routes.ts`, providers configurés via manifest |
| Config | `.env`, `src/config/*.ts` | Fichiers `config/*.ts` générés (app, database, auth, session, shield, i18n, vite) |
| ORM | Prisma + repository pattern | Lucid models (`app/models`) + repositories fins pour découpler couche service |
| DI | tsyringe | IoC Adonis (`@inject`, providers) |
| Validation | express-validator/zod | VineJS validators (`app/validators`) |
| SSR | EJS + express-layouts | Edge layouts/partials + components |
| Frontend | scripts esbuild + Tailwind | Vite entry `resources/js/app.ts`, Tailwind plugin officiel |
| Auth | Session middleware custom | Session guard (`web`) + middleware `auth`, `guest` |
| Middleware | custom (CSRF, rate-limit, etc.) | Shield, RateLimiter middleware, custom HTMX middleware, telemetry |
| Internationalisation | i18next | `@adonisjs/i18n` avec fichiers JSON traditionnels |

## Modules Adonis

1. **Core setup**
   - `npm init adonisjs@latest` (kit `web`)
   - Activer providers: `@adonisjs/lucid`, `@adonisjs/vite`, `@adonisjs/i18n`, `@adonisjs/auth`, `@adonisjs/session`, `@adonisjs/shield`, `@adonisjs/cors`, `@adonisjs/static`.
   - Configurer `.env` (`APP_KEY`, `DB_*`, `SESSION_DRIVER=database`).

2. **Base de données**
   - Migrations `1680000000000_users`, `1680000000100_tasks`, `1680000000200_sessions`.
   - Seed `UsersSeeder` pour comptes admin/demo + `TasksSeeder` pour données UI.
   - Modèles Lucid `User`, `Task` avec enums TS (`TaskStatus`, `TaskPriority`).

3. **Services & Repositories**
   - `app/services/TaskService.ts`, `UserService.ts`, `DashboardService.ts`, `AuthService.ts`.
   - `app/repositories/user_repository.ts`, `task_repository.ts` (Lucid + filtres/pagination).
   - Utilitaires `PaginationResult`, `Filters`, `DateHelpers`.

4. **HTTP layer**
   - Routes modulaires via `start/routes/*.ts` (`auth`, `dashboard`, `tasks`, `admin`, `pages`).
   - Controllers Edge (`app/controllers/http`) alignés sur anciens use cases (list, detail, create, update, delete, toggle, dashboard metrics, profile, admin CRUD).
   - Middlewares: `HtmxMiddleware`, `LocaleMiddleware`, `ShareFlashMiddleware`, `TelemetryMiddleware`.

5. **Validation & DTOs**
   - Vine validators: `auth/login_validator.ts`, `tasks/create_task_validator.ts`, `tasks/update_task_validator.ts`, `users/update_profile_validator.ts`.
   - View models dans `app/view_models` pour formater les entités (counts, status labels, badges, etc.).

6. **Interface Edge**
   - Layout `resources/views/layouts/app.edge` reprenant design system.
   - Pages converties depuis EJS (`pages/home.edge`, `tasks/list.edge`, etc.).
   - Partials Edge pour nav/footer/cards/htmx fragments.
   - `resources/views/components` pour badges, status pills, pagination, modals.

7. **Frontend build**
   - `resources/js/app.ts` charge Alpine (plugins), HTMX, composants custom.
   - Tailwind config migré (`tailwind.config.ts`) + `postcss.config.js` compatibles Vite.
   - `vite.config.ts` fourni par Adonis (Edge plugin) + alias.

8. **Opérations & Qualité**
   - Scripts `npm run dev`, `npm run build`, `npm run lint`, `npm run test` (Japa + Vitest pour services).
   - Husky préserve lint/test avant commit.
   - Docker compose mis à jour (Adonis + Postgres) + `start/app.ts` instrumentation (OpenTelemetry hook futur).

## Étapes de Livraison

1. **Initialiser projet Adonis** dans un répertoire temporaire puis fusionner à la racine.
2. **Porter configuration & dépendances** (package.json, env templates, lint, prettier).
3. **Créer migrations Lucid** et mapper schéma Prisma → tables.
4. **Implémenter modèles, repositories, services**.
5. **Migrer middleware & routes** (auth, tasks, dashboard, pages).
6. **Convertir vues EJS → Edge** (layouts, partials, pages, HTMX partials).
7. **Rebrancher assets** (Vite + Tailwind + Alpine/HTMX bundling).
8. **Écrire seeds + tests principaux** (TaskService, AuthService, Task pages HTTP tests).
9. **Mettre à jour documentation** (README usage, scripts, env vars, docker).
10. **Validation manuelle** (`node ace serve --watch`, `npm run test`).

Ce fichier servira de checklist pendant le portage.
