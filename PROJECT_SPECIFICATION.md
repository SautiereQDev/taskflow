# TaskFlow - Spécification Complète du Projet (SSR Pure)

**Date**: 31 octobre 2025  
**Version**: 3.0  
**Type**: Application Web de Gestion de Tâches (Task Management)  
**Stack**: Node.js + TypeScript + Express + EJS + HTMX + Alpine.js + PostgreSQL + Prisma

---

## 📋 Vue d'ensemble

TaskFlow est une application web full-stack **SSR pure** de gestion de tâches collaborative avec authentification par session, système de rôles, et design system glassmorphism moderne.

### Objectifs Principaux

1. **Gestion de tâches** : CRUD complet avec assignation, priorités, statuts, deadlines
2. **Collaboration d'équipe** : Assignation multi-utilisateurs, vue team avec capacité
3. **Authentification sécurisée** : Sessions PostgreSQL, BCrypt, protection CSRF
4. **Design moderne** : Glassmorphism avec Tailwind CSS v4 + DaisyUI 5.3.7
5. **SSR pur** : Backend renvoie HTML, pas de SPA
6. **Progressive Enhancement** : HTMX (mises à jour partielles) + Alpine.js (UI locale)
7. **Accessibilité** : WCAG 2.2 AA, responsive, i18n (FR/EN), fonctionne sans JS
8. **Architecture propre** : 3-layer pattern, DI avec tsyringe, tests unitaires/E2E

---

## 🏗️ Architecture Technique

### Stack Technologique

```yaml
Runtime: Node.js 24.9+
Language: TypeScript 5.7+ (ESM strict)
Framework: Express.js 5.x
Template Engine: EJS (Server-Side Rendering)
Database: PostgreSQL 18
ORM: Prisma 6.x
CSS: Tailwind CSS v4 + DaisyUI 5.3.7
Interactivité partielle: HTMX 1.9+ (AJAX → HTML)
Interactivité locale: Alpine.js 3.x (UI components)
Testing: Vitest + Playwright
DI Container: tsyringe
Session Store: connect-pg-simple
Password Hashing: bcrypt
Validation: express-validator + Zod
i18n: Custom service with ICU MessageFormat
Monitoring: OpenTelemetry + Pino
```

### 🎯 Philosophie SSR Pure

**Pas de SPA** :
- Le serveur renvoie toujours du **HTML complet** (première requête)
- Les interactions utilisent **HTMX** pour des mises à jour partielles (requêtes AJAX → HTML)
- **Alpine.js** gère les interactions locales (modals, dropdowns, tooltips)
- Pas de client-side routing (navigation = requêtes HTTP classiques)
- Pas de Virtual DOM, pas de gros bundle JavaScript

**Progressive Enhancement** :
- L'application **fonctionne sans JavaScript**
- HTMX améliore l'expérience (pas de page reload)
- Alpine.js ajoute des interactions riches

**Avantages** :
✅ SEO optimal (HTML pré-rendu)  
✅ Performance (TTI < 2s, pas de hydration)  
✅ Simplicité (pas de build complexe)  
✅ Accessibilité (fonctionne sans JS)  
✅ Debugging facile

### Pattern Architecture (3-Layer)

```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │
│  Controllers (HTTP I/O, validation) │
│  Routes (routing, middleware)       │
│  View Models (presenters)           │
│  EJS Templates (SSR)                │
│  HTMX Partials (mises à jour)       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│          BUSINESS LAYER             │
│  Services (business logic)          │
│  Use Cases (CQRS commands/queries)  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        DATA ACCESS LAYER            │
│  Repositories (Prisma queries)      │
│  Database (PostgreSQL)              │
└─────────────────────────────────────┘
```

**Règles strictes :**
- Controllers → Services → Repositories (flux unidirectionnel)
- Pas de Prisma dans les Controllers ou Services
- Pas de business logic dans les Repositories
- Dependency Injection pour toutes les dépendances
- **Controllers détectent requêtes HTMX** et renvoient partials ou pages complètes

### Structure des Dossiers

