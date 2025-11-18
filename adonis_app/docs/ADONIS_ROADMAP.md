# Roadmap de portage vers AdonisJS

## Phase 0 — Audit & Alignement
- **Inventaire technique** : cartographier les routes, modèles, middlewares et comparer aux conventions Adonis v6 (IoC, providers, services).
- **Objectifs produit** : valider KPI (latence, couverture fonctionnelle, dette) avec les parties prenantes et prioriser les écrans critiques.
- **Stratégie de migration** : choisir entre approche *strangler* (cohabitation) ou bascule complète selon les dépendances identifiées.

## Phase 1 — Socle & Opérations
- **Environnements** : fixer Node 22+, Adonis 6, `.env` strict, scripts npm (`dev`, `test`, `build`).
- **Infrastructure** : dockeriser Postgres/Redis, homogénéiser `docker-compose`, seeders Lucid, activer providers core (Auth, Session, View, Shield, Limiter, Static).
- **Observabilité de base** : Pino logger structuré, niveaux par environnement, intégration journaux (ELK/Seq).

## Phase 2 — Modèle métier & Services
- **Schéma & migrations** : fiabiliser modèles Lucid, relations, hooks, factories; séparer migrations legacy/nouvelles.
- **Services métiers** : déplacer la logique métier (ex. `DashboardService`) dans `app/services` injectés via IoC pour des tests isolés.
- **Validation** : généraliser VineJS (validators DTO entrée/sortie) pour controllers, jobs et formulaires.

## Phase 3 — Couche HTTP & UX
- **Routing** : normaliser `start/routes.ts` (groups, middleware, noms), prévoir versioning API si besoin.
- **Controllers orientés Edge** : séparer branches JSON/HTML, utiliser layouts Edge, composants partagés et slots pour éviter les directives brutes.
- **Assets** : brancher Vite/Encore ou CDN, config `@adonisjs/static`, gérer cache-busting et CSP.

## Phase 4 — Authentification & Sécurité
- **Guard session** : terminer login/logout, remember-me, prévoir tokens API si mobile.
- **Shield & CSRF** : renforcer `config/shield.ts`, CSP, origin checks, rate limiting via Limiter.
- **RBAC/Policies** : définir policies centralisées (`app/policies`) avec tests, alignées sur les rôles métier.

## Phase 5 — Fonctionnalités avancées
- **Notifications** : unifier flash/session, mails (Mailers) et jobs asynchrones (Queue) pour alertes.
- **Internationalisation** : exploiter `@adonisjs/i18n`, middleware de locale, fallback propre.
- **Temps réel** : planifier WebSocket (`@adonisjs/websocket`) ou SSE pour updates live si nécessaire.

## Phase 6 — Qualité & Tests
- **Unitaires** : augmenter la couverture Japa (unit + HTTP context factories), snapshots Edge si pertinent.
- **Fonctionnels** : étoffer `tests/functional` (multi-tenant, edge cases, authentification).
- **CI/CD** : pipeline (GitHub Actions) exécutant lint, typecheck, tests, couverture; blocage merge en cas d'échec.

## Phase 7 — Observabilité & Performance
- **Health & métriques** : intégrer `@adonisjs/health`, exposer métriques Prometheus, alertes SLO.
- **Profiling** : utiliser `Profiler` Adonis, instrumenter services critiques, ajouter cache Redis pour sections lourdes.
- **Analytics conformes RGPD** : créer hooks pour instrumentations anonymisées avec consentement.

## Phase 8 — Durcissement & Release
- **Audit sécurité** : npm audit, SonarQube, revue des secrets/cookies/CORS.
- **Documentation** : maintenir README technique, runbooks ops, guides fonctionnels, checklist de déploiement.
- **Déploiement** : pipeline blue/green ou canary, migrations zero-downtime, rollback plan testé.

## Prochaines étapes
1. Valider la roadmap avec produit/ops et ajuster l’ordre des phases.
2. Créer un board (Linear/Jira) reliant chaque phase à des epics et stories avec critères de sortie.
3. Planifier une revue hebdomadaire pour suivre la migration, partager les bonnes pratiques AdonisJS et lever les risques tôt.
