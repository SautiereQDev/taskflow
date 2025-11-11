# Plan de Migration Complet - TaskFlow

**Date:** Janvier 2025  
**Auteur:** AI Analysis  
**Status:** Proposition  
**Version:** 1.0

---

## 📊 Résumé Exécutif

Après analyse approfondie du projet TaskFlow, ce document présente un plan de migration structuré couvrant **7 phases prioritaires** pour moderniser l'architecture frontend, renforcer la sécurité, et améliorer la maintenabilité.

**État Actuel:**
- Backend: Service Layer refactoré ✅ (Phases 1-7 complètes)
- Frontend: Architecture EJS fonctionnelle mais non optimisée ⚠️
- Connexion Backend-Frontend: Basique, sans type safety ⚠️
- Tests: 96% de réussite (242/252) ⚠️
- Sécurité: Basique, manque CSRF et sanitization ⚠️

**Durée Totale Estimée:** 9-13 semaines (2-3 mois)

---

## 🔍 Analyse Détaillée

### 1. Architecture Frontend (EJS Views)

#### État Actuel
- **Structure:** `views/layouts/`, `views/pages/`, `views/partials/`
- **Total:** ~92 fichiers EJS
- **Composants UI:** Badge, Avatar, Skeleton, Stat-Card, Form Fields
- **Partials HTMX:** task-list, task-item, task-filters, pagination
- **Documentation:** Extensive (docs/ui/, HTMX_ALPINE_GUIDE.md)

#### Problèmes Identifiés
🔴 **Duplication de Code:**
- Markup répété entre pages similaires (list, detail, edit)
- Formulaires dupliqués (task-form.ejs vs inline forms)
- Headers/footers de cards non réutilisables

🔴 **Composants Incomplets:**
- Seulement 4 composants UI de base (badge, avatar, skeleton, stat-card)
- Manque: Button, Card, Modal, Dropdown, Alert, Tabs, etc.
- Pas de variantes standardisées (sizes, colors, states)

🔴 **Inconsistances:**
- Certains includes avec `layout: false`, d'autres non
- Props/parameters non documentés dans includes
- Duplication: `pages/errors/404.ejs` ET `pages/error/404.ejs`

#### Métriques
- **Duplication estimée:** ~40% du code frontend
- **Composants manquants:** ~15 composants UI standards
- **Fichiers à refactorer:** ~60 fichiers (pages + partials)

---

### 2. Connexion Backend-Frontend

#### État Actuel
✅ **Bonne Séparation:**
- ViewModels: `TaskViewModel`, `UserViewModel`, `DashboardViewModel`
- Helpers: `renderOrPartial()`, `htmxRedirect()`, `htmxTrigger()`
- Transformation: Entities → DTOs → ViewModels → EJS

✅ **Validation Backend:**
- Zod schemas pour toutes les entrées
- Error handling centralisé (AppError)

#### Problèmes Identifiés
🔴 **Absence de Type Safety:**
```typescript
// PROBLÈME: res.render() accepte `any`
res.render('pages/tasks/list', {
  tasks,      // Type inconnu
  user,       // Type inconnu
  t,          // Type inconnu
  pagination  // Type inconnu
});
```

🔴 **Pas de Contrat Partagé:**
- Types ViewModels définis côté backend uniquement
- Frontend ne connait pas les interfaces
- Refactoring = risque de casser les vues

🔴 **Validation Client-Side Minimale:**
- Component Alpine.js `formValidation` existe mais peu utilisé
- Pas de réutilisation des Zod schemas côté client
- Validation dupliquée (backend + client)

#### Métriques
- **Controllers affectés:** 8 (auth, task, admin, dashboard, user, pages, diagnostic, home)
- **ViewModels à typer:** 3 principaux + 5 helpers
- **Vues à mettre à jour:** ~30 fichiers

---

### 3. Organisation JavaScript Frontend

#### État Actuel
**Fichiers:**
- `public/js/alpine-components.js` (400+ lignes, 7 composants)
- `public/js/htmx-events.js`, `htmx-filters-url.js`
- `public/js/theme-init.js`, `task-card-click.js`

**Dépendances:**
- HTMX 2.0 (CDN)
- Alpine.js 3.15 (CDN)
- Pas de build process

