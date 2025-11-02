# 🚀 ROADMAP - TaskFlow Modern SSR Architecture


**Version**: 3.0  **Version**: 3.0  

**Date de création**: 31 octobre 2025  **Date de création**: 31 octobre 2025  

**Stack**: Express + EJS + HTMX + Alpine.js (SSR Pure)  **Stack**: Express + EJS + HTMX + Alpine.js (SSR Pure)  

**Objectif**: Reconstruire TaskFlow avec une architecture SSR moderne, sans framework JS lourd**Objectif**: Reconstruire TaskFlow avec une architecture SSR moderne, sans framework JS lourd



------



## 📊 Vue d'ensemble du projet## 📊 Vue d'ensemble du projet



### Objectif principal### Objectif principal

Développer une application fullstack SSR (Server-Side Rendering) pure de gestion de tâches collaborative avec :Développer une application fullstack SSR (Server-Side Rendering) pure de gestion de tâches collaborative avec :

- **Architecture Clean** (Domain-Driven Design + CQRS patterns)- **Architecture Clean** (Domain-Driven Design + CQRS patterns)

- **SSR pur** : Backend renvoie HTML, pas de SPA- **SSR pur** : Backend renvoie HTML, pas de SPA

- **Progressive Enhancement** : HTMX + Alpine.js pour l'interactivité- **Progressive Enhancement** : HTMX + Alpine.js pour l'interactivité

- **Design system glassmorphism** moderne- **Design system glassmorphism** moderne

- **Tests complets** (unitaires, intégration, E2E)- **Tests complets** (unitaires, intégration, E2E)

- **Performance** : SEO optimal, TTI < 2s- **Performance** : SEO optimal, TTI < 2s

- **Accessibilité** : WCAG 2.2 AA- **Accessibilité** : WCAG 2.2 AA



### Technologies principales### Technologies principales

- **Backend**: Node.js 24+ / TypeScript 5.7+ / Express 5- **Backend**: Node.js 24+ / TypeScript 5.7+ / Express 5

- **Base de données**: PostgreSQL 18 / Prisma 6- **Base de données**: PostgreSQL 18 / Prisma 6

- **Templates SSR**: EJS (Server-Side Rendering)- **Templates SSR**: EJS (Server-Side Rendering)

- **Interactivité partielle**: HTMX 1.9+ (requêtes AJAX → HTML)- **Interactivité partielle**: HTMX 1.9+ (requêtes AJAX → HTML)

- **Interactivité locale**: Alpine.js 3.x (UI components)- **Interactivité locale**: Alpine.js 3.x (UI components)

- **CSS**: Tailwind CSS 4 / DaisyUI 5.3.7- **CSS**: Tailwind CSS 4 / DaisyUI 5.3.7

- **Testing**: Vitest / Playwright- **Testing**: Vitest / Playwright

- **DevOps**: Docker / Docker Compose- **DevOps**: Docker / Docker Compose

- **Monitoring**: OpenTelemetry / Pino- **Monitoring**: OpenTelemetry / Pino

- **DI**: TSyringe- **DI**: TSyringe



### 🎯 Philosophie de la stack### 🎯 Philosophie de la stack



**SSR First (pas de SPA)** :**SSR First (pas de SPA)** :

- Le serveur renvoie toujours du HTML complet- Le serveur renvoie toujours du HTML complet

- Pas de client-side routing- Pas de client-side routing

- Pas de Virtual DOM- Pas de Virtual DOM

- Pas de gros bundle JavaScript- Pas de gros bundle JavaScript



**Progressive Enhancement** :**Progressive Enhancement** :

- L'app fonctionne sans JavaScript- L'app fonctionne sans JavaScript

- HTMX ajoute des mises à jour partielles (sans reload)- HTMX ajoute des mises à jour partielles (sans reload)

- Alpine.js gère les interactions locales (modals, dropdowns)- Alpine.js gère les interactions locales (modals, dropdowns)



**Avantages** :**Avantages** :

✅ SEO optimal (HTML rendu côté serveur)  ✅ SEO optimal (HTML rendu côté serveur)  

✅ Performance (TTI rapide, pas de hydration)  ✅ Performance (TTI rapide, pas de hydration)  

✅ Simplicité (pas de build complexe)  ✅ Simplicité (pas de build complexe)  

✅ Accessibilité (fonctionne sans JS)  ✅ Accessibilité (fonctionne sans JS)  

✅ Debugging facile (pas de framework magic)✅ Debugging facile (pas de framework magic)



---

---

## 🎯 PHASE 0 : Planification & Setup Initial (2-3 jours)

## 🎯 PHASE 0 : Planification & Setup Initial (2-3 jours)

### 0.1 - Analyse & Architecture Decision Records (ADR)

**Objectif**: Documenter les décisions architecturales clés### 0.1 - Analyse & Architecture Decision Records (ADR)

**Objectif**: Documenter les décisions architecturales clés

**Tasks**:

- [ ] **0.1.1** - Créer dossier `docs/adr/`**Tasks**:

- [ ] **0.1.2** - ADR-001: Choix SSR pur vs SPA (pourquoi HTMX + Alpine)- [ ] **0.1.1** - Créer dossier `docs/adr/`

- [ ] **0.1.3** - ADR-002: Stack technologique (Node.js, PostgreSQL, EJS)- [ ] **0.1.2** - ADR-001: Choix SSR pur vs SPA (pourquoi HTMX + Alpine)

- [ ] **0.1.4** - ADR-003: Progressive Enhancement strategy- [ ] **0.1.3** - ADR-002: Stack technologique (Node.js, PostgreSQL, EJS)

- [ ] **0.1.5** - ADR-004: Testing strategy (pyramid test + E2E)- [ ] **0.1.4** - ADR-003: Progressive Enhancement strategy

- [ ] **0.1.6** - ADR-005: Observabilité (OpenTelemetry + Pino)- [ ] **0.1.5** - ADR-004: Testing strategy (pyramid test + E2E)

- [ ] **0.1.7** - ADR-006: HTMX patterns & conventions- [ ] **0.1.6** - ADR-005: Observabilité (OpenTelemetry + Pino)

- [ ] **0.1.7** - ADR-006: HTMX patterns & conventions

**Livrables**:

```**Livrables**:

docs/```

├── adr/docs/

│   ├── 001-ssr-pure-architecture.md├── adr/

│   ├── 002-technology-stack.md│   ├── 001-ssr-pure-architecture.md

│   ├── 003-progressive-enhancement.md│   ├── 002-technology-stack.md

│   ├── 004-testing-strategy.md│   ├── 003-progressive-enhancement.md

│   ├── 005-observability.md│   ├── 004-testing-strategy.md

│   └── 006-htmx-conventions.md│   ├── 005-observability.md

├── ARCHITECTURE.md│   └── 006-htmx-conventions.md

└── HTMX_PATTERNS.md├── ARCHITECTURE.md

```└── HTMX_PATTERNS.md

```

### 0.2 - Setup environnement de développement

**Objectif**: Préparer l'environnement et la configuration de base### 0.2 - Setup environnement de développement

**Objectif**: Préparer l'environnement et la configuration de base

**Tasks**:

- [ ] **0.2.1** - Nettoyer le projet existant (backup)**Tasks**:

- [ ] **0.2.2** - Initialiser nouveau Git repository- [ ] **0.2.1** - Nettoyer le projet existant (backup)

- [ ] **0.2.3** - Configuration TypeScript 5.7 (strict mode + ESM)- [ ] **0.2.2** - Initialiser nouveau Git repository

- [ ] **0.2.4** - Configuration ESLint 9 + Prettier- [ ] **0.2.3** - Configuration TypeScript 5.7 (strict mode + ESM)

- [ ] **0.2.5** - Configuration EditorConfig- [ ] **0.2.4** - Configuration ESLint 9 + Prettier

- [ ] **0.2.6** - Setup Husky + lint-staged (pre-commit hooks)- [ ] **0.2.5** - Configuration EditorConfig

- [ ] **0.2.7** - Configuration VSCode (extensions HTMX, Alpine, Tailwind)- [ ] **0.2.6** - Setup Husky + lint-staged (pre-commit hooks)

- [ ] **0.2.8** - Installation HTMX DevTools (extension navigateur)- [ ] **0.2.7** - Configuration VSCode (extensions HTMX, Alpine, Tailwind)

- [ ] **0.2.8** - Installation HTMX DevTools (extension navigateur)

**Livrables**:

```**Livrables**:

.husky/```

├── pre-commit.husky/

└── commit-msg├── pre-commit

.vscode/└── commit-msg

├── settings.json.vscode/

├── extensions.json (recommend: HTMX, Alpine.js, Tailwind)├── settings.json

└── launch.json├── extensions.json (recommend: HTMX, Alpine.js, Tailwind)

.editorconfig└── launch.json

tsconfig.json.editorconfig

eslint.config.tstsconfig.json

.prettierrc.jsoneslint.config.ts

```.prettierrc.json

```

### 0.3 - Infrastructure Docker & Database

**Objectif**: Containeriser l'application et setup PostgreSQL### 0.3 - Infrastructure Docker & Database

**Objectif**: Containeriser l'application et setup PostgreSQL

**Tasks**:

- [ ] **0.3.1** - Dockerfile multi-stage (dev + production)**Tasks**:

- [ ] **0.3.2** - docker-compose.yml (app + db)- [ ] **0.3.1** - Dockerfile multi-stage (dev + production)

- [ ] **0.3.3** - docker-compose.dev.yml (hot reload + debug)- [ ] **0.3.2** - docker-compose.yml (app + db)

- [ ] **0.3.4** - Configuration PostgreSQL 18 optimisée- [ ] **0.3.3** - docker-compose.dev.yml (hot reload + debug)

- [ ] **0.3.5** - Setup health checks- [ ] **0.3.4** - Configuration PostgreSQL 18 optimisée

- [ ] **0.3.6** - Scripts Makefile pour commandes Docker- [ ] **0.3.5** - Setup health checks

- [ ] **0.3.6** - Scripts Makefile pour commandes Docker

**Livrables**:

```**Livrables**:

Dockerfile```

docker-compose.ymlDockerfile

docker-compose.dev.ymldocker-compose.yml

Makefiledocker-compose.dev.yml

scripts/Makefile

├── docker-entrypoint.shscripts/

└── wait-for-it.sh├── docker-entrypoint.sh

```└── wait-for-it.sh

```

---

---

## 🏗️ PHASE 1 : Core Domain & Infrastructure (5-7 jours)

## 🏗️ PHASE 1 : Core Domain & Infrastructure (5-7 jours)

### 1.1 - Domain Layer (Entities + Value Objects)

**Objectif**: Créer les entités métier du domaine (identique, pas de changement)### 1.1 - Domain Layer (Entities + Value Objects)

**Objectif**: Créer les entités métier du domaine

**Tasks**:

- [ ] **1.1.1** - Créer structure `src/domain/`**Tasks**:

- [ ] **1.1.2** - Entity: User (avec value objects Email, Password)- [ ] **1.1.1** - Créer structure `src/domain/`

- [ ] **1.1.3** - Entity: Task (avec TaskStatus, TaskPriority enums)- [ ] **1.1.2** - Entity: User (avec value objects Email, Password)

- [ ] **1.1.4** - Entity: Team (optionnel pour v2)- [ ] **1.1.3** - Entity: Task (avec TaskStatus, TaskPriority enums)

- [ ] **1.1.5** - Value Objects: DateRange, AssigneeInfo- [ ] **1.1.4** - Entity: Team (optionnel pour v2)