```
project/
├── prisma/
│   ├── schema.prisma              # Schéma base de données
│   ├── seed.ts                    # Données de test
│   └── migrations/                # Migrations Prisma
├── src/
│   ├── app.ts                     # Configuration Express
│   ├── server.ts                  # Point d'entrée
│   ├── config/
│   │   ├── di-container.ts        # Configuration tsyringe (CRITIQUE)
│   │   ├── i18n.ts                # Configuration i18n
│   │   ├── session.ts             # Configuration session
│   │   └── htmx.ts                # Configuration HTMX
│   ├── controllers/               # HTTP handlers (thin layer)
│   │   ├── auth.controller.ts
│   │   ├── task.controller.ts     # Avec logique HTMX
│   │   ├── user.controller.ts
│   │   └── __tests__/
│   ├── services/                  # Business logic
│   │   ├── auth.service.ts
│   │   ├── task.service.ts
│   │   ├── user.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── i18n.service.ts
│   │   └── __tests__/
│   ├── repositories/              # Prisma queries
│   │   ├── task.repository.ts
│   │   ├── user.repository.ts
│   │   └── __tests__/
│   ├── middleware/                # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── i18n.middleware.ts
│   │   ├── htmx.middleware.ts     # NEW: Détecte requêtes HTMX
│   │   └── validation.middleware.ts
│   ├── routes/                    # Express routes
│   │   ├── index.ts               # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── task.pages.routes.ts   # Routes pages + partials
│   │   └── user.pages.routes.ts
│   ├── view-models/               # Presentation layer
│   │   ├── task.presenter.ts
│   │   ├── formatters/
│   │   │   ├── DateFormatter.ts
│   │   │   ├── NumberFormatter.ts
│   │   │   └── TextFormatter.ts
│   │   ├── interfaces/
│   │   │   ├── ITaskViewModel.ts
│   │   │   ├── IUserViewModel.ts
│   │   │   └── IPaginationViewModel.ts
│   │   └── presenters/
│   │       ├── user.presenter.ts
│   │       └── PaginationPresenter.ts
│   ├── types/
│   │   └── index.ts               # Types TypeScript globaux
│   ├── utils/
│   │   ├── logger.util.ts
│   │   ├── session.util.ts
│   │   ├── task-filter.util.ts
│   │   └── htmx.util.ts           # NEW: Helpers HTMX
│   └── test/
│       └── setup.ts               # Configuration Vitest
├── views/                         # Templates EJS
│   ├── layouts/
│   │   └── main.ejs               # Layout principal (HTMX + Alpine)
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   ├── flash-messages.ejs
│   │   ├── icon.ejs
│   │   ├── htmx/                  # NEW: Partials HTMX
│   │   │   ├── task-list.ejs
│   │   │   ├── task-item.ejs
│   │   │   ├── task-filters.ejs
│   │   │   └── pagination.ejs
│   │   └── ui/                    # Composants UI réutilisables
│   │       ├── surface.ejs
│   │       ├── stat-card.ejs
│   │       ├── section-header.ejs
│   │       ├── avatar.ejs
│   │       ├── badge.ejs
│   │       ├── empty-state.ejs
│   │       ├── list-item.ejs
│   │       └── forms/
│   │           └── field.ejs
│   └── pages/
│       ├── home.ejs
│       ├── dashboard.ejs
│       ├── team.ejs
│       ├── auth/
│       │   ├── login.ejs
│       │   └── register.ejs
│       ├── tasks/
│       │   ├── index.ejs          # Avec HTMX
│       │   ├── detail.ejs
│       │   └── form.ejs
│       ├── users/
│       │   ├── profile.ejs
│       │   └── form.ejs
│       └── errors/
│           ├── 404.ejs
│           └── error.ejs
├── public/
│   ├── css/
│   │   ├── tailwind.css           # Source Tailwind + design tokens
│   │   └── output.css             # Build compilé
│   ├── js/
│   │   ├── htmx-config.js         # NEW: Config globale HTMX
│   │   ├── htmx-extensions.js     # NEW: Extensions HTMX
│   │   ├── alpine-components.js   # NEW: Composants Alpine.js
│   │   ├── theme-switcher.js      # Toggle light/dark mode
│   │   └── toast.js               # Notifications
│   └── images/
├── tests/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── tasks.spec.ts
│       ├── tasks-htmx.spec.ts     # NEW: Tests HTMX
│       ├── dashboard.spec.ts
│       ├── users.spec.ts
│       ├── responsive.spec.ts
│       └── utils/
│           ├── auth.ts
│           └── htmx-helpers.ts    # NEW
├── locales/                       # Traductions i18n
│   ├── fr.json
│   └── en.json
├── docs/                          # Documentation
│   ├── GLASSMORPHISM_TRANSITION_MANUAL.md
│   ├── HTMX_PATTERNS.md           # NEW: Patterns HTMX
│   ├── ui-components-glass.md
│   └── PROJECT_SPECIFICATION.md (ce fichier)
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── docker-compose.yml
└── Dockerfile
```