#### Problèmes Identifiés
🔴 **Absence de Modularité:**
```javascript
// PROBLÈME: Tout dans un seul fichier global
document.addEventListener('alpine:init', () => {
  Alpine.data('theme', () => ({ /* 50 lignes */ }));
  Alpine.data('modal', () => ({ /* 40 lignes */ }));
  Alpine.data('toast', () => ({ /* 80 lignes */ }));
  // ... 4 autres composants
});
```

🔴 **Pas de TypeScript Côté Client:**
- Aucun typage pour Alpine data components
- Pas d'autocomplete dans les vues EJS
- Erreurs runtime difficiles à débugger

🔴 **Pas de Bundling:**
- Chargement de CDNs (latence réseau)
- Pas de tree-shaking
- Pas de minification custom

#### Métriques
- **Fichiers JS:** 7 fichiers (~1000 lignes total)
- **Composants Alpine.js:** 7 (theme, modal, toast, formValidation, filtersPanel, taskSearch, confirmDialog)
- **Dépendances CDN:** 6 (HTMX, Alpine + 4 plugins)

---

### 4. Backend - État de Complétude

#### Ce Qui Fonctionne ✅
- **Service Layer:** TaskService, UserService, AuthenticationService
- **Domain Entities:** Task, User avec Value Objects (Email, TaskStatus, TaskPriority)
- **Event System:** EventBus + 3 handlers (TaskCreated, TaskAssigned, UserRegistered)
- **DI:** tsyringe configuré correctement
- **Error Handling:** AppError avec contexte, middleware global
- **ViewModels:** Transformation entities → view data
- **HTMX Integration:** Helpers, partials, événements

#### Lacunes Identifiées 🔴

**Security:**
- ❌ **Pas de CSRF Protection** (csurf middleware manquant)
- ⚠️ **Input Sanitization:** Pas explicite (DOMPurify, validator.js)
- ⚠️ **Helmet Configuration:** Présent mais configuration non auditée
- ⚠️ **Session Security:** Options de cookies non vérifiées (httpOnly, secure, sameSite)
- ❌ **CSP Headers:** Content Security Policy non configuré

**Observability:**
- ⚠️ **Logging:** Pino configuré mais pas de structured logging partout
- ❌ **Metrics:** Pas de Prometheus/StatsD
- ❌ **APM:** Pas d'OpenTelemetry ou équivalent
- ⚠️ **Error Tracking:** Logs seulement, pas de Sentry/Rollbar

**Performance:**
- ⚠️ **Query Optimization:** Pas d'audit Prisma (N+1 queries potentielles)
- ❌ **Caching:** Pas de Redis ou cache in-memory
- ⚠️ **Rate Limiting:** Basique (auth + API), pas de rate limiting par user

**Event System:**
- ⚠️ **Events Non Utilisés:** 16 events définis dans domain/events/, seulement 3 utilisés
- ⚠️ **Event Handlers:** Logging basique, pas d'actions business critiques

---

### 5. Testing

#### État Actuel
```
Test Suites: 252 total
Tests Passed: 242 (96%)
Tests Failed: 10 (4%)
Duration: ~74s
```

**Répartition:**
- ✅ **Domain Entities:** 100% passing (Task: 61, User: 36)
- ✅ **Repositories:** 100% passing (Task: 33, User: 21)
- ✅ **Services:** 98% passing (TaskAssignment: 5, Auth: 3, Password: 15)
- ⚠️ **Controllers:** Échecs dans AuthController (4), TaskController.edit (3)
- ⚠️ **Metrics:** DashboardMetricsService (3 échecs)

#### Problèmes Identifiés
🔴 **10 Tests Échouent (Mocks Outdated):**
```
AuthController:
  ✗ should render login page
  ✗ should authenticate user
  ✗ should reject invalid credentials
  ✗ req.flash() requires sessions

TaskController:
  ✗ should render edit form
  ✗ should update task
  ✗ should handle validation errors

DashboardMetricsService:
  ✗ expected undefined to be 1
  ✗ expected undefined to be 0
  ✗ mock data structure mismatch
```

🔴 **Coverage Inconnu:**
- Pas de rapport vitest --coverage généré
- Branches/statements coverage non mesuré
- Hotspots non identifiés

🔴 **E2E Tests Incomplets:**
- Seulement `debug-filters.spec.ts` (debug test)
- Pas de tests pour: auth flow, task CRUD, admin actions
- Pas de visual regression testing

---

### 6. Sécurité et Best Practices

#### Audit de Sécurité