- [ ] **1.1.6** - Domain Events: TaskCreated, TaskAssigned, etc.- [ ] **1.1.5** - Value Objects: DateRange, AssigneeInfo

- [ ] **1.1.7** - Interfaces repositories (ports)- [ ] **1.1.6** - Domain Events: TaskCreated, TaskAssigned, etc.

- [ ] **1.1.8** - Tests unitaires domaine (>90% coverage)- [ ] **1.1.7** - Interfaces repositories (ports)

- [ ] **1.1.8** - Tests unitaires domaine (>90% coverage)

**Livrables**:

```**Livrables**:

src/domain/```

├── entities/src/domain/

│   ├── User.ts├── entities/

│   ├── Task.ts│   ├── User.ts

│   └── Team.ts│   ├── Task.ts

├── value-objects/│   └── Team.ts

│   ├── Email.ts├── value-objects/

│   ├── Password.ts│   ├── Email.ts

│   ├── TaskStatus.ts│   ├── Password.ts

│   ├── TaskPriority.ts│   ├── TaskStatus.ts

│   └── DateRange.ts│   ├── TaskPriority.ts

├── events/│   └── DateRange.ts

│   ├── TaskCreated.ts├── events/

│   ├── TaskAssigned.ts│   ├── TaskCreated.ts

│   └── UserRegistered.ts│   ├── TaskAssigned.ts

├── repositories/│   └── UserRegistered.ts

│   ├── IUserRepository.ts├── repositories/

│   ├── ITaskRepository.ts│   ├── IUserRepository.ts

│   └── IEventStore.ts│   ├── ITaskRepository.ts

└── __tests__/│   └── IEventStore.ts

```└── __tests__/

```

### 1.2 - Prisma Schema & Migrations

**Objectif**: Définir le schéma de base de données (identique)### 1.2 - Prisma Schema & Migrations

**Objectif**: Définir le schéma de base de données

**Tasks**:

- [ ] **1.2.1** - Schéma Prisma complet (User, Task, Session)**Tasks**:

- [ ] **1.2.2** - Indexes optimisés (performance queries)- [ ] **1.2.1** - Schéma Prisma complet (User, Task, Session)

- [ ] **1.2.3** - Contraintes & relations- [ ] **1.2.2** - Indexes optimisés (performance queries)

- [ ] **1.2.4** - Migration initiale- [ ] **1.2.3** - Contraintes & relations

- [ ] **1.2.5** - Seed data (utilisateurs + tâches de test)- [ ] **1.2.4** - Migration initiale

- [ ] **1.2.6** - Scripts migration automation- [ ] **1.2.5** - Seed data (utilisateurs + tâches de test)

- [ ] **1.2.6** - Scripts migration automation

**Livrables**:

```**Livrables**:

prisma/```

├── schema.prismaprisma/

├── seed.ts├── schema.prisma

├── migrations/├── seed.ts

│   └── 20251031000000_init/├── migrations/

└── seeds/│   └── 20251030000000_init/

    ├── users.json└── seeds/

    └── tasks.json    ├── users.json

```    └── tasks.json

```

### 1.3 - Infrastructure Layer (Repositories)

**Objectif**: Implémenter les repositories avec Prisma (identique)### 1.3 - Infrastructure Layer (Repositories)

**Objectif**: Implémenter les repositories avec Prisma

**Tasks**:

- [ ] **1.3.1** - PrismaUserRepository (CRUD + queries complexes)**Tasks**:

- [ ] **1.3.2** - PrismaTaskRepository (filtres, pagination, stats)- [ ] **1.3.1** - PrismaUserRepository (CRUD + queries complexes)

- [ ] **1.3.3** - Transaction handler (Unit of Work pattern)- [ ] **1.3.2** - PrismaTaskRepository (filtres, pagination, stats)

- [ ] **1.3.4** - Query builders (reusable filters)- [ ] **1.3.3** - Transaction handler (Unit of Work pattern)

- [ ] **1.3.5** - Mapping Prisma ↔ Domain entities- [ ] **1.3.4** - Query builders (reusable filters)

- [ ] **1.3.6** - Tests d'intégration repositories (avec DB test)- [ ] **1.3.5** - Mapping Prisma ↔ Domain entities

- [ ] **1.3.6** - Tests d'intégration repositories (avec DB test)

**Livrables**:

```**Livrables**:

src/infrastructure/```

├── database/src/infrastructure/

│   ├── prisma/├── database/

│   │   ├── PrismaUserRepository.ts│   ├── prisma/

│   │   ├── PrismaTaskRepository.ts│   │   ├── PrismaUserRepository.ts

│   │   └── PrismaClient.ts│   │   ├── PrismaTaskRepository.ts

│   ├── mappers/│   │   └── PrismaClient.ts

│   │   ├── UserMapper.ts│   ├── mappers/

│   │   └── TaskMapper.ts│   │   ├── UserMapper.ts

│   └── query-builders/│   │   └── TaskMapper.ts

│       ├── TaskQueryBuilder.ts│   └── query-builders/

│       └── UserQueryBuilder.ts│       ├── TaskQueryBuilder.ts

└── __tests__/│       └── UserQueryBuilder.ts

```└── __tests__/

```

### 1.4 - Dependency Injection Container

**Objectif**: Setup DI avec TSyringe (identique)### 1.4 - Dependency Injection Container

**Objectif**: Setup DI avec TSyringe

**Tasks**:

- [ ] **1.4.1** - Configuration TSyringe**Tasks**:

- [ ] **1.4.2** - Registre des repositories- [ ] **1.4.1** - Configuration TSyringe

- [ ] **1.4.3** - Registre des services- [ ] **1.4.2** - Registre des repositories

- [ ] **1.4.4** - Registre des use cases- [ ] **1.4.3** - Registre des services

- [ ] **1.4.5** - Factory patterns pour instances complexes- [ ] **1.4.4** - Registre des use cases

- [ ] **1.4.6** - Tests DI resolution- [ ] **1.4.5** - Factory patterns pour instances complexes

- [ ] **1.4.6** - Tests DI resolution

**Livrables**:

```**Livrables**:

src/config/```

├── di-container.tssrc/config/

├── di-tokens.ts├── di-container.ts

└── __tests__/├── di-tokens.ts

    └── di-container.test.ts└── __tests__/

```    └── di-container.test.ts

```

---

---

## 💼 PHASE 2 : Application Layer (CQRS) (5-7 jours)

## 💼 PHASE 2 : Application Layer (CQRS) (5-7 jours)

### 2.1 - Commands (Write Operations)

**Objectif**: Implémenter les commandes CQRS (identique)### 2.1 - Commands (Write Operations)

**Objectif**: Implémenter les commandes CQRS

**Tasks**:

- [ ] **2.1.1** - CreateUserCommand + Handler**Tasks**:

- [ ] **2.1.2** - CreateTaskCommand + Handler- [ ] **2.1.1** - CreateUserCommand + Handler

- [ ] **2.1.3** - UpdateTaskCommand + Handler- [ ] **2.1.2** - CreateTaskCommand + Handler

- [ ] **2.1.4** - AssignTaskCommand + Handler- [ ] **2.1.3** - UpdateTaskCommand + Handler

- [ ] **2.1.5** - DeleteTaskCommand + Handler- [ ] **2.1.4** - AssignTaskCommand + Handler

- [ ] **2.1.6** - Command Bus pattern- [ ] **2.1.5** - DeleteTaskCommand + Handler

- [ ] **2.1.7** - Validation avec Zod dans handlers- [ ] **2.1.6** - Command Bus pattern

- [ ] **2.1.8** - Tests unitaires commands (>90%)- [ ] **2.1.7** - Validation avec Zod dans handlers

- [ ] **2.1.8** - Tests unitaires commands (>90%)

**Livrables**:

```**Livrables**:

src/application/```

├── commands/src/application/

│   ├── users/├── commands/

│   │   ├── CreateUserCommand.ts│   ├── users/

│   │   ├── CreateUserHandler.ts│   │   ├── CreateUserCommand.ts

│   │   └── __tests__/│   │   ├── CreateUserHandler.ts

│   ├── tasks/│   │   └── __tests__/

│   │   ├── CreateTaskCommand.ts│   ├── tasks/

│   │   ├── CreateTaskHandler.ts│   │   ├── CreateTaskCommand.ts

│   │   ├── UpdateTaskCommand.ts│   │   ├── CreateTaskHandler.ts

│   │   ├── UpdateTaskHandler.ts│   │   ├── UpdateTaskCommand.ts

│   │   ├── AssignTaskCommand.ts│   │   ├── UpdateTaskHandler.ts

│   │   ├── AssignTaskHandler.ts│   │   ├── AssignTaskCommand.ts

│   │   └── __tests__/│   │   ├── AssignTaskHandler.ts

│   └── CommandBus.ts│   │   └── __tests__/

└── validators/│   └── CommandBus.ts

    ├── UserValidator.ts└── validators/

    └── TaskValidator.ts    ├── UserValidator.ts

```    └── TaskValidator.ts

```

### 2.2 - Queries (Read Operations)

**Objectif**: Implémenter les queries CQRS (identique)### 2.2 - Queries (Read Operations)

**Objectif**: Implémenter les queries CQRS

**Tasks**:

- [ ] **2.2.1** - GetUserByIdQuery + Handler**Tasks**:

- [ ] **2.2.2** - GetTasksQuery + Handler (filtres, pagination)- [ ] **2.2.1** - GetUserByIdQuery + Handler

- [ ] **2.2.3** - GetTaskByIdQuery + Handler- [ ] **2.2.2** - GetTasksQuery + Handler (filtres, pagination)

- [ ] **2.2.4** - GetDashboardStatsQuery + Handler- [ ] **2.2.3** - GetTaskByIdQuery + Handler

- [ ] **2.2.5** - GetTeamCapacityQuery + Handler- [ ] **2.2.4** - GetDashboardStatsQuery + Handler

- [ ] **2.2.6** - Query Bus pattern- [ ] **2.2.5** - GetTeamCapacityQuery + Handler

- [ ] **2.2.7** - DTOs pour réponses- [ ] **2.2.6** - Query Bus pattern

- [ ] **2.2.8** - Tests unitaires queries (>90%)- [ ] **2.2.7** - DTOs pour réponses

- [ ] **2.2.8** - Tests unitaires queries (>90%)

**Livrables**:

```**Livrables**:

src/application/```

├── queries/src/application/

│   ├── users/├── queries/

│   │   ├── GetUserByIdQuery.ts│   ├── users/

│   │   ├── GetUserByIdHandler.ts│   │   ├── GetUserByIdQuery.ts

│   │   └── __tests__/│   │   ├── GetUserByIdHandler.ts

│   ├── tasks/│   │   └── __tests__/

│   │   ├── GetTasksQuery.ts│   ├── tasks/

│   │   ├── GetTasksHandler.ts│   │   ├── GetTasksQuery.ts

│   │   ├── GetTaskByIdQuery.ts│   │   ├── GetTasksHandler.ts

│   │   ├── GetTaskByIdHandler.ts│   │   ├── GetTaskByIdQuery.ts

│   │   └── __tests__/│   │   ├── GetTaskByIdHandler.ts

│   ├── dashboard/│   │   └── __tests__/

│   │   ├── GetDashboardStatsQuery.ts│   ├── dashboard/

│   │   └── GetDashboardStatsHandler.ts│   │   ├── GetDashboardStatsQuery.ts

│   └── QueryBus.ts│   │   └── GetDashboardStatsHandler.ts