---

## 🗄️ Schéma de Base de Données (Prisma)

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(uuid())
  email            String   @unique
  name             String
  password         String
  role             String   @default("USER") // USER | ADMIN
  isActive         Boolean  @default(true)
  avatar           String?  // URL to avatar image
  themePreference  String?  @default("taskflowGlass") // taskflowGlass | taskflowGlassDark
  locale           String   @default("fr") // fr | en
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  tasksAssigned    Task[]   @relation("TaskAssignee")
  tasksCreated     Task[]   @relation("TaskCreator")

  @@map("users")
}

model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  status      String    @default("TODO") // TODO | IN_PROGRESS | DONE | CANCELLED
  priority    String    @default("MEDIUM") // LOW | MEDIUM | HIGH | URGENT
  assigneeId  String?
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  dueDate     DateTime?
  assignee    User?     @relation("TaskAssignee", fields: [assigneeId], references: [id])
  createdBy   User      @relation("TaskCreator", fields: [createdById], references: [id], onDelete: Cascade)

  @@map("tasks")
}
```

---

## 🎨 Design System Glassmorphism

### Tailwind CSS v4 Configuration

**`tailwind.config.ts`** (identique)

```typescript
import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config = {
  content: [
    './views/**/*.ejs',
    './src/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        taskflowGlass: {
          primary: 'oklch(55% 0.22 250)',
          'primary-focus': 'oklch(50% 0.24 250)',
          'primary-content': '#ffffff',
          secondary: 'oklch(60% 0.25 290)',
          accent: 'oklch(70% 0.18 200)',
          neutral: 'oklch(25% 0.015 240)',
          'base-100': 'oklch(100% 0 0 / 0.88)',
          'base-200': 'oklch(97% 0.005 240 / 0.72)',
          'base-300': 'oklch(92% 0.01 240 / 0.68)',
          'base-content': 'oklch(20% 0.015 240)',
          info: 'oklch(60% 0.2 240)',
          success: 'oklch(65% 0.2 145)',
          warning: 'oklch(75% 0.18 75)',
          error: 'oklch(60% 0.24 25)',
          '--rounded-box': '1.5rem',
          '--rounded-btn': '9999px',
        },
      },
      {
        taskflowGlassDark: {
          primary: 'oklch(70% 0.2 250)',
          'base-100': 'oklch(15% 0.02 240 / 0.74)',
          'base-content': 'oklch(95% 0.005 240)',
          // ... (mêmes propriétés, valeurs adaptées)
        },
      },
    ],
    darkTheme: 'taskflowGlassDark',
  },
} satisfies Config;

export default config;
```

---

## 🔐 Authentification & Sécurité

### Configuration Session (PostgreSQL)

```typescript
// src/config/session.ts (identique)
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PgSession = connectPgSimple(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const sessionMiddleware = session({
  store: new PgSession({ pool, tableName: 'sessions' }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    sameSite: 'lax',
  },
});
```

### CSRF Protection (compatible HTMX)

```typescript
// src/middleware/csrf.middleware.ts
import csrf from 'csurf';

export const csrfProtection = csrf({ cookie: false }); // Session-based

// Middleware pour injecter token CSRF
export const injectCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};
```

```ejs
<!-- Layout: Meta tag pour HTMX -->
<meta name="csrf-token" content="<%= csrfToken %>">