**🔴 Critical:**
1. **CSRF Protection:** ❌ ABSENT
   ```typescript
   // MANQUANT: csurf middleware
   // Vulnérabilité: Attaques cross-site sur forms
   ```

2. **Input Sanitization:** ⚠️ BASIQUE
   ```typescript
   // ACTUEL: Zod validation seulement
   // MANQUANT: HTML sanitization, XSS prevention explicite
   ```

3. **Content Security Policy:** ❌ ABSENT
   ```typescript
   // MANQUANT: CSP headers
   // Risque: XSS injection, inline scripts malicieux
   ```

**⚠️ Important:**
4. **Session Security:**
   ```typescript
   // À VÉRIFIER:
   // - httpOnly: true?
   // - secure: true (en production)?
   // - sameSite: 'strict'?
   // - cookie maxAge configuration?
   ```

5. **Helmet Configuration:**
   ```typescript
   // PRÉSENT mais configuration non auditée
   app.use(helmet());
   // Vérifier: HSTS, noSniff, frameguard, etc.
   ```

6. **Rate Limiting:**
   ```typescript
   // ACTUEL: authLimiter (15 req/15min), apiLimiter (50 req/15min)
   // MANQUANT: Per-user rate limiting, distributed rate limiting (Redis)
   ```

**✅ Good:**
- ✅ Password Hashing: bcrypt avec salt rounds
- ✅ SQL Injection: Protégé par Prisma ORM
- ✅ Session Store: PostgreSQL (pas in-memory)
- ✅ Environment Variables: .env avec validation

---

## 🚀 Plan de Migration

### Phase 1: Frontend Component Library
**Priorité:** 🔴 HAUTE  
**Durée:** 2-3 semaines  
**Objectif:** Créer une bibliothèque de composants EJS réutilisables standardisés

#### Étapes
1. **Audit de Duplication** (2 jours)
   - Analyser tous les fichiers EJS
   - Identifier patterns répétés (cards, forms, buttons, alerts)
   - Documenter composants existants et manquants

2. **Extraction de Composants** (1 semaine)
   - Créer `views/partials/ui/` structure:
     ```
     ui/
     ├── button.ejs
     ├── card.ejs
     ├── modal.ejs
     ├── alert.ejs
     ├── dropdown.ejs
     ├── tabs.ejs
     └── forms/
         ├── input.ejs
         ├── textarea.ejs (existe)
         ├── select.ejs (existe)
         └── checkbox.ejs
     ```
   - Standardiser les props (size, variant, disabled, etc.)
   - Implémenter variantes (primary, secondary, success, error, etc.)

3. **Documentation** (2 jours)
   - Créer `docs/ui/COMPONENT_LIBRARY.md`
   - Exemples d'utilisation pour chaque composant
   - Props/parameters documentés avec types