└── dtos/│   └── QueryBus.ts

    ├── UserDto.ts└── dtos/

    ├── TaskDto.ts    ├── UserDto.ts

    └── DashboardStatsDto.ts    ├── TaskDto.ts

```    └── DashboardStatsDto.ts

```

### 2.3 - Domain Services

**Objectif**: Services métier complexes (identique)### 2.3 - Domain Services

**Objectif**: Services métier complexes

**Tasks**:

- [ ] **2.3.1** - AuthenticationService (login, logout)**Tasks**:

- [ ] **2.3.2** - PasswordHashingService (bcrypt)- [ ] **2.3.1** - AuthenticationService (login, logout)

- [ ] **2.3.3** - TaskAssignmentService (logique d'assignation)- [ ] **2.3.2** - PasswordHashingService (bcrypt)

- [ ] **2.3.4** - TaskFilterService (filtrage avancé)- [ ] **2.3.3** - TaskAssignmentService (logique d'assignation)

- [ ] **2.3.5** - DashboardMetricsService (calcul stats)- [ ] **2.3.4** - TaskFilterService (filtrage avancé)

- [ ] **2.3.6** - Tests unitaires services (>90%)- [ ] **2.3.5** - DashboardMetricsService (calcul stats)

- [ ] **2.3.6** - Tests unitaires services (>90%)

**Livrables**:

```**Livrables**:

src/application/```

├── services/src/application/

│   ├── AuthenticationService.ts├── services/

│   ├── PasswordHashingService.ts│   ├── AuthenticationService.ts

│   ├── TaskAssignmentService.ts│   ├── PasswordHashingService.ts

│   ├── TaskFilterService.ts│   ├── TaskAssignmentService.ts

│   ├── DashboardMetricsService.ts│   ├── TaskFilterService.ts

│   └── __tests__/│   ├── DashboardMetricsService.ts

└── interfaces/│   └── __tests__/

    └── IPasswordHasher.ts└── interfaces/

```    └── IPasswordHasher.ts

```

---

---

## 🌐 PHASE 3 : Presentation Layer (API + HTMX) (5-6 jours)

## 🌐 PHASE 3 : Presentation Layer (API) (4-5 jours)

### 3.1 - Express Application Setup

**Objectif**: Configuration Express moderne avec support HTMX### 3.1 - Express Application Setup

**Objectif**: Configuration Express moderne

**Tasks**:

- [ ] **3.1.1** - Configuration Express 5 (ESM)**Tasks**:

- [ ] **3.1.2** - Middleware chain (helmet, cors, compression)- [ ] **3.1.1** - Configuration Express 5 (ESM)

- [ ] **3.1.3** - Session middleware (connect-pg-simple)- [ ] **3.1.2** - Middleware chain (helmet, cors, compression)

- [ ] **3.1.4** - **HTMX detection middleware** (req.headers['hx-request'])- [ ] **3.1.3** - Session middleware (connect-pg-simple)

- [ ] **3.1.5** - Error handling middleware (gère HTMX + normal)- [ ] **3.1.4** - Error handling middleware

- [ ] **3.1.6** - Request logging (pino-http)- [ ] **3.1.5** - Request logging (pino-http)

- [ ] **3.1.7** - Health check endpoints- [ ] **3.1.6** - Health check endpoints

- [ ] **3.1.8** - EJS configuration (layouts support)

**Livrables**:

**Livrables**:```

```src/

src/├── app.ts

├── app.ts├── server.ts

├── server.ts└── config/

└── config/    ├── express.config.ts

    ├── express.config.ts    └── session.config.ts

    ├── session.config.ts```

    └── htmx.config.ts  # NEW: HTMX-specific config

```### 3.2 - Controllers (HTTP Handlers)

**Objectif**: Controllers minces appelant use cases

### 3.2 - Controllers (HTTP Handlers avec support HTMX)

**Objectif**: Controllers minces avec logique HTMX**Tasks**:

- [ ] **3.2.1** - AuthController (login, register, logout)

**Tasks**:- [ ] **3.2.2** - TaskController (CRUD + filtres)

- [ ] **3.2.1** - AuthController (login, register, logout)- [ ] **3.2.3** - UserController (profile, settings)

- [ ] **3.2.2** - **TaskController avec HTMX** (CRUD + filtres partiels)- [ ] **3.2.4** - DashboardController (stats, team view)

- [ ] **3.2.3** - UserController (profile, settings)- [ ] **3.2.5** - Input validation (express-validator)

- [ ] **3.2.4** - DashboardController (stats, team view)- [ ] **3.2.6** - Response formatting (success/error handlers)

- [ ] **3.2.5** - Input validation (express-validator)- [ ] **3.2.7** - Tests unitaires controllers (>85%)

- [ ] **3.2.6** - **Response helpers** (renderOrPartial, htmxRedirect)

- [ ] **3.2.7** - Tests unitaires controllers (>85%)**Livrables**:

```

**Exemple Controller HTMX** :src/presentation/

```typescript├── controllers/

// TaskController.ts│   ├── AuthController.ts

async list(req: Request, res: Response) {│   ├── TaskController.ts

  const { status, search } = req.query;│   ├── UserController.ts

  const tasks = await this.queryBus.execute(new GetTasksQuery(status, search));│   ├── DashboardController.ts

  │   └── __tests__/

  // Si requête HTMX, renvoyer seulement le partial├── validators/

  if (req.headers['hx-request']) {│   ├── auth.validators.ts

    return res.render('partials/tasks/task-list', { tasks });│   ├── task.validators.ts

  }│   └── user.validators.ts

  └── formatters/

  // Sinon, renvoyer la page complète    ├── SuccessResponse.ts

  res.render('pages/tasks/index', { tasks });    └── ErrorResponse.ts

}```



async create(req: Request, res: Response) {### 3.3 - Routing & Middleware

  const task = await this.commandBus.execute(new CreateTaskCommand(req.body));**Objectif**: Routes organisées et middlewares réutilisables

  

  // HTMX: Renvoyer le nouveau item + header pour refresh liste**Tasks**:

  res.setHeader('HX-Trigger', 'taskCreated');- [ ] **3.3.1** - Route definitions (auth, tasks, users, dashboard)

  res.render('partials/tasks/task-item', { task });- [ ] **3.3.2** - Authentication middleware (requireAuth)

}- [ ] **3.3.3** - Authorization middleware (requireAdmin, requireOwner)

```- [ ] **3.3.4** - Rate limiting middleware

- [ ] **3.3.5** - CSRF protection

**Livrables**:- [ ] **3.3.6** - i18n middleware

```- [ ] **3.3.7** - Tests middleware (>90%)

src/presentation/

├── controllers/**Livrables**:

│   ├── AuthController.ts```

│   ├── TaskController.ts  # Avec logique HTMXsrc/presentation/

│   ├── UserController.ts├── routes/

│   ├── DashboardController.ts│   ├── index.ts

│   └── __tests__/│   ├── auth.routes.ts

├── validators/│   ├── task.routes.ts

│   ├── auth.validators.ts│   ├── user.routes.ts

│   ├── task.validators.ts│   └── dashboard.routes.ts

│   └── user.validators.ts└── middleware/

├── helpers/    ├── authentication.middleware.ts

│   ├── htmx.helper.ts  # NEW: Helpers HTMX    ├── authorization.middleware.ts

│   └── response.helper.ts    ├── rate-limit.middleware.ts

└── formatters/    ├── csrf.middleware.ts

    ├── SuccessResponse.ts    ├── i18n.middleware.ts

    └── ErrorResponse.ts    └── __tests__/

``````



### 3.3 - Routing & Middleware---

**Objectif**: Routes organisées et middlewares réutilisables

## 🎨 PHASE 4 : Frontend (Views & Design System) (5-7 jours)

**Tasks**:

- [ ] **3.3.1** - Route definitions (auth, tasks, users, dashboard)### 4.1 - Design System Setup

- [ ] **3.3.2** - Authentication middleware (requireAuth)**Objectif**: Tailwind CSS 4 + DaisyUI + tokens glassmorphism

- [ ] **3.3.3** - Authorization middleware (requireAdmin, requireOwner)

- [ ] **3.3.4** - **HTMX middleware** (detects partial requests)**Tasks**:

- [ ] **3.3.5** - Rate limiting middleware- [ ] **4.1.1** - Configuration Tailwind CSS 4 beta

- [ ] **3.3.6** - CSRF protection (compatible HTMX)- [ ] **4.1.2** - Configuration DaisyUI 5.3.7

- [ ] **3.3.7** - i18n middleware- [ ] **4.1.3** - Thèmes custom (taskflowGlass light/dark)

- [ ] **3.3.8** - Tests middleware (>90%)- [ ] **4.1.4** - Design tokens (surfaces, colors, spacing)

- [ ] **4.1.5** - CSS utilities glassmorphism

**Livrables**:- [ ] **4.1.6** - Build pipeline CSS (PostCSS)

```- [ ] **4.1.7** - Documentation Storybook-like (HTML examples)

src/presentation/

├── routes/**Livrables**:

│   ├── index.ts```

│   ├── auth.routes.tstailwind.config.ts

│   ├── task.routes.ts  # Routes + partialspostcss.config.js

│   ├── user.routes.tspublic/

│   └── dashboard.routes.ts├── css/

└── middleware/│   ├── tailwind.css

    ├── authentication.middleware.ts│   └── output.css (generated)

    ├── authorization.middleware.ts└── design-tokens/

    ├── htmx.middleware.ts  # NEW    └── glassmorphism.css

    ├── rate-limit.middleware.tsdocs/

    ├── csrf.middleware.ts└── design-system/

    ├── i18n.middleware.ts    ├── colors.md

    └── __tests__/    ├── typography.md

```    ├── components.md

    └── glassmorphism-guide.md

---```



## 🎨 PHASE 4 : Frontend SSR (EJS + HTMX + Alpine) (6-8 jours)### 4.2 - EJS Templates Architecture

**Objectif**: Composants EJS réutilisables + layouts

### 4.1 - Design System Setup

**Objectif**: Tailwind CSS 4 + DaisyUI + tokens glassmorphism (identique)**Tasks**:

- [ ] **4.2.1** - Layout principal (main.ejs)

**Tasks**:- [ ] **4.2.2** - Partials: head, header, footer, flash-messages

- [ ] **4.1.1** - Configuration Tailwind CSS 4 beta- [ ] **4.2.3** - Composants UI (surface, stat-card, badge, avatar)

- [ ] **4.1.2** - Configuration DaisyUI 5.3.7- [ ] **4.2.4** - Composants forms (field, input, select, textarea)

- [ ] **4.1.3** - Thèmes custom (taskflowGlass light/dark)- [ ] **4.2.5** - View models (presenters pour données)

- [ ] **4.1.4** - Design tokens (surfaces, colors, spacing)- [ ] **4.2.6** - Helpers EJS customs

- [ ] **4.1.5** - CSS utilities glassmorphism- [ ] **4.2.7** - Tests snapshots templates

- [ ] **4.1.6** - Build pipeline CSS (PostCSS)

- [ ] **4.1.7** - Documentation Storybook-like (HTML examples)**Livrables**:

```

**Livrables**:views/

```├── layouts/

tailwind.config.ts│   └── main.ejs

postcss.config.js├── partials/

public/│   ├── head.ejs

├── css/│   ├── header.ejs

│   ├── tailwind.css│   ├── footer.ejs

│   └── output.css (generated)│   ├── flash-messages.ejs

└── design-tokens/│   └── ui/

    └── glassmorphism.css│       ├── surface.ejs

docs/│       ├── stat-card.ejs

└── design-system/│       ├── badge.ejs

    ├── colors.md│       ├── avatar.ejs

    ├── typography.md│       └── forms/

    ├── components.md│           ├── field.ejs

    └── glassmorphism-guide.md│           ├── input.ejs

```│           └── select.ejs

└── helpers/

### 4.2 - EJS Templates Architecture (avec HTMX)    ├── date.helper.ejs

**Objectif**: Composants EJS réutilisables + layouts + partials HTMX    └── text.helper.ejs

```

**Tasks**:

- [ ] **4.2.1** - Layout principal (main.ejs) avec scripts HTMX/Alpine### 4.3 - Pages Implementation

- [ ] **4.2.2** - Partials: head, header, footer, flash-messages**Objectif**: Toutes les pages de l'application

- [ ] **4.2.3** - **Partials HTMX** (task-list, task-item, task-filters)

- [ ] **4.2.4** - Composants UI (surface, stat-card, badge, avatar)**Tasks**:

- [ ] **4.2.5** - Composants forms (field, input, select, textarea)- [ ] **4.3.1** - Page: Home (landing page)

- [ ] **4.2.6** - View models (presenters pour données)- [ ] **4.3.2** - Page: Login / Register

- [ ] **4.2.7** - Helpers EJS customs- [ ] **4.3.3** - Page: Dashboard (stats + recent tasks)

- [ ] **4.2.8** - Tests snapshots templates- [ ] **4.3.4** - Page: Tasks List (filtres, pagination)

- [ ] **4.3.5** - Page: Task Detail (view + edit)

**Exemple Layout avec HTMX/Alpine** :- [ ] **4.3.6** - Page: Task Create/Edit Form

```ejs- [ ] **4.3.7** - Page: Team View (capacité)

<!-- views/layouts/main.ejs -->- [ ] **4.3.8** - Page: User Profile

<!DOCTYPE html>- [ ] **4.3.9** - Page: Settings (thème, langue)

<html lang="<%= locale %>" data-theme="<%= theme %>">- [ ] **4.3.10** - Pages: Errors (404, 500)

<head>

  <%- include('../partials/head') %>**Livrables**:

  <!-- HTMX -->```

  <script src="https://unpkg.com/htmx.org@1.9.10"></script>views/pages/

  <!-- Alpine.js -->├── home.ejs

  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>├── auth/

  <!-- HTMX Extensions -->│   ├── login.ejs

  <script src="https://unpkg.com/htmx.org/dist/ext/loading-states.js"></script>│   └── register.ejs

</head>├── dashboard.ejs

<body>├── tasks/

  <%- include('../partials/header') %>│   ├── index.ejs

  │   ├── detail.ejs

  <main class="tf-main">│   └── form.ejs

    <%- include('../partials/flash-messages') %>├── team.ejs

    <%- body %>├── users/

  </main>│   ├── profile.ejs

  │   └── settings.ejs

  <%- include('../partials/footer') %>└── errors/

</body>    ├── 404.ejs

</html>    └── 500.ejs

``````



**Livrables**:### 4.4 - Client-Side Enhancements (Progressive Enhancement)

```**Objectif**: Alpine.js pour interactivité légère

views/

├── layouts/**Tasks**:

│   └── main.ejs  # Inclut HTMX + Alpine- [ ] **4.4.1** - Setup Alpine.js

├── partials/- [ ] **4.4.2** - Theme switcher (light/dark mode)

│   ├── head.ejs- [ ] **4.4.3** - Filter tasks in-page (sans reload)

│   ├── header.ejs- [ ] **4.4.4** - Toast notifications

│   ├── footer.ejs- [ ] **4.4.5** - Form validation client-side

│   ├── flash-messages.ejs- [ ] **4.4.6** - Modal dialogs

│   ├── htmx/  # NEW: Partials HTMX réutilisables- [ ] **4.4.7** - Optimistic UI updates

│   │   ├── task-list.ejs

│   │   ├── task-item.ejs**Livrables**:

│   │   ├── task-filters.ejs```

│   │   └── pagination.ejspublic/js/

│   └── ui/├── alpine-init.js

│       ├── surface.ejs├── theme-switcher.js

│       ├── stat-card.ejs├── task-filters.js

│       ├── badge.ejs├── toast.js

│       ├── avatar.ejs└── form-validation.js

│       └── forms/```

│           ├── field.ejs

│           ├── input.ejs---

│           └── select.ejs

└── helpers/## 🌍 PHASE 5 : Internationalisation (i18n) (2-3 jours)

    ├── date.helper.ejs

    ├── text.helper.ejs### 5.1 - i18n Infrastructure

    └── htmx.helper.ejs  # NEW**Objectif**: Support multi-langue FR/EN

```

**Tasks**:

### 4.3 - Pages Implementation avec HTMX- [ ] **5.1.1** - Service i18n avec MessageFormat

**Objectif**: Toutes les pages de l'application avec interactivité HTMX- [ ] **5.1.2** - Fichiers traductions FR

- [ ] **5.1.3** - Fichiers traductions EN

**Tasks**:- [ ] **5.1.4** - Middleware détection langue (cookies + header)

- [ ] **4.3.1** - Page: Home (landing page)- [ ] **5.1.5** - Helper EJS t() et __()

- [ ] **4.3.2** - Page: Login / Register (HTMX form validation)- [ ] **5.1.6** - Formatters (dates, nombres, currency)

- [ ] **4.3.3** - Page: Dashboard (stats + recent tasks)- [ ] **5.1.7** - Tests i18n

- [ ] **4.3.4** - **Page: Tasks List avec HTMX** (filtres, pagination, search)

- [ ] **4.3.5** - **Page: Task Detail avec HTMX** (édition inline)**Livrables**:

- [ ] **4.3.6** - **Page: Task Create/Edit Form** (validation temps réel)```

- [ ] **4.3.7** - Page: Team View (capacité)locales/

- [ ] **4.3.8** - Page: User Profile├── fr.json

- [ ] **4.3.9** - Page: Settings (thème, langue)├── en.json

- [ ] **4.3.10** - Pages: Errors (404, 500)└── formatters/

    ├── date.formats.json

**Exemple Page Tasks avec HTMX** :    └── number.formats.json

```ejssrc/infrastructure/

<!-- views/pages/tasks/index.ejs -->└── i18n/

<div class="tasks-page">    ├── I18nService.ts

      ├── MessageFormatter.ts

  <!-- Filtres (HTMX trigger sur change) -->    └── __tests__/

  <form hx-get="/tasks" ```

        hx-target="#task-list" 

        hx-trigger="change, submit"### 5.2 - Translation Coverage

        hx-indicator="#loading"**Objectif**: Traduire toute l'interface

        class="filters">

    **Tasks**:

    <input type="text" - [ ] **5.2.1** - Traductions auth (login, register, errors)

           name="search" - [ ] **5.2.2** - Traductions tasks (statuts, priorités, actions)

           placeholder="<%= t('tasks.search') %>"- [ ] **5.2.3** - Traductions dashboard (métriques, stats)

           hx-trigger="keyup changed delay:300ms"- [ ] **5.2.4** - Traductions forms (labels, placeholders, validations)

           class="input input-bordered">- [ ] **5.2.5** - Traductions emails (notifications)

    - [ ] **5.2.6** - Test coverage traductions (keys manquantes)

    <select name="status" class="select select-bordered">

      <option value=""><%= t('tasks.allStatuses') %></option>---

      <option value="TODO"><%= t('tasks.statuses.todo') %></option>

      <option value="IN_PROGRESS"><%= t('tasks.statuses.in_progress') %></option>## 🧪 PHASE 6 : Testing Complet (4-5 jours)

      <option value="DONE"><%= t('tasks.statuses.done') %></option>

    </select>### 6.1 - Unit Tests

    **Objectif**: Tests unitaires >90% coverage

    <span id="loading" class="htmx-indicator">

      <span class="loading loading-spinner"></span>**Tasks**:

    </span>- [ ] **6.1.1** - Tests domain entities + value objects

  </form>- [ ] **6.1.2** - Tests command handlers

- [ ] **6.1.3** - Tests query handlers

  <!-- Liste des tâches (remplacée par HTMX) -->- [ ] **6.1.4** - Tests services

  <div id="task-list">- [ ] **6.1.5** - Tests controllers

    <%- include('../../partials/htmx/task-list', { tasks }) %>- [ ] **6.1.6** - Tests middleware

  </div>- [ ] **6.1.7** - Configuration coverage thresholds



  <!-- Bouton créer (Modal Alpine.js) -->**Livrables**:

  <div x-data="{ modalOpen: false }">```

    <button @click="modalOpen = true" class="btn btn-primary">vitest.config.ts

      <%= t('tasks.create') %>src/**/__tests__/

    </button>    ├── *.test.ts

        └── *.spec.ts

    <div x-show="modalOpen" ```

         x-transition 

         class="modal modal-open">### 6.2 - Integration Tests

      <div class="modal-box">**Objectif**: Tests d'intégration API + DB

        <h3><%= t('tasks.createTask') %></h3>

        **Tasks**:

        <!-- Form HTMX -->- [ ] **6.2.1** - Setup database test (container Docker)

        <form hx-post="/tasks" - [ ] **6.2.2** - Tests repositories (Prisma queries)

              hx-target="#task-list" - [ ] **6.2.3** - Tests API endpoints (supertest)

              hx-swap="afterbegin"- [ ] **6.2.4** - Tests authentication flow

              @htmx:after-request="modalOpen = false">- [ ] **6.2.5** - Tests session management

          <input type="text" name="title" required class="input input-bordered">- [ ] **6.2.6** - Fixtures & factories data

          <textarea name="description" class="textarea textarea-bordered"></textarea>

          <button type="submit" class="btn btn-primary">**Livrables**:

            <%= t('common.save') %>```

          </button>tests/

        </form>├── integration/

      </div>│   ├── repositories/

    </div>│   ├── api/

  </div>│   └── auth/

└── fixtures/

</div>    ├── users.fixture.ts

```    └── tasks.fixture.ts

```

**Livrables**:

```### 6.3 - E2E Tests (Playwright)

views/pages/**Objectif**: Tests end-to-end scénarios utilisateur

├── home.ejs

├── auth/**Tasks**:

│   ├── login.ejs  # HTMX validation- [ ] **6.3.1** - Configuration Playwright

│   └── register.ejs- [ ] **6.3.2** - Test: User registration flow

├── dashboard.ejs- [ ] **6.3.3** - Test: Login/logout flow

├── tasks/- [ ] **6.3.4** - Test: Create task flow

│   ├── index.ejs  # Avec HTMX- [ ] **6.3.5** - Test: Edit task flow

│   ├── detail.ejs  # Édition inline HTMX- [ ] **6.3.6** - Test: Assign task flow

│   └── form.ejs- [ ] **6.3.7** - Test: Dashboard rendering

├── team.ejs- [ ] **6.3.8** - Test: Responsive (mobile, tablet, desktop)

├── users/- [ ] **6.3.9** - Test: Dark mode toggle

│   ├── profile.ejs- [ ] **6.3.10** - Test: i18n switch (FR ↔ EN)

│   └── settings.ejs

└── errors/**Livrables**:

    ├── 404.ejs```

    └── 500.ejsplaywright.config.ts

```tests/e2e/

├── auth.spec.ts

### 4.4 - Client-Side JavaScript (HTMX + Alpine.js)├── tasks.spec.ts

**Objectif**: Scripts pour HTMX extensions et Alpine.js components├── dashboard.spec.ts

├── responsive.spec.ts

**Tasks**:├── theme.spec.ts

- [ ] **4.4.1** - Setup HTMX config global└── utils/

- [ ] **4.4.2** - HTMX extensions (loading states, response targets)    └── page-objects/

- [ ] **4.4.3** - Theme switcher (Alpine.js + localStorage)```

- [ ] **4.4.4** - Toast notifications (HTMX events)

- [ ] **4.4.5** - Modal dialogs (Alpine.js)---

- [ ] **4.4.6** - Dropdown menus (Alpine.js)

- [ ] **4.4.7** - Form validation helpers## 🔒 PHASE 7 : Sécurité & Performance (3-4 jours)

- [ ] **4.4.8** - HTMX event listeners customs

### 7.1 - Sécurité

**Exemple HTMX Config** :**Objectif**: Hardening sécurité

```javascript

// public/js/htmx-config.js**Tasks**:

document.addEventListener('DOMContentLoaded', () => {- [ ] **7.1.1** - Audit dépendances (npm audit)

  // Config global HTMX- [ ] **7.1.2** - CSRF protection implementation

  htmx.config.globalViewTransitions = true;- [ ] **7.1.3** - XSS protection (sanitization)

  htmx.config.defaultSwapStyle = 'outerHTML';- [ ] **7.1.4** - SQL injection prevention (Prisma)

  - [ ] **7.1.5** - Rate limiting (brute force protection)

  // Event: Success notification- [ ] **7.1.6** - Helmet.js configuration

  document.body.addEventListener('htmx:afterRequest', (event) => {- [ ] **7.1.7** - Content Security Policy

    if (event.detail.successful) {- [ ] **7.1.8** - Security headers

      showToast('Succès !', 'success');- [ ] **7.1.9** - HTTPS/SSL configuration

    }- [ ] **7.1.10** - Secrets management (.env validation)

  });

  **Livrables**:

  // Event: Error handling```

  document.body.addEventListener('htmx:responseError', (event) => {src/config/

    showToast('Erreur serveur', 'error');├── security.config.ts

  });└── helmet.config.ts

  docs/

  // Event: Loading indicators└── security/

  document.body.addEventListener('htmx:beforeRequest', () => {    ├── SECURITY.md

    document.body.classList.add('htmx-loading');    └── threat-model.md

  });```

  

  document.body.addEventListener('htmx:afterRequest', () => {### 7.2 - Performance Optimization

    document.body.classList.remove('htmx-loading');**Objectif**: Application performante

  });

});**Tasks**:

```- [ ] **7.2.1** - Query optimization (N+1 queries)

- [ ] **7.2.2** - Database indexes review

**Livrables**:- [ ] **7.2.3** - Response compression (gzip)

```- [ ] **7.2.4** - Static assets caching

public/js/- [ ] **7.2.5** - EJS template caching

├── htmx-config.js  # NEW: HTMX global config- [ ] **7.2.6** - CSS purging (Tailwind)

├── htmx-extensions.js  # NEW: Custom extensions- [ ] **7.2.7** - Lazy loading images

├── alpine-components.js  # Alpine.js components- [ ] **7.2.8** - Bundle size optimization

├── theme-switcher.js- [ ] **7.2.9** - Lighthouse audit (score >90)

├── toast.js

├── form-validation.js**Livrables**:

└── utils.js```

```docs/performance/

├── lighthouse-report.html

---├── bundle-analysis.json

└── performance-benchmarks.md

## 🌍 PHASE 5 : Internationalisation (i18n) (2-3 jours)```



### 5.1 - i18n Infrastructure (identique)---

**Objectif**: Support multi-langue FR/EN

## 📊 PHASE 8 : Observabilité & Monitoring (2-3 jours)

**Tasks**:

- [ ] **5.1.1** - Service i18n avec MessageFormat### 8.1 - Logging

- [ ] **5.1.2** - Fichiers traductions FR**Objectif**: Système de logging structuré

- [ ] **5.1.3** - Fichiers traductions EN

- [ ] **5.1.4** - Middleware détection langue (cookies + header)**Tasks**:

- [ ] **5.1.5** - Helper EJS t() et __()- [ ] **8.1.1** - Configuration Pino logger

- [ ] **5.1.6** - Formatters (dates, nombres, currency)- [ ] **8.1.2** - Log levels (debug, info, warn, error)

- [ ] **5.1.7** - Tests i18n- [ ] **8.1.3** - Structured logging (JSON format)

- [ ] **8.1.4** - Request/response logging

**Livrables**:- [ ] **8.1.5** - Error tracking avec stack traces

```- [ ] **8.1.6** - Log rotation (production)

locales/

├── fr.json**Livrables**:

├── en.json```

└── formatters/src/infrastructure/

    ├── date.formats.json└── logging/

    └── number.formats.json    ├── logger.ts

src/infrastructure/    ├── pino.config.ts

└── i18n/    └── formatters/

    ├── I18nService.ts```

    ├── MessageFormatter.ts

    └── __tests__/### 8.2 - Metrics & Tracing (OpenTelemetry)

```**Objectif**: Monitoring APM



### 5.2 - Translation Coverage (identique)**Tasks**:

**Objectif**: Traduire toute l'interface- [ ] **8.2.1** - Setup OpenTelemetry SDK

- [ ] **8.2.2** - Auto-instrumentation (HTTP, DB)

**Tasks**:- [ ] **8.2.3** - Custom metrics (business metrics)

- [ ] **5.2.1** - Traductions auth (login, register, errors)- [ ] **8.2.4** - Distributed tracing

- [ ] **5.2.2** - Traductions tasks (statuts, priorités, actions)- [ ] **8.2.5** - Exporters configuration

- [ ] **5.2.3** - Traductions dashboard (métriques, stats)- [ ] **8.2.6** - Dashboards (Grafana compatible)

- [ ] **5.2.4** - Traductions forms (labels, placeholders, validations)

- [ ] **5.2.5** - Traductions emails (notifications)**Livrables**:

- [ ] **5.2.6** - Test coverage traductions (keys manquantes)```

src/infrastructure/

---└── observability/

    ├── telemetry.ts

## 🧪 PHASE 6 : Testing Complet (5-6 jours)    ├── metrics.ts

    └── tracing.ts

### 6.1 - Unit Tests (identique)```

**Objectif**: Tests unitaires >90% coverage

---

**Tasks**:

- [ ] **6.1.1** - Tests domain entities + value objects## 🚀 PHASE 9 : DevOps & CI/CD (3-4 jours)

- [ ] **6.1.2** - Tests command handlers

- [ ] **6.1.3** - Tests query handlers### 9.1 - Docker Production

- [ ] **6.1.4** - Tests services**Objectif**: Images optimisées production

- [ ] **6.1.5** - Tests controllers

- [ ] **6.1.6** - Tests middleware**Tasks**:

- [ ] **6.1.7** - Configuration coverage thresholds- [ ] **9.1.1** - Dockerfile multi-stage optimisé

- [ ] **9.1.2** - Image size reduction (<200MB)

**Livrables**:- [ ] **9.1.3** - Security scanning (Trivy)

```- [ ] **9.1.4** - Non-root user

vitest.config.ts- [ ] **9.1.5** - Health checks

src/**/__tests__/- [ ] **9.1.6** - docker-compose production

    ├── *.test.ts

    └── *.spec.ts**Livrables**:

``````

Dockerfile

### 6.2 - Integration Tests (identique).dockerignore

**Objectif**: Tests d'intégration API + DBdocker-compose.prod.yml

```

**Tasks**:

- [ ] **6.2.1** - Setup database test (container Docker)### 9.2 - GitHub Actions CI/CD

- [ ] **6.2.2** - Tests repositories (Prisma queries)**Objectif**: Pipeline CI/CD automatisé

- [ ] **6.2.3** - Tests API endpoints (supertest)

- [ ] **6.2.4** - Tests authentication flow**Tasks**:

- [ ] **6.2.5** - Tests session management- [ ] **9.2.1** - Workflow: Lint & Format check

- [ ] **6.2.6** - Fixtures & factories data- [ ] **9.2.2** - Workflow: Unit tests

- [ ] **9.2.3** - Workflow: Integration tests

**Livrables**:- [ ] **9.2.4** - Workflow: E2E tests

```- [ ] **9.2.5** - Workflow: Security audit

tests/- [ ] **9.2.6** - Workflow: Build & push Docker image

├── integration/- [ ] **9.2.7** - Workflow: Deploy staging/production

│   ├── repositories/- [ ] **9.2.8** - Code coverage reporting

│   ├── api/

│   └── auth/**Livrables**:

└── fixtures/```

    ├── users.fixture.ts.github/

    └── tasks.fixture.ts├── workflows/

```│   ├── ci.yml

│   ├── cd.yml

### 6.3 - E2E Tests (Playwright avec HTMX)│   ├── security.yml

**Objectif**: Tests end-to-end scénarios utilisateur avec HTMX│   └── deploy.yml

└── dependabot.yml

**Tasks**:```

- [ ] **6.3.1** - Configuration Playwright

- [ ] **6.3.2** - Test: User registration flow### 9.3 - Documentation Deployment

- [ ] **6.3.3** - Test: Login/logout flow**Objectif**: Guide déploiement production

- [ ] **6.3.4** - **Test: Create task flow (HTMX)**

- [ ] **6.3.5** - **Test: Filter tasks (HTMX partial updates)****Tasks**:

- [ ] **6.3.6** - **Test: Edit task inline (HTMX)**- [ ] **9.3.1** - Guide installation

- [ ] **6.3.7** - Test: Dashboard rendering- [ ] **9.3.2** - Configuration environnement production

- [ ] **6.3.8** - Test: Responsive (mobile, tablet, desktop)- [ ] **9.3.3** - Migration database guide

- [ ] **6.3.9** - Test: Dark mode toggle (Alpine.js)- [ ] **9.3.4** - Backup & restore procedures

- [ ] **6.3.10** - Test: i18n switch (FR ↔ EN)- [ ] **9.3.5** - Monitoring setup

- [ ] **6.3.11** - **Test: HTMX indicators & loading states**- [ ] **9.3.6** - Troubleshooting guide



**Exemple Test E2E HTMX** :**Livrables**:

```typescript```

// tests/e2e/tasks-htmx.spec.tsdocs/deployment/

test('should filter tasks with HTMX without page reload', async ({ page }) => {├── INSTALLATION.md

  await page.goto('/tasks');├── PRODUCTION.md

  ├── MIGRATIONS.md

  // Attendre que HTMX soit chargé├── BACKUP.md

  await page.waitForSelector('[hx-get]');└── TROUBLESHOOTING.md

  ```

  // Changer le filtre de statut

  await page.selectOption('select[name="status"]', 'TODO');---

  

  // Attendre que HTMX remplace le contenu## 📚 PHASE 10 : Documentation & Polish (2-3 jours)

  await page.waitForResponse(response => 

    response.url().includes('/tasks') && response.status() === 200### 10.1 - Documentation Technique

  );**Objectif**: Documentation complète

  

  // Vérifier que la page n'a PAS été rechargée (URL identique)**Tasks**:

  expect(page.url()).toContain('/tasks');- [ ] **10.1.1** - README.md (overview, quick start)

  - [ ] **10.1.2** - CONTRIBUTING.md (guide contribution)

  // Vérifier que seul #task-list a changé- [ ] **10.1.3** - ARCHITECTURE.md (diagrammes)

  const taskList = await page.locator('#task-list');- [ ] **10.1.4** - API documentation (OpenAPI/Swagger)

  await expect(taskList).toContainText('À faire');- [ ] **10.1.5** - Database schema documentation

});- [ ] **10.1.6** - Code comments (JSDoc)

```- [ ] **10.1.7** - Changelog



**Livrables**:**Livrables**:

``````

playwright.config.tsREADME.md

tests/e2e/CONTRIBUTING.md

├── auth.spec.tsCHANGELOG.md

├── tasks.spec.tsdocs/

├── tasks-htmx.spec.ts  # NEW: Tests HTMX├── ARCHITECTURE.md

├── dashboard.spec.ts├── API.md

├── responsive.spec.ts├── DATABASE.md

├── theme.spec.ts└── diagrams/

└── utils/    ├── architecture.png

    ├── page-objects/    ├── database-schema.png

    └── htmx-helpers.ts  # NEW: Helpers pour tester HTMX    └── flow-diagrams.png

``````



---### 10.2 - User Documentation

**Objectif**: Guide utilisateur

## 🔒 PHASE 7 : Sécurité & Performance (3-4 jours)

**Tasks**:

### 7.1 - Sécurité (avec HTMX)- [ ] **10.2.1** - User manual (FR)

**Objectif**: Hardening sécurité + HTMX-specific- [ ] **10.2.2** - User manual (EN)

- [ ] **10.2.3** - FAQ

**Tasks**:- [ ] **10.2.4** - Video tutorials (optionnel)

- [ ] **7.1.1** - Audit dépendances (npm audit)- [ ] **10.2.5** - Screenshots features

- [ ] **7.1.2** - **CSRF protection compatible HTMX** (tokens auto)

- [ ] **7.1.3** - XSS protection (sanitization)**Livrables**:

- [ ] **7.1.4** - SQL injection prevention (Prisma)```

- [ ] **7.1.5** - Rate limiting (brute force protection)docs/user/

- [ ] **7.1.6** - Helmet.js configuration├── fr/

- [ ] **7.1.7** - **Content Security Policy (autoriser HTMX/Alpine CDN)**│   ├── manual.md

- [ ] **7.1.8** - Security headers│   └── faq.md

- [ ] **7.1.9** - HTTPS/SSL configuration├── en/

- [ ] **7.1.10** - Secrets management (.env validation)│   ├── manual.md

│   └── faq.md

**CSRF avec HTMX** :└── screenshots/

```typescript```

// Middleware CSRF pour HTMX

app.use((req, res, next) => {### 10.3 - Code Quality & Refactoring

  // Ajouter token CSRF dans meta tag**Objectif**: Polish final

  res.locals.csrfToken = req.csrfToken();

  next();**Tasks**:

});- [ ] **10.3.1** - Code review complet

```- [ ] **10.3.2** - Refactoring duplications

- [ ] **10.3.3** - Optimisation imports

```ejs- [ ] **10.3.4** - Clean up TODO/FIXME comments

<!-- Layout: meta tag pour HTMX -->- [ ] **10.3.5** - Consistent naming conventions

<meta name="csrf-token" content="<%= csrfToken %>">- [ ] **10.3.6** - Final lint check (zero warnings)



<script>---

  // HTMX auto-include CSRF token

  document.body.addEventListener('htmx:configRequest', (event) => {## 🎓 PHASE 11 : Features Avancées (Optionnel) (5-7 jours)

    event.detail.headers['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content;

  });### 11.1 - Real-time Notifications (WebSockets)

</script>**Objectif**: Notifications temps réel

```

**Tasks**:

**Livrables**:- [ ] **11.1.1** - Setup Socket.io

```- [ ] **11.1.2** - Event: Task assigned

src/config/- [ ] **11.1.3** - Event: Task updated

├── security.config.ts- [ ] **11.1.4** - Event: Comment added

├── helmet.config.ts- [ ] **11.1.5** - Client-side notifications

└── csrf.config.ts  # NEW: CSRF + HTMX- [ ] **11.1.6** - Notification center UI

docs/

└── security/### 11.2 - Advanced Features

    ├── SECURITY.md**Objectif**: Features premium

    ├── threat-model.md

    └── htmx-security.md  # NEW**Tasks**:

```- [ ] **11.2.1** - Task comments system

- [ ] **11.2.2** - File attachments (S3/MinIO)

### 7.2 - Performance Optimization- [ ] **11.2.3** - Advanced filtering (saved filters)

**Objectif**: Application performante avec SSR- [ ] **11.2.4** - Kanban board view

- [ ] **11.2.5** - Calendar view

**Tasks**:- [ ] **11.2.6** - Export tasks (CSV, PDF)

- [ ] **7.2.1** - Query optimization (N+1 queries)- [ ] **11.2.7** - Email notifications

- [ ] **7.2.2** - Database indexes review- [ ] **11.2.8** - Activity timeline

- [ ] **7.2.3** - Response compression (gzip)- [ ] **11.2.9** - Tags system

- [ ] **7.2.4** - Static assets caching- [ ] **11.2.10** - Search full-text

- [ ] **7.2.5** - EJS template caching

- [ ] **7.2.6** - CSS purging (Tailwind)### 11.3 - Admin Panel

- [ ] **7.2.7** - **HTMX response optimization** (partials size)**Objectif**: Interface administration

- [ ] **7.2.8** - Lazy loading images

- [ ] **7.2.9** - Bundle size optimization**Tasks**:

- [ ] **7.2.10** - Lighthouse audit (score >90)- [ ] **11.3.1** - User management (CRUD)

- [ ] **11.3.2** - Role management

**Livrables**:- [ ] **11.3.3** - System metrics dashboard

```- [ ] **11.3.4** - Audit logs

docs/performance/- [ ] **11.3.5** - Settings management

├── lighthouse-report.html

├── bundle-analysis.json---

├── performance-benchmarks.md

└── htmx-optimization.md  # NEW## 📅 Timeline Estimé

```

| Phase | Durée | Jours cumulés |

---|-------|-------|---------------|

| Phase 0: Setup | 2-3 jours | 3 |

## 📊 PHASE 8 : Observabilité & Monitoring (2-3 jours)| Phase 1: Core Domain | 5-7 jours | 10 |

| Phase 2: Application Layer | 5-7 jours | 17 |

### 8.1 - Logging (identique)| Phase 3: Presentation API | 4-5 jours | 22 |

**Objectif**: Système de logging structuré| Phase 4: Frontend | 5-7 jours | 29 |

| Phase 5: i18n | 2-3 jours | 32 |

**Tasks**:| Phase 6: Testing | 4-5 jours | 37 |

- [ ] **8.1.1** - Configuration Pino logger| Phase 7: Sécurité | 3-4 jours | 41 |

- [ ] **8.1.2** - Log levels (debug, info, warn, error)| Phase 8: Observabilité | 2-3 jours | 44 |

- [ ] **8.1.3** - Structured logging (JSON format)| Phase 9: DevOps | 3-4 jours | 48 |

- [ ] **8.1.4** - Request/response logging (distinguish HTMX requests)| Phase 10: Documentation | 2-3 jours | 51 |

- [ ] **8.1.5** - Error tracking avec stack traces| **TOTAL MVP** | **~51 jours** | **~10 semaines** |

- [ ] **8.1.6** - Log rotation (production)| Phase 11: Features avancées (optionnel) | 5-7 jours | +7 |



**Livrables**:**Note**: Timeline pour 1 développeur fullstack expérimenté. Ajuster selon ressources.

```

src/infrastructure/---

└── logging/

    ├── logger.ts## 🎯 Critères de Succès

    ├── pino.config.ts

    └── formatters/### Qualité Code

```- ✅ Coverage tests unitaires ≥ 90%

- ✅ Coverage tests E2E ≥ 80%

### 8.2 - Metrics & Tracing (OpenTelemetry)- ✅ Zéro vulnérabilités critiques (npm audit)

**Objectif**: Monitoring APM- ✅ ESLint: 0 errors, 0 warnings

- ✅ TypeScript strict mode activé

**Tasks**:- ✅ Code review passé

- [ ] **8.2.1** - Setup OpenTelemetry SDK

- [ ] **8.2.2** - Auto-instrumentation (HTTP, DB)### Performance

- [ ] **8.2.3** - Custom metrics (business metrics)- ✅ Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)

- [ ] **8.2.4** - **HTMX request metrics** (track partial updates)- ✅ Time to First Byte (TTFB) < 200ms

- [ ] **8.2.5** - Distributed tracing- ✅ First Contentful Paint (FCP) < 1.5s

- [ ] **8.2.6** - Exporters configuration- ✅ Largest Contentful Paint (LCP) < 2.5s

- [ ] **8.2.7** - Dashboards (Grafana compatible)- ✅ Bundle size < 200KB (gzipped)



**Livrables**:### Accessibilité

```- ✅ WCAG 2.2 AA compliance

src/infrastructure/- ✅ Clavier navigation complète

└── observability/- ✅ Screen reader compatible

    ├── telemetry.ts- ✅ Color contrast ≥ 4.5:1

    ├── metrics.ts

    ├── tracing.ts### Sécurité

    └── htmx-metrics.ts  # NEW- ✅ OWASP Top 10 addressed

```- ✅ Security headers configurés

- ✅ HTTPS/SSL en production

---- ✅ Rate limiting actif

- ✅ CSRF protection

## 🚀 PHASE 9 : DevOps & CI/CD (3-4 jours)

### DevOps

### 9.1 - Docker Production (identique)- ✅ CI/CD pipeline fonctionnel

**Objectif**: Images optimisées production- ✅ Tests automatisés sur PR

- ✅ Docker images < 200MB

**Tasks**:- ✅ Logs centralisés

- [ ] **9.1.1** - Dockerfile multi-stage optimisé- ✅ Metrics & monitoring

- [ ] **9.1.2** - Image size reduction (<200MB)

- [ ] **9.1.3** - Security scanning (Trivy)---

- [ ] **9.1.4** - Non-root user

- [ ] **9.1.5** - Health checks## 🛠️ Stack Technique Complète

- [ ] **9.1.6** - docker-compose production

### Backend

**Livrables**:```yaml

```Runtime: Node.js 24.9+

DockerfileLanguage: TypeScript 5.7+

.dockerignoreFramework: Express 5

docker-compose.prod.ymlORM: Prisma 6

```Database: PostgreSQL 18

Session: connect-pg-simple

### 9.2 - GitHub Actions CI/CD (identique)Auth: bcryptjs

**Objectif**: Pipeline CI/CD automatiséValidation: Zod + express-validator

DI: TSyringe

**Tasks**:Logger: Pino

- [ ] **9.2.1** - Workflow: Lint & Format checkMonitoring: OpenTelemetry

- [ ] **9.2.2** - Workflow: Unit tests```

- [ ] **9.2.3** - Workflow: Integration tests

- [ ] **9.2.4** - Workflow: E2E tests (avec HTMX)### Frontend

- [ ] **9.2.5** - Workflow: Security audit```yaml

- [ ] **9.2.6** - Workflow: Build & push Docker imageTemplate Engine: EJS

- [ ] **9.2.7** - Workflow: Deploy staging/productionCSS Framework: Tailwind CSS 4

- [ ] **9.2.8** - Code coverage reportingComponent Library: DaisyUI 5.3.7

JS Framework: Alpine.js (progressive enhancement)

**Livrables**:Build: PostCSS

```Icons: Heroicons / Lucide

.github/```

├── workflows/

│   ├── ci.yml### Testing

│   ├── cd.yml```yaml

│   ├── security.ymlUnit/Integration: Vitest

│   └── deploy.ymlE2E: Playwright

└── dependabot.ymlCoverage: Vitest Coverage (v8)

```Mocking: Vitest mocks

Fixtures: Custom factories

### 9.3 - Documentation Deployment (identique)```

**Objectif**: Guide déploiement production

### DevOps

**Tasks**:```yaml

- [ ] **9.3.1** - Guide installationContainer: Docker

- [ ] **9.3.2** - Configuration environnement productionOrchestration: Docker Compose

- [ ] **9.3.3** - Migration database guideCI/CD: GitHub Actions

- [ ] **9.3.4** - Backup & restore proceduresRegistry: GitHub Container Registry

- [ ] **9.3.5** - Monitoring setupMonitoring: OpenTelemetry + Grafana

- [ ] **9.3.6** - Troubleshooting guideLogs: Pino + Loki

```

**Livrables**:

```### Tools

docs/deployment/```yaml

├── INSTALLATION.mdPackage Manager: npm 10+

├── PRODUCTION.mdLinter: ESLint 9

├── MIGRATIONS.mdFormatter: Prettier

├── BACKUP.mdGit Hooks: Husky

└── TROUBLESHOOTING.mdPre-commit: lint-staged

```API Docs: OpenAPI 3.1

```

---

---

## 📚 PHASE 10 : Documentation & Polish (2-3 jours)

## 📖 Ressources & Références

### 10.1 - Documentation Technique

**Objectif**: Documentation complète avec HTMX patterns### Architecture

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

**Tasks**:- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)

- [ ] **10.1.1** - README.md (overview, quick start)- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

- [ ] **10.1.2** - CONTRIBUTING.md (guide contribution)

- [ ] **10.1.3** - ARCHITECTURE.md (diagrammes)### Technologies

- [ ] **10.1.4** - **HTMX_PATTERNS.md** (patterns HTMX utilisés)- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

- [ ] **10.1.5** - API documentation (endpoints HTML vs JSON)- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

- [ ] **10.1.6** - Database schema documentation- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)

- [ ] **10.1.7** - Code comments (JSDoc)- [DaisyUI Components](https://daisyui.com/components/)

- [ ] **10.1.8** - Changelog

### Testing

**Livrables**:- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

```- [Playwright Docs](https://playwright.dev/)

README.md

CONTRIBUTING.md### DevOps

CHANGELOG.md- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

docs/- [GitHub Actions Docs](https://docs.github.com/en/actions)

├── ARCHITECTURE.md

├── HTMX_PATTERNS.md  # NEW---

├── API.md

├── DATABASE.md## ✅ Checklist Avant Production

└── diagrams/

    ├── architecture.png### Configuration

    ├── database-schema.png- [ ] Variables d'environnement production configurées

    ├── htmx-flow.png  # NEW- [ ] Secrets sécurisés (pas en clair)

    └── flow-diagrams.png- [ ] Database backups configurés

```- [ ] SSL/HTTPS activé

- [ ] Domain name configuré

### 10.2 - User Documentation (identique)- [ ] Email service configuré

**Objectif**: Guide utilisateur

### Sécurité

**Tasks**:- [ ] Audit sécurité complet

- [ ] **10.2.1** - User manual (FR)- [ ] Penetration testing

- [ ] **10.2.2** - User manual (EN)- [ ] Rate limiting activé

- [ ] **10.2.3** - FAQ- [ ] CSRF protection

- [ ] **10.2.4** - Video tutorials (optionnel)- [ ] XSS protection

- [ ] **10.2.5** - Screenshots features- [ ] Security headers



**Livrables**:### Performance

```- [ ] CDN configuré pour assets

docs/user/- [ ] Caching configuré (Redis optionnel)

├── fr/- [ ] Database indexes optimisés

│   ├── manual.md- [ ] Query optimization

│   └── faq.md- [ ] Load testing passé

├── en/

│   ├── manual.md### Monitoring

│   └── faq.md- [ ] Logs centralisés

└── screenshots/- [ ] Error tracking (Sentry optionnel)

```- [ ] Performance monitoring

- [ ] Uptime monitoring

### 10.3 - Code Quality & Refactoring (identique)- [ ] Alerting configuré

**Objectif**: Polish final

### Documentation

**Tasks**:- [ ] README à jour

- [ ] **10.3.1** - Code review complet- [ ] Changelog à jour

- [ ] **10.3.2** - Refactoring duplications- [ ] API documentation

- [ ] **10.3.3** - Optimisation imports- [ ] User manual

- [ ] **10.3.4** - Clean up TODO/FIXME comments- [ ] Runbook opérationnel

- [ ] **10.3.5** - Consistent naming conventions

- [ ] **10.3.6** - Final lint check (zero warnings)---



---**🚀 Cette roadmap est votre guide complet pour construire TaskFlow avec une architecture moderne, maintenable et scalable !**



## 🎓 PHASE 11 : Features Avancées (Optionnel) (5-7 jours)**Prochaine étape**: Commencer par la Phase 0 - Setup Initial


### 11.1 - Real-time Notifications (WebSockets + HTMX SSE)
**Objectif**: Notifications temps réel avec SSE (Server-Sent Events)

**Tasks**:
- [ ] **11.1.1** - Setup SSE endpoint
- [ ] **11.1.2** - **HTMX SSE extension** (hx-sse)
- [ ] **11.1.3** - Event: Task assigned
- [ ] **11.1.4** - Event: Task updated
- [ ] **11.1.5** - Event: Comment added
- [ ] **11.1.6** - Client-side notifications (Alpine.js)
- [ ] **11.1.7** - Notification center UI

**Exemple SSE avec HTMX** :
```ejs
<!-- Notifications en temps réel -->
<div hx-ext="sse" 
     sse-connect="/api/notifications/stream"
     sse-swap="notificationReceived"
     hx-target="#notifications"
     hx-swap="afterbegin">
  <div id="notifications"></div>
</div>
```

### 11.2 - Advanced Features avec HTMX
**Objectif**: Features premium

**Tasks**:
- [ ] **11.2.1** - **Task comments system (HTMX inline)**
- [ ] **11.2.2** - File attachments avec progress (HTMX)
- [ ] **11.2.3** - **Advanced filtering (saved filters avec HTMX)**
- [ ] **11.2.4** - **Kanban board view (drag & drop HTMX + Alpine)**
- [ ] **11.2.5** - Calendar view
- [ ] **11.2.6** - Export tasks (CSV, PDF)
- [ ] **11.2.7** - Email notifications
- [ ] **11.2.8** - **Activity timeline (HTMX infinite scroll)**
- [ ] **11.2.9** - Tags system
- [ ] **11.2.10** - **Search full-text (HTMX live search)**

### 11.3 - Admin Panel (identique)
**Objectif**: Interface administration

**Tasks**:
- [ ] **11.3.1** - User management (CRUD)
- [ ] **11.3.2** - Role management
- [ ] **11.3.3** - System metrics dashboard
- [ ] **11.3.4** - Audit logs
- [ ] **11.3.5** - Settings management

---

## 📅 Timeline Estimé

| Phase | Durée | Jours cumulés |
|-------|-------|---------------|
| Phase 0: Setup | 2-3 jours | 3 |
| Phase 1: Core Domain | 5-7 jours | 10 |
| Phase 2: Application Layer | 5-7 jours | 17 |
| Phase 3: Presentation API + HTMX | 5-6 jours | 23 |
| Phase 4: Frontend SSR + HTMX | 6-8 jours | 31 |
| Phase 5: i18n | 2-3 jours | 34 |
| Phase 6: Testing | 5-6 jours | 40 |
| Phase 7: Sécurité | 3-4 jours | 44 |
| Phase 8: Observabilité | 2-3 jours | 47 |
| Phase 9: DevOps | 3-4 jours | 51 |
| Phase 10: Documentation | 2-3 jours | 54 |
| **TOTAL MVP** | **~54 jours** | **~11 semaines** |
| Phase 11: Features avancées (optionnel) | 5-7 jours | +7 |

**Note**: Timeline pour 1 développeur fullstack expérimenté. Ajuster selon ressources.

---

## 🎯 Critères de Succès

### Qualité Code (identique)
- ✅ Coverage tests unitaires ≥ 90%
- ✅ Coverage tests E2E ≥ 80%
- ✅ Zéro vulnérabilités critiques (npm audit)
- ✅ ESLint: 0 errors, 0 warnings
- ✅ TypeScript strict mode activé
- ✅ Code review passé

### Performance (optimisé SSR)
- ✅ Lighthouse score ≥ 95 (Performance, Accessibility, Best Practices, SEO)
- ✅ **Time to First Byte (TTFB) < 150ms** (SSR)
- ✅ **First Contentful Paint (FCP) < 1s** (SSR optimisé)
- ✅ **Largest Contentful Paint (LCP) < 2s**
- ✅ **Time to Interactive (TTI) < 2s** (pas de gros JS)
- ✅ **Bundle size < 50KB** (HTMX + Alpine.js seulement)

### Accessibilité (identique)
- ✅ WCAG 2.2 AA compliance
- ✅ Clavier navigation complète
- ✅ Screen reader compatible
- ✅ **Fonctionne sans JavaScript** (progressive enhancement)
- ✅ Color contrast ≥ 4.5:1

### Sécurité (identique)
- ✅ OWASP Top 10 addressed
- ✅ Security headers configurés
- ✅ HTTPS/SSL en production
- ✅ Rate limiting actif
- ✅ CSRF protection (compatible HTMX)

### DevOps (identique)
- ✅ CI/CD pipeline fonctionnel
- ✅ Tests automatisés sur PR
- ✅ Docker images < 200MB
- ✅ Logs centralisés
- ✅ Metrics & monitoring

---

## 🛠️ Stack Technique Complète

### Backend
```yaml
Runtime: Node.js 24.9+
Language: TypeScript 5.7+
Framework: Express 5
ORM: Prisma 6
Database: PostgreSQL 18
Session: connect-pg-simple
Auth: bcryptjs
Validation: Zod + express-validator
DI: TSyringe
Logger: Pino
Monitoring: OpenTelemetry
```

### Frontend SSR
```yaml
Template Engine: EJS
Interactivité partielle: HTMX 1.9+ (AJAX → HTML)
Interactivité locale: Alpine.js 3.x (UI components)
CSS Framework: Tailwind CSS 4
Component Library: DaisyUI 5.3.7
Build CSS: PostCSS
Icons: Lucide Icons (SVG)
```

### Testing
```yaml
Unit/Integration: Vitest
E2E: Playwright
Coverage: Vitest Coverage (v8)
Mocking: Vitest mocks
Fixtures: Custom factories
HTMX Testing: Playwright + custom helpers
```

### DevOps
```yaml
Container: Docker
Orchestration: Docker Compose
CI/CD: GitHub Actions
Registry: GitHub Container Registry
Monitoring: OpenTelemetry + Grafana
Logs: Pino + Loki
```

### Tools
```yaml
Package Manager: npm 10+
Linter: ESLint 9
Formatter: Prettier
Git Hooks: Husky
Pre-commit: lint-staged
API Docs: OpenAPI 3.1
```

---

## 📖 Ressources & Références

### Architecture
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

### Technologies
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)
- **[HTMX Documentation](https://htmx.org/docs/)** ⭐ NEW
- **[HTMX Examples](https://htmx.org/examples/)** ⭐ NEW
- **[Alpine.js Documentation](https://alpinejs.dev/)** ⭐ NEW

### Testing
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Playwright Docs](https://playwright.dev/)

### DevOps
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 🎨 Patterns HTMX Recommandés

### Pattern 1: Liste avec filtres
```html
<form hx-get="/tasks" hx-target="#task-list" hx-trigger="change">
  <input name="search" hx-trigger="keyup changed delay:300ms">
  <select name="status"></select>
</form>
<div id="task-list"><!-- Remplacé par HTMX --></div>
```

### Pattern 2: Création inline
```html
<form hx-post="/tasks" hx-target="#task-list" hx-swap="afterbegin">
  <input name="title" required>
  <button type="submit">Créer</button>
</form>
```

### Pattern 3: Édition inline
```html
<div id="task-123">
  <span>{{ task.title }}</span>
  <button hx-get="/tasks/123/edit" 
          hx-target="#task-123" 
          hx-swap="outerHTML">
    Éditer
  </button>
</div>
```

### Pattern 4: Suppression avec confirmation
```html
<button hx-delete="/tasks/123" 
        hx-target="#task-123" 
        hx-swap="outerHTML"
        hx-confirm="Supprimer cette tâche ?">
  Supprimer
</button>
```

### Pattern 5: Pagination
```html
<button hx-get="/tasks?page=2" 
        hx-target="#task-list" 
        hx-swap="innerHTML">
  Page suivante
</button>
```

### Pattern 6: Infinite scroll
```html
<div hx-get="/tasks?page=2" 
     hx-trigger="revealed" 
     hx-swap="afterend">
</div>
```

---

## ✅ Checklist Avant Production

### Configuration
- [ ] Variables d'environnement production configurées
- [ ] Secrets sécurisés (pas en clair)
- [ ] Database backups configurés
- [ ] SSL/HTTPS activé
- [ ] Domain name configuré
- [ ] Email service configuré
- [ ] **CDN configuré pour HTMX/Alpine** (si self-hosted)

### Sécurité
- [ ] Audit sécurité complet
- [ ] Penetration testing
- [ ] Rate limiting activé
- [ ] **CSRF protection (HTMX compatible)**
- [ ] XSS protection
- [ ] Security headers
- [ ] **CSP autorise HTMX/Alpine CDN**

### Performance
- [ ] CDN configuré pour assets
- [ ] Caching configuré (EJS templates)
- [ ] Database indexes optimisés
- [ ] Query optimization
- [ ] **HTMX responses optimisées (partials size)**
- [ ] Load testing passé

### Monitoring
- [ ] Logs centralisés
- [ ] Error tracking (Sentry optionnel)
- [ ] Performance monitoring
- [ ] **HTMX request metrics**
- [ ] Uptime monitoring
- [ ] Alerting configuré

### Documentation
- [ ] README à jour
- [ ] Changelog à jour
- [ ] API documentation (HTML + JSON endpoints)
- [ ] **HTMX patterns documentation**
- [ ] User manual
- [ ] Runbook opérationnel

---

## 🚨 PHASE 4 (URGENT): Frontend Implementation & Debugging

**Status**: � **CRITIQUE** - Serveur doit rester actif
**Date**: 2 novembre 2025
**Priorité**: P0 - Blocage complet frontend

### 📋 Problème Identifié

**Symptômes**:
- ❌ Aucun style appliqué dans le navigateur
- ❌ Fonctionnalités frontend non fonctionnelles
- ❌ Utilisateur ne peut pas utiliser l'interface

**Diagnostic complet** (2 novembre 2025):
```
✅ Infrastructure présente et correcte:
  - CSS généré: 143KB (Tailwind CSS 4 + DaisyUI 5.3.10)
  - Views EJS: 62 fichiers avec classes Tailwind/DaisyUI
  - HTMX 1.9.10: Chargé dans layout (unpkg CDN)
  - Alpine.js 3.x: Chargé dans layout (jsdelivr CDN)
  - Scripts JS: alpine-components.js, theme-init.js existants
  - Express static: Correctement configuré (express.static('/public'))
  
❌ Cause root:
  - SERVEUR EXPRESS NON DÉMARRÉ AU MOMENT DU TEST
  - Utilisateur a testé sans lancer `npm run dev`
  - Fichiers CSS/JS inaccessibles (pas de serveur HTTP)
```

### 🔧 Solution Immédiate

**Étapes de résolution**:

1. **Démarrer le serveur** (OBLIGATOIRE):
```bash
npm run dev
```

2. **Vérifier le serveur écoute sur 0.0.0.0:3001**:
```bash
# Dans les logs, vous devez voir:
[INFO] Server started {"port":3001,"host":"0.0.0.0","env":"development"}
```

3. **Tester l'accès aux fichiers statiques**:
```bash
curl -I http://localhost:3001/css/output.css
# Doit retourner HTTP/1.1 200 OK
```

4. **Ouvrir le navigateur**:
```
http://localhost:3001
```

5. **Vérifier la console navigateur**:
   - F12 → Console
   - Aucune erreur 404 pour CSS/JS
   - HTMX/Alpine.js chargés sans erreur

### 📝 Configuration Requise

**Fichier `.env`** (UPDATED):
```bash
# Changé de "localhost" à "0.0.0.0" pour accessibilité réseau
HOST=0.0.0.0
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://taskflow:taskflow_dev_password@localhost:5433/taskflow_dev?schema=public"
SESSION_SECRET=bdEX"rOUw)f+\]Sq-p|bFivPEMtP(L}.Gceve6x#'d.q/FpJ'3'Xc0[):ok9-Pea
```

### ✅ Checklist Vérification Frontend

- [x] **4.1** CSS généré (143KB) ✅
- [x] **4.2** Views EJS avec Tailwind classes ✅
- [x] **4.3** HTMX 1.9.10 chargé dans layout ✅
- [x] **4.4** Alpine.js 3.x chargé dans layout ✅
- [x] **4.5** Express static middleware configuré ✅
- [x] **4.6** Scripts JS (alpine-components.js, theme-init.js) ✅
- [ ] **4.7** Serveur Express démarré (`npm run dev`) ⚠️ **ACTION UTILISATEUR**
- [ ] **4.8** Navigateur charge CSS sans 404
- [ ] **4.9** HTMX détecté dans DevTools (hx-* attributes)
- [ ] **4.10** Alpine.js détecté dans DevTools (x-data attributes)
- [ ] **4.11** Theme switcher fonctionne
- [ ] **4.12** Filtres tâches fonctionnent (HTMX)
- [ ] **4.13** Modal dialogs fonctionnent (Alpine.js)
- [ ] **4.14** Formulaires soumettent correctement

### 🎯 Plan d'Action Post-Démarrage

**Phase 4.1 - Vérification Infrastructure** (15 min):
- [x] ✅ Vérifier CSS accessible (`/css/output.css`)
- [ ] Vérifier JS accessibles (`/js/*.js`)
- [ ] Vérifier favicon/images accessible
- [ ] Tester health check (`/health`, `/ready`)

**Phase 4.2 - Test Fonctionnalités Essentielles** (30 min):
- [ ] Page login affichée avec styles
- [ ] Page dashboard affichée avec stats
- [ ] Page tasks affichée avec liste
- [ ] Navigation header fonctionne
- [ ] Flash messages s'affichent correctement

**Phase 4.3 - Test HTMX** (30 min):
- [ ] Filtres tasks (requête HTMX partielle)
- [ ] Pagination tasks (requête HTMX)
- [ ] Création task (soumission HTMX)
- [ ] Édition task inline (HTMX swap)
- [ ] Suppression task (HTMX delete)

**Phase 4.4 - Test Alpine.js** (30 min):
- [ ] Theme switcher (Alpine x-data)
- [ ] Modal dialogs (Alpine x-show)
- [ ] Dropdown menus (Alpine @click)
- [ ] Search filter (Alpine x-model)
- [ ] Toast notifications (Alpine events)

**Phase 4.5 - Test Responsive** (20 min):
- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)
- [ ] Glassmorphism effects visible

**Phase 4.6 - Test Accessibilité** (30 min):
- [ ] Navigation clavier complète
- [ ] Screen reader compatible (test NVDA)
- [ ] Contraste couleurs ≥ 4.5:1
- [ ] Focus visible sur éléments interactifs

**Phase 4.7 - Corrections Bugs** (variable):
- [ ] Fixer composants Alpine.js défectueux
- [ ] Corriger routes HTMX manquantes
- [ ] Ajuster styles glassmorphism
- [ ] Optimiser requêtes HTMX

### 🔍 Debugging Guide

**Si CSS ne charge pas**:
```bash
# 1. Vérifier le fichier existe
ls -lh public/css/output.css

# 2. Vérifier le serveur sert les fichiers statiques
curl -I http://localhost:3001/css/output.css

# 3. Vérifier dans le navigateur (F12 → Network)
# Filtrer par "output.css", vérifier statut 200

# 4. Vider le cache navigateur
# Ctrl+Shift+R (Chrome/Firefox)
```

**Si HTMX ne fonctionne pas**:
```javascript
// Console navigateur (F12 → Console)
htmx.version // Doit afficher "1.9.10"
htmx.config // Afficher la configuration

// Activer debug mode
htmx.config.debug = true;

// Vérifier événements HTMX
document.body.addEventListener('htmx:beforeRequest', (e) => console.log('HTMX Request:', e.detail));
document.body.addEventListener('htmx:afterRequest', (e) => console.log('HTMX Response:', e.detail));
```

**Si Alpine.js ne fonctionne pas**:
```javascript
// Console navigateur
Alpine.version // Doit afficher "3.x.x"

// Vérifier composants Alpine
Alpine.store('theme') // Tester store si existant

// Debug mode Alpine
window.Alpine.debug = true;
```

### 📊 Métriques de Succès

**Performance**:
- [ ] TTFB < 200ms (Server-Side Rendering)
- [ ] FCP < 1.5s (First Contentful Paint)
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] TTI < 2.5s (Time to Interactive)

**Lighthouse Scores** (objectif):
- [ ] Performance: ≥90
- [ ] Accessibility: ≥95
- [ ] Best Practices: ≥95
- [ ] SEO: ≥95

**Bundle Size**:
- [ ] CSS: ~140KB (Tailwind + DaisyUI)
- [ ] JS: <50KB (HTMX + Alpine.js + custom)
- [ ] Total initial load: <250KB

### 🚀 Étapes Suivantes

**Après correction frontend**:
1. Reprendre Sprint 1 Task 1.4 (tests command/query handlers)
2. Continuer l'implémentation CQRS complète
3. Augmenter couverture tests à 60%
4. Implémenter features avancées (Phase 11)

---

**🚨 IMPORTANT: Le serveur DOIT rester actif pendant le développement. Exécuter `npm run dev` dans un terminal dédié.**

---

**🚀 Cette roadmap est votre guide complet pour construire TaskFlow avec une architecture SSR pure moderne utilisant HTMX + Alpine.js !**

**Prochaine étape**: ✅ Phase 0-3 COMPLÉTÉES → 🔴 **URGENT: Phase 4 Frontend Debugging** → Continuer Phase 1.4 Tests

**Différences clés avec la version précédente** :
- ✅ HTMX pour mises à jour partielles (pas de React/Vue)
- ✅ Alpine.js pour UI locale (modals, dropdowns)
- ✅ SSR pur (pas de SPA, pas de client-side routing)
- ✅ Progressive Enhancement (fonctionne sans JS)
- ✅ Bundle JS ultra-léger (~30KB total)
- ✅ SEO optimal (HTML rendu serveur)
- ✅ Performance maximale (TTI < 2s)