<script>
  // HTMX auto-include CSRF token dans toutes les requêtes
  document.body.addEventListener('htmx:configRequest', (event) => {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    event.detail.headers['X-CSRF-Token'] = token;
  });
</script>
```

---

## 🌐 HTMX Integration Patterns

### Pattern 1: Détection requête HTMX dans Controller

```typescript
// src/controllers/task.controller.ts
export class TaskController {
  async list(req: Request, res: Response) {
    const { status, search } = req.query;
    const tasks = await this.taskService.getTasks({ status, search });
    
    // Si requête HTMX, renvoyer seulement le partial
    if (req.headers['hx-request']) {
      return res.render('partials/htmx/task-list', { tasks });
    }
    
    // Sinon, renvoyer la page complète
    res.render('pages/tasks/index', { tasks });
  }

  async create(req: Request, res: Response) {
    const task = await this.taskService.createTask(req.body);
    
    // HTMX: Renvoyer le nouveau item + trigger event
    res.setHeader('HX-Trigger', 'taskCreated');
    res.render('partials/htmx/task-item', { task });
  }

  async delete(req: Request, res: Response) {
    await this.taskService.deleteTask(req.params.id);
    
    // HTMX: Renvoyer 200 vide (l'élément sera supprimé du DOM)
    res.status(200).send('');
  }
}
```

### Pattern 2: Page avec filtres HTMX

```ejs
<!-- views/pages/tasks/index.ejs -->
<div class="tasks-page">
  
  <!-- Formulaire de filtres (HTMX trigger sur change) -->
  <form hx-get="/tasks" 
        hx-target="#task-list" 
        hx-trigger="change, submit"
        hx-indicator="#loading"
        class="filters">
    
    <!-- Search avec debounce -->
    <input type="text" 
           name="search" 
           placeholder="<%= t('tasks.search') %>"
           hx-trigger="keyup changed delay:300ms"
           class="input input-bordered">
    
    <!-- Select status -->
    <select name="status" class="select select-bordered">
      <option value=""><%= t('tasks.allStatuses') %></option>
      <option value="TODO" <%= status === 'TODO' ? 'selected' : '' %>>
        <%= t('tasks.statuses.todo') %>
      </option>
      <option value="IN_PROGRESS" <%= status === 'IN_PROGRESS' ? 'selected' : '' %>>
        <%= t('tasks.statuses.in_progress') %>
      </option>
      <option value="DONE" <%= status === 'DONE' ? 'selected' : '' %>>
        <%= t('tasks.statuses.done') %>
      </option>
    </select>
    
    <!-- Loading indicator -->
    <span id="loading" class="htmx-indicator">
      <span class="loading loading-spinner"></span>
    </span>
  </form>

  <!-- Liste des tâches (remplacée par HTMX) -->
  <div id="task-list">
    <%- include('../../partials/htmx/task-list', { tasks }) %>
  </div>

  <!-- Bouton créer (Modal Alpine.js) -->
  <div x-data="{ modalOpen: false }">
    <button @click="modalOpen = true" class="btn btn-primary">
      <%= t('tasks.create') %>
    </button>
    
    <!-- Modal Alpine.js -->
    <div x-show="modalOpen" 
         x-transition 
         @click.away="modalOpen = false"
         class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg"><%= t('tasks.createTask') %></h3>
        
        <!-- Form HTMX -->
        <form hx-post="/tasks" 
              hx-target="#task-list" 
              hx-swap="afterbegin"
              @htmx:after-request="if($event.detail.successful) modalOpen = false">
          
          <div class="form-control">
            <label class="label"><%= t('tasks.title') %></label>
            <input type="text" name="title" required class="input input-bordered">
          </div>
          
          <div class="form-control">
            <label class="label"><%= t('tasks.description') %></label>
            <textarea name="description" class="textarea textarea-bordered"></textarea>
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">
              <%= t('common.save') %>
            </button>
            <button type="button" @click="modalOpen = false" class="btn">
              <%= t('common.cancel') %>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