4. **Refactoring Progressif** (1 semaine)
   - Migrer pages/tasks/*.ejs vers nouveaux composants
   - Migrer pages/auth/*.ejs
   - Migrer pages/admin/*.ejs
   - Supprimer code dupliqué

#### Critères de Succès
- [ ] 15+ composants UI créés et documentés
- [ ] 40% de réduction du code frontend
- [ ] Toutes les pages utilisent les nouveaux composants
- [ ] Documentation complète avec exemples

---

### Phase 2: Backend-Frontend Type Safety
**Priorité:** 🔴 HAUTE  
**Durée:** 2 semaines  
**Objectif:** Partager les types entre backend et frontend, valider les contrats

#### Étapes
1. **Créer Package Shared Types** (2 jours)
   ```
   src/
   ├── shared-types/
   │   ├── view-models/
   │   │   ├── ITaskViewModel.ts
   │   │   ├── IUserViewModel.ts
   │   │   └── IDashboardViewModel.ts
   │   ├── forms/
   │   │   ├── ICreateTaskForm.ts
   │   │   ├── ILoginForm.ts
   │   │   └── IRegisterForm.ts
   │   └── index.ts
   ```

2. **Génération de Types depuis Zod** (2 jours)
   - Installer `zod-to-ts` ou `zod-to-json-schema`
   - Générer types TypeScript depuis validation schemas
   - Exporter types pour client-side

3. **Typage Strict pour res.render()** (3 jours)
   - Étendre `Express.Response` avec types génériques
   ```typescript
   interface TypedRenderOptions<T> {
     layout?: string | false;
     title?: string;
     data: T; // Forcé
   }

   declare module 'express-serve-static-core' {
     interface Response {
       render<T>(view: string, options: TypedRenderOptions<T>): void;
     }
   }
   ```

4. **Validation Client-Side** (3 jours)
   - Réutiliser Zod schemas côté client (bundle avec esbuild)
   - Mettre à jour Alpine.js `formValidation` component
   - Implémenter validation temps réel

5. **Tests de Contrat** (2 jours)
   - Setup MSW (Mock Service Worker) ou Pact
   - Créer tests vérifiant contrats ViewModels
   - CI/CD pour valider contrats à chaque commit

#### Critères de Succès
- [ ] Types partagés entre backend et frontend
- [ ] Aucun `res.render()` sans types
- [ ] Validation Zod réutilisée client-side
- [ ] Tests de contrat passants

---

### Phase 3: JavaScript Modernization
**Priorité:** 🟡 MOYENNE  
**Durée:** 1-2 semaines  
**Objectif:** Modulariser et typer le JavaScript frontend

#### Étapes
1. **Setup Build Process** (1 jour)
   - Installer esbuild ou Vite
   - Configurer build client-side:
     ```javascript
     // build.config.js
     {
       entryPoints: ['src/client/index.ts'],
       bundle: true,
       minify: true,
       sourcemap: true,
       target: ['es2020'],
       outfile: 'public/js/bundle.js'
     }
     ```

2. **Migrer vers ESM Typés** (4 jours)
   - Créer `src/client/` structure:
     ```
     client/
     ├── components/
     │   ├── theme.ts
     │   ├── modal.ts
     │   ├── toast.ts
     │   └── form-validation.ts
     ├── utils/
     │   └── htmx-helpers.ts
     ├── types/
     │   └── alpine.d.ts
     └── index.ts
     ```

3. **Types TypeScript pour Alpine** (2 jours)
   ```typescript
   // types/alpine.d.ts
   declare module 'alpinejs' {
     interface AlpineComponent {
       init?(): void;
       destroy?(): void;
     }

     interface ThemeComponent extends AlpineComponent {
       theme: 'light' | 'dark';
       toggle(): void;
     }
   }
   ```

4. **Bundling & Optimisation** (1 jour)
   - Tree-shaking automatique
   - Code splitting (vendor bundle séparé)
   - Minification avec source maps

5. **HMR pour Développement** (1 jour)
   - Setup Vite dev server
   - Hot Module Replacement pour JS
   - Integration avec npm run dev

#### Critères de Succès
- [ ] Code JavaScript modulaire (ESM)
- [ ] Types TypeScript pour tous les composants
- [ ] Bundle optimisé (<50KB gzipped)
- [ ] HMR fonctionnel en dev

---

### Phase 4: Security Hardening
**Priorité:** 🔴 HAUTE  
**Durée:** 1 semaine  
**Objectif:** Atteindre les standards de sécurité production

#### Étapes
1. **CSRF Protection** (1 jour)
   ```typescript
   import csrf from 'csurf';

   app.use(csrf({ cookie: true }));

   // Middleware pour ajouter token aux vues
   app.use((req, res, next) => {
     res.locals.csrfToken = req.csrfToken();
     next();
   });
   ```

   ```ejs
   <!-- Dans tous les formulaires -->
   <input type="hidden" name="_csrf" value="<%= csrfToken %>">
   ```

2. **Input Sanitization** (1 jour)
   ```typescript
   import DOMPurify from 'isomorphic-dompurify';
   import validator from 'validator';

   // Middleware sanitization
   app.use((req, res, next) => {
     if (req.body) {
       Object.keys(req.body).forEach(key => {
         if (typeof req.body[key] === 'string') {
           req.body[key] = DOMPurify.sanitize(req.body[key]);
         }
       });
     }
     next();
   });
   ```

3. **Content Security Policy** (1 jour)
   ```typescript
   app.use(helmet.contentSecurityPolicy({
     directives: {
       defaultSrc: ["'self'"],
       styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
       scriptSrc: ["'self'", 'unpkg.com', 'cdn.jsdelivr.net'],
       imgSrc: ["'self'", 'data:', 'https:'],
       connectSrc: ["'self'"],
       fontSrc: ["'self'", 'fonts.gstatic.com'],
       objectSrc: ["'none'"],
       upgradeInsecureRequests: [],
     }
   }));
   ```

4. **Audit Helmet** (1 jour)
   ```typescript
   app.use(helmet({
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true
     },
     contentSecurityPolicy: { /* voir ci-dessus */ },
     xssFilter: true,
     noSniff: true,
     frameguard: { action: 'deny' },
     hidePoweredBy: true
   }));
   ```

5. **Session Security** (1 jour)
   ```typescript
   app.use(session({
     // ... config existante
     cookie: {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: 24 * 60 * 60 * 1000 // 24h
     },
     rolling: true, // Reset maxAge on activity
     resave: false,
     saveUninitialized: false
   }));
   ```

6. **Security Tests** (1 jour)
   - Setup OWASP ZAP scan dans CI/CD
   - npm audit fix
   - Snyk ou Dependabot pour vulnérabilités

#### Critères de Succès
- [ ] CSRF protection sur tous les formulaires
- [ ] Input sanitization automatique
- [ ] CSP headers configurés
- [ ] Helmet fully configured
- [ ] Session cookies sécurisées
- [ ] Security tests automatisés

---

### Phase 5: Testing Improvements
**Priorité:** 🟡 MOYENNE  
**Durée:** 1-2 semaines  
**Objectif:** Atteindre 90%+ coverage, stabiliser les tests

#### Étapes
1. **Fix Failing Tests** (2 jours)
   - Mettre à jour mocks pour Service Layer
   - AuthController: Fix session mock
   - TaskController: Fix req.body typing
   - DashboardMetricsService: Fix data structure

2. **Coverage Report** (1 jour)
   ```bash
   npm run test:coverage
   vitest run --coverage
   ```
   - Analyser hotspots (< 80% coverage)
   - Prioriser domain/application layers

3. **E2E Test Suite** (4 jours)
   ```
   tests/e2e/
   ├── auth/
   │   ├── login.spec.ts
   │   ├── register.spec.ts
   │   └── logout.spec.ts
   ├── tasks/
   │   ├── create.spec.ts
   │   ├── list-filters.spec.ts
   │   ├── edit.spec.ts
   │   └── delete.spec.ts
   └── admin/
       └── user-management.spec.ts
   ```

4. **Visual Regression** (2 jours)
   - Setup Percy ou Playwright screenshots
   - Créer baseline images
   - Tests pour pages critiques

5. **Performance Tests** (1 jour)
   - Setup k6 ou Artillery
   - Tests de charge: login, task list, task create
   - Seuils: p95 < 500ms, p99 < 1s

#### Critères de Succès
- [ ] 252/252 tests passants (100%)
- [ ] Coverage > 90% (domain + application)
- [ ] E2E tests pour critical paths
- [ ] Visual regression tests
- [ ] Performance tests dans CI/CD

---

### Phase 6: Backend Optimization
**Priorité:** 🟢 BASSE  
**Durée:** 1 semaine  
**Objectif:** Optimiser Event System et améliorer observabilité

#### Étapes
1. **Simplifier Event System** (2 jours)
   - Supprimer 13 events non utilisés
   - Garder: TaskCreatedEvent, TaskAssignedEvent, UserRegisteredEvent
   - Nettoyer domain/events/

2. **Structured Logging** (1 jour)
   ```typescript
   logger.info('User logged in', {
     userId: user.id,
     email: user.email,
     ip: req.ip,
     userAgent: req.headers['user-agent']
   });
   ```

3. **Metrics** (2 jours)
   ```typescript
   import { register, Counter, Histogram } from 'prom-client';

   const httpRequestDuration = new Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status']
   });

   app.get('/metrics', (req, res) => {
     res.set('Content-Type', register.contentType);
     res.end(register.metrics());
   });
   ```

4. **Query Optimization** (1 day)
   - Enable Prisma query logs
   - Identify N+1 queries
   - Add proper includes/selects

#### Critères de Succès
- [ ] Events simplifiés (3 seulement)
- [ ] Structured logging partout
- [ ] Metrics endpoint (/metrics)
- [ ] Queries optimisées

---

### Phase 7: Documentation & DevEx
**Priorité:** 🟢 BASSE  
**Durée:** 1 semaine  
**Objectif:** Améliorer expérience développeur

#### Étapes
1. **API Documentation** (2 jours)
   - Setup Swagger/OpenAPI
   - Documenter tous les endpoints
   - Interactive API explorer

2. **ADRs Complets** (1 jour)
   - Finaliser ADRs manquants
   - Documenter décisions récentes

3. **Onboarding Guide** (1 jour)
   - CONTRIBUTING.md détaillé
   - Development setup guide
   - Common tasks documentation

4. **CI/CD Improvements** (1 jour)
   - GitHub Actions optimisées
   - Caching dependencies
   - Parallel test execution

#### Critères de Succès
- [ ] API documentation complète
- [ ] ADRs à jour
- [ ] Onboarding guide
- [ ] CI/CD optimisé (<5min)

---

## 📅 Roadmap & Priorisation

### Sprint 1 (3 semaines) - CRITIQUE
**Objectif:** Moderniser frontend et sécuriser l'app

- **Semaine 1:** Phase 1 - Frontend Component Library (jours 1-5) + Phase 4 - CSRF & Sanitization (jours 6-7)
- **Semaine 2:** Phase 1 (suite) - Refactoring & Documentation + Phase 4 (suite) - CSP & Helmet
- **Semaine 3:** Phase 2 - Backend-Frontend Type Safety (complet)

**Livrables:**
- [ ] Component library complète (15+ composants)
- [ ] 40% code frontend réduit
- [ ] CSRF protection active
- [ ] Types partagés backend-frontend

---

### Sprint 2 (2-3 semaines) - IMPORTANT
**Objectif:** Moderniser JavaScript et stabiliser tests

- **Semaine 4:** Phase 3 - JavaScript Modernization (setup + migration ESM)
- **Semaine 5:** Phase 3 (suite) - Bundling & HMR + Phase 5 - Fix tests
- **Semaine 6:** Phase 5 (suite) - E2E tests + Visual regression

**Livrables:**
- [ ] JavaScript modulaire et typé
- [ ] Bundle optimisé (<50KB)
- [ ] 252/252 tests passants
- [ ] E2E suite complète

---

### Sprint 3 (2 semaines) - OPTIONNEL
**Objectif:** Optimisations et documentation

- **Semaine 7:** Phase 6 - Backend Optimization (events + metrics)
- **Semaine 8:** Phase 7 - Documentation & DevEx

**Livrables:**
- [ ] Event system simplifié
- [ ] Metrics endpoint
- [ ] API documentation
- [ ] Onboarding guide

---

## 📊 Métriques de Succès

### Performance
- **Bundle Size:** <50KB (gzipped)
- **TTFB:** <200ms (p95)
- **Page Load:** <1s (p95)
- **Lighthouse Score:** >90

### Code Quality
- **Test Coverage:** >90%
- **TypeScript Strict:** Aucune erreur
- **Duplication:** <5%
- **Component Reuse:** >80%

### Sécurité
- **OWASP Top 10:** Toutes couvertes
- **npm audit:** 0 vulnérabilités critiques
- **Security Headers:** A+ (securityheaders.com)

### Developer Experience
- **Build Time:** <5s (dev)
- **Test Suite:** <60s
- **HMR:** <100ms
- **Onboarding:** <2h

---

## 🎯 Recommandations Immédiates

### À Faire Cette Semaine (Critical)
1. **Implémenter CSRF Protection** (1 jour)
   - Installer `csurf`
   - Ajouter tokens aux formulaires
   - Tester avec Playwright

2. **Audit Component Duplication** (1 jour)
   - Lister tous les patterns répétés
   - Identifier les 5 composants les plus critiques
   - Créer `views/partials/ui/button.ejs` et `card.ejs`

3. **Fix 10 Failing Tests** (1 jour)
   - Mettre à jour mocks AuthController
   - Fix TaskController test data structures
   - Valider que tous les tests passent

### À Faire Ce Mois (Important)
1. Compléter Phase 1 (Component Library)
2. Implémenter Phase 2 (Type Safety)
3. Commencer Phase 4 (Security Hardening)

### À Faire Ce Trimestre (Nice to Have)
1. Phases 3, 5, 6, 7
2. Performance optimization
3. Documentation complète

---

## 📝 Notes de Clôture

Ce plan de migration est **évolutif et adaptable**. Les phases peuvent être réorganisées selon:
- Priorités business
- Ressources disponibles
- Urgence des déploiements

**Recommandation:** Commencer par **Phase 1 + Phase 4** (Security + Frontend) pour impact maximal immédiat.

**Questions?** Voir `docs/adr/` pour architecture decisions ou contacter l'équipe.

---

**Document Status:** ✅ Ready for Review  
**Next Step:** Review avec équipe → Ajuster priorités → Commencer Sprint 1