</div>
```

### Pattern 3: Partial task-list.ejs

```ejs
<!-- views/partials/htmx/task-list.ejs -->
<% if (tasks.length === 0) { %>
  <%- include('../ui/empty-state', { 
    message: t('tasks.noTasks') 
  }) %>
<% } else { %>
  <div class="task-grid">
    <% tasks.forEach(task => { %>
      <%- include('./task-item', { task }) %>
    <% }); %>
  </div>
<% } %>
```

### Pattern 4: Partial task-item.ejs

```ejs
<!-- views/partials/htmx/task-item.ejs -->
<div id="task-<%= task.id %>" class="surface-base rounded-2xl p-6">
  
  <!-- Header -->
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-lg font-semibold"><%= task.title %></h3>
    <%- include('../ui/badge', { 
      status: task.status,
      priority: task.priority 
    }) %>
  </div>

  <!-- Description -->
  <% if (task.description) { %>
    <p class="text-base-content/70 mb-4"><%= task.description %></p>
  <% } %>

  <!-- Metadata -->
  <div class="flex items-center gap-4 text-sm text-base-content/60 mb-4">
    <% if (task.assignee) { %>
      <div class="flex items-center gap-2">
        <%- include('../ui/avatar', { user: task.assignee }) %>
        <span><%= task.assignee.name %></span>
      </div>
    <% } %>
    <% if (task.dueDate) { %>
      <span>📅 <%= formatDate(task.dueDate) %></span>
    <% } %>
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    
    <!-- Éditer (HTMX) -->
    <button hx-get="/tasks/<%= task.id %>/edit" 
            hx-target="#task-<%= task.id %>"
            hx-swap="outerHTML"
            class="btn btn-sm btn-ghost">
      <%= t('common.edit') %>
    </button>
    
    <!-- Supprimer (HTMX) -->
    <button hx-delete="/tasks/<%= task.id %>" 
            hx-target="#task-<%= task.id %>"
            hx-swap="outerHTML"
            hx-confirm="<%= t('tasks.confirmDelete') %>"
            class="btn btn-sm btn-error btn-ghost">
      <%= t('common.delete') %>
    </button>
    
    <!-- Changer statut (HTMX) -->
    <% if (task.status !== 'DONE') { %>
      <button hx-patch="/tasks/<%= task.id %>/status" 
              hx-vals='{"status": "DONE"}'
              hx-target="#task-<%= task.id %>"
              hx-swap="outerHTML"
              class="btn btn-sm btn-success">
        <%= t('tasks.markAsDone') %>
      </button>
    <% } %>
    
  </div>

</div>
```

### Pattern 5: Configuration HTMX globale

```javascript
// public/js/htmx-config.js
document.addEventListener('DOMContentLoaded', () => {
  
  // Configuration globale HTMX
  htmx.config.globalViewTransitions = true;
  htmx.config.defaultSwapStyle = 'outerHTML';
  htmx.config.timeout = 10000; // 10s timeout
  
  // Event: Success notification
  document.body.addEventListener('htmx:afterRequest', (event) => {
    if (event.detail.successful) {
      const triggerHeader = event.detail.xhr.getResponseHeader('HX-Trigger');
      if (triggerHeader === 'taskCreated') {
        showToast('Tâche créée avec succès !', 'success');
      }
    }
  });
  
  // Event: Error handling
  document.body.addEventListener('htmx:responseError', (event) => {
    const status = event.detail.xhr.status;
    if (status === 401) {
      window.location.href = '/auth/login';
    } else if (status === 403) {
      showToast('Action non autorisée', 'error');
    } else {
      showToast('Une erreur est survenue', 'error');
    }
  });
  
  // Event: Loading indicators
  document.body.addEventListener('htmx:beforeRequest', () => {
    document.body.classList.add('htmx-loading');
  });
  
  document.body.addEventListener('htmx:afterRequest', () => {
    document.body.classList.remove('htmx-loading');
  });
  
  // Event: Scroll to top après navigation
  document.body.addEventListener('htmx:afterSettle', (event) => {
    if (event.detail.boosted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
});
```

---

## 🧪 Tests

### Tests E2E HTMX avec Playwright

```typescript
// tests/e2e/tasks-htmx.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tasks HTMX interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to tasks
    await page.goto('/tasks');
  });

  test('should filter tasks with HTMX without full page reload', async ({ page }) => {
    // Attendre que HTMX soit chargé
    await page.waitForSelector('[hx-get]');
    
    // Récupérer l'URL initiale
    const initialUrl = page.url();
    
    // Changer le filtre de statut
    await page.selectOption('select[name="status"]', 'TODO');
    
    // Attendre que HTMX remplace le contenu
    await page.waitForResponse(response => 
      response.url().includes('/tasks') && response.status() === 200
    );
    
    // Wait for task list to update
    await page.waitForTimeout(500);
    
    // Vérifier que la page n'a PAS été rechargée (URL identique)
    expect(page.url()).toBe(initialUrl);
    
    // Vérifier que seul #task-list a changé
    const taskList = await page.locator('#task-list');
    await expect(taskList).toBeVisible();
  });

  test('should create task inline with HTMX', async ({ page }) => {
    // Ouvrir modal (Alpine.js)
    await page.click('text=Créer une tâche');
    
    // Attendre que le modal soit visible
    await page.waitForSelector('.modal-open');
    
    // Remplir formulaire
    await page.fill('input[name="title"]', 'Nouvelle tâche HTMX');
    await page.fill('textarea[name="description"]', 'Description test');
    
    // Soumettre (HTMX)
    await page.click('.modal-box button[type="submit"]');
    
    // Attendre réponse HTMX
    await page.waitForResponse(response => 
      response.url().includes('/tasks') && response.status() === 200
    );
    
    // Vérifier que la nouvelle tâche apparaît
    await expect(page.locator('text=Nouvelle tâche HTMX')).toBeVisible();
    
    // Vérifier que le modal est fermé
    await expect(page.locator('.modal-open')).not.toBeVisible();
  });

  test('should delete task with HTMX confirmation', async ({ page }) => {
    // Trouver une tâche
    const firstTask = page.locator('[id^="task-"]').first();
    const taskId = await firstTask.getAttribute('id');
    
    // Cliquer sur supprimer
    await firstTask.locator('button:has-text("Supprimer")').click();
    
    // Confirmer (HTMX hx-confirm)
    page.once('dialog', dialog => dialog.accept());
    
    // Attendre suppression
    await page.waitForResponse(response => 
      response.url().includes(`/tasks/${taskId}`) && response.status() === 200
    );
    
    // Vérifier que l'élément a disparu
    await expect(page.locator(`#${taskId}`)).not.toBeVisible();
  });

  test('should search tasks with debounce', async ({ page }) => {
    // Taper dans la recherche
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill('test');
    
    // Attendre debounce (300ms) + requête
    await page.waitForTimeout(400);
    await page.waitForResponse(response => 
      response.url().includes('/tasks?search=test')
    );
    
    // Vérifier que les résultats sont filtrés
    const taskList = page.locator('#task-list');
    await expect(taskList).toBeVisible();
  });

});
```

---

## 📦 Configuration Complète

### package.json

```json
{
  "name": "taskflow",
  "version": "3.0.0",
  "type": "module",
  "engines": {
    "node": ">=24.9.0"
  },
  "scripts": {
    "dev": "concurrently \"npm run css:watch\" \"tsx watch --env-file=.env src/server.ts\"",
    "build": "npm run css:build && tsc && tsc-alias && node scripts/add-js-extensions.mjs",
    "start": "node dist/server.js",
    "css:build": "tailwindcss -i public/css/tailwind.css -o public/css/output.css --minify",
    "css:watch": "tailwindcss -i public/css/tailwind.css -o public/css/output.css --watch",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\" \"views/**/*.ejs\""
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "bcrypt": "^5.1.1",
    "connect-pg-simple": "^10.0.0",
    "daisyui": "^5.3.7",
    "ejs": "^3.1.10",
    "express": "^5.0.0",
    "express-session": "^1.18.1",
    "express-validator": "^7.2.0",
    "pg": "^8.13.1",
    "reflect-metadata": "^0.2.2",
    "tsyringe": "^4.8.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.2",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.0",
    "@types/node": "^22.8.6",
    "@types/pg": "^8.11.10",
    "@vitest/coverage-v8": "^2.1.4",
    "concurrently": "^9.0.0",
    "prettier": "^3.3.3",
    "prisma": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "tsc-alias": "^1.8.10",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.4"
  }
}
```

---

## 🚀 Procédure d'Installation

### 1. Prérequis

```bash
node --version  # >= 24.9.0
npm --version   # >= 10.x
docker --version
docker-compose --version
```

### 2. Installation

```bash
# Clone
git clone <repo>
cd taskflow

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start database
docker-compose up -d db

# Run migrations
npm run prisma:migrate

# Seed data
npm run prisma:seed

# Build CSS
npm run css:build

# Start dev server
npm run dev
```

### 3. Ouvrir

```
http://localhost:3000
```

**Credentials test** :
- Email: `admin@example.com`
- Password: `admin123`

---

## 📝 Points Critiques & Best Practices

### 1. HTMX Detection dans Controllers

```typescript
// ✅ CORRECT
async list(req: Request, res: Response) {
  const data = await this.service.getData();
  
  if (req.headers['hx-request']) {
    return res.render('partials/htmx/data-list', { data });
  }
  
  res.render('pages/data/index', { data });
}

// ❌ INCORRECT - Toujours renvoyer page complète
async list(req: Request, res: Response) {
  const data = await this.service.getData();
  res.render('partials/htmx/data-list', { data });
}
```

### 2. CSRF Protection avec HTMX

```ejs
<!-- ✅ CORRECT - Meta tag + event listener -->
<meta name="csrf-token" content="<%= csrfToken %>">

<script>
  document.body.addEventListener('htmx:configRequest', (event) => {
    event.detail.headers['X-CSRF-Token'] = 
      document.querySelector('meta[name="csrf-token"]').content;
  });
</script>

<!-- ❌ INCORRECT - Token dans chaque form -->
<form hx-post="/tasks">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
</form>
```

### 3. Progressive Enhancement

```ejs
<!-- ✅ CORRECT - Fonctionne sans JS -->
<form action="/tasks" method="GET" hx-get="/tasks" hx-target="#task-list">
  <input name="search">
  <button type="submit">Rechercher</button>
</form>

<!-- ❌ INCORRECT - Ne fonctionne qu'avec HTMX -->
<div hx-get="/tasks">
  <input name="search" hx-trigger="keyup">
</div>
```

### 4. Loading States

```html
<!-- ✅ CORRECT - Indicateur loading -->
<form hx-get="/tasks" hx-indicator="#loading">
  <input name="search">
  <span id="loading" class="htmx-indicator">⏳</span>
</form>

<style>
  .htmx-indicator { opacity: 0; transition: opacity 200ms; }
  .htmx-request .htmx-indicator { opacity: 1; }
</style>
```

---

## ✅ Checklist Qualité

### Avant chaque commit :

- [ ] `npm run lint` - Pas d'erreurs ESLint
- [ ] `npm run build` - Compilation TypeScript OK
- [ ] `npm test` - Tous tests unitaires passent
- [ ] `npm run css:build` - CSS compile sans warnings
- [ ] Controllers détectent requêtes HTMX correctement
- [ ] Partials EJS testés (avec et sans HTMX)
- [ ] CSRF protection active
- [ ] i18n FR + EN à jour
- [ ] Progressive enhancement respecté (fonctionne sans JS)

### Avant merge en production :

- [ ] `npm run test:e2e` - Tests E2E HTMX passent
- [ ] `npm run test:coverage` - Coverage ≥ 85%
- [ ] Lighthouse score ≥ 95 (SSR optimisé)
- [ ] TTFB < 150ms
- [ ] Bundle JS < 50KB (HTMX + Alpine seulement)
- [ ] L'app fonctionne sans JavaScript
- [ ] Dark mode testé
- [ ] Responsive OK
- [ ] Accessibilité WCAG AA validée

---

**Ce document est la source unique de vérité pour TaskFlow avec stack SSR pure moderne.**  
**Versionné**: 31 octobre 2025  
**Stack**: Express + EJS + HTMX + Alpine.js + PostgreSQL + Prisma
