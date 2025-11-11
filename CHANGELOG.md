## 1.0.0 (2025-11-10)

* fix: add auto-dismiss and close button to flash messages bbe19d6
* fix: correct ESLint issues in test files 192ff8c
* fix: correct test failures and i18n configuration 2e37a2e
* fix: empêcher erreur lors de mise à jour sans changement de statut/priorité 6195145
* fix: remplace validation UUID par CUID pour les filtres de tâches 3d9ffc5
* fix: résolution erreurs eslint et templates ejs 0add4ae
* fix: resolve all test failures (171/171 passing) 209d0a7
* fix: resolve authentication and logout issues 899ac0e
* fix: resolve TypeScript build errors ba20e06
* fix: update language switcher to use req.i18n.language 8840331
* fix(config): add Alpine.js CSP directives to allow execution 48b993c
* fix(docker): copy tailwind.config.ts into container for CSS builds 6252b58
* fix(docker): fix CSS build by including tailwind config in base stage cec4522
* fix(i18n): add missing task form translation keys f569b17
* fix(i18n): add missing translations for static pages 626a600
* fix(i18n): add profile.edit translations to correct location 0b2fc49
* fix(i18n): ajouter clés manquantes dans locales/*/translation.json 975b919
* fix(i18n): corriger les textes non templatés dans les cards de répartition f8d22a0
* fix(i18n): use __() instead of t() for translations in profile-edit view 487f67a
* fix(tasks): correct route order to fix 404 on /tasks/:id/edit 93e3c71
* fix(tasks): redirect to detail/list page after HTMX update/delete instead of showing message 1637c37
* fix(tests): fix repository integration tests - UUID generation and field naming 7811f26
* fix(tests): fix test isolation and final repository issues - 169/171 passing (99%) 048ade9
* fix(tests): résolution path aliases + correction ordre params (Phase 6) 3e41ed0
* fix(ui): add missing newline at end of edit.ejs and format profile-edit.ejs links f7c6b73
* fix(ui): constrain progress bars width in distribution sections 8e2e25e
* fix(ui): correct and simplify SVG icons in dashboard stats section 34f3e4b
* fix(ui): correct priority query parameter format in dashboard hero f45fb7a
* fix(ui): corriger débordement barres de progression dans les cartes métriques 26df9a6
* fix(ui): fix EJS syntax and variable shadowing in badge partial 278556d
* fix(ui): improve 'remember me' checkbox visibility on login page 4a13386
* fix(ui): improve checkbox and radio visibility in dark mode 12771c6
* fix(ui): improve checkbox and radio visibility in light mode too 17f8f40
* fix(ui): improve global layout spacing and margins 873aa7b
* fix(ui): improve input, select, and textarea visibility in both themes f3d2fb6
* fix(ui): migrate from Tailwind CLI to PostCSS for proper DaisyUI support d93d3b1
* fix(ui): pass isAdminContext from controllers to profile-edit view c834518
* fix(ui): prevent avatar distortion and flattening 1ff755e
* fix(ui): remove misplaced toast notification code from footer a3cb7d2
* fix(ui): repair theme toggle - align theme names with DaisyUI config 5d78c4d
* fix(ui): résoudre le bug de réapparition des tâches e4d53db
* fix(ui): use main layout for task edit page 16b57b0
* fix(ui): utiliser les labels traduits déjà fournis par le controller pour les distributions 1766fc2
* fix(users): add connect-flash middleware and fix profile update redirect e4a4782
* fix(users): add locale field update in user profile handler and validation ff7393d
* feat: add language switcher to navbar 67dc2ca
* feat: amélioration pages d'erreur 404/500 (phase 4.3.10) ✅ 848c6aa
* feat: create contact page and fix i18n language detection d41cd0d
* feat: implémentation complète htmx + alpine.js (phase 4.4) e4686b3
* feat: implémentation page settings et route home (phase 4.3) 9c8570e
* feat: improve dark mode alert component contrast 25d8979
* feat: improve dark mode text contrast 7132247
* feat: improve spacing and layout breathing across application 9fd084a
* feat: page édition tâche dédiée (phase 4.3.6) 287915f
* feat: redirect authenticated users from homepage to dashboard 07c5969
* feat(api): implement Phase 3.1 - Express Application Setup 384c6e4
* feat(api): implement Phase 3.2 - Controllers & Validation 596467e
* feat(api): implement Phase 3.3 - Routes & Advanced Middleware 979b4d9
* feat(app): implement AssignTaskCommand, test DB, event publishing 81359ec
* feat(app): implement Phase 2.1 - CQRS commands with Zod validation 49404ea
* feat(app): implement Phase 2.2 - CQRS queries with DTOs 277c551
* feat(app): implement Phase 2.3 - Domain Services f770276
* feat(app): implement Phase 2.4 - Event System efddd78
* feat(app): various improvements and fixes d93c017
* feat(config): comprehensive security hardening (Phase 7.1) 6e13abc
* feat(config): implement production security hardening a5244b7
* feat(config): performance monitoring and observability (Phase 7.2) 4767d2c
* feat(design): implement Phase 4.1 - Design System Setup 59270eb
* feat(docs): add frontend diagnostic tools and documentation e387bf3
* feat(domain): implement Phase 1.1 domain layer with Clean Architecture faa1a35
* feat(infra): add glassmorphism removal automation script 3ccdda4
* feat(infra): implement Phase 1.3 - repositories, mappers, and query builders 1d29b11
* feat(prisma): implement Phase 1.2 database schema and migrations 248c458
* feat(tests): complete Phase 5.1 - Testing Setup a663ece
* feat(tests): complete Phase 5.2 - Domain & Repository Tests 8b01fa1
* feat(tests): complete Phase 5.3 - Service Tests (56 tests passing, 90%+ coverage) 4daf22d
* feat(tests): complete Phase 5.4 AuthController integration tests (20/20 passing) 8edc19c
* feat(tests): expand auth controller integration tests (11/20 passing) 5f75a6a
* feat(tests): phase 5.4 infrastructure - controller integration test setup da27715
* feat(ui): add dashboard partials and error pages db4bf4d
* feat(ui): add static pages (about, faq, licenses, changelog) 47b6aa6
* feat(ui): améliorer visibilité des boutons en dark mode 4510c5b
* feat(ui): complete Phase 4.3 - Pages Implementation d545596
* feat(ui): complete Phase 4.4 - Alpine.js Enhancements 6fe3b14
* feat(ui): enhance UX with Alpine plugins, animations and accessibility 0c78e3f
* feat(ui): enhance views with admin pages and i18n updates e928096
* feat(ui): implement modern button system (2025 best practices) 93b6d9a
* feat(ui): improve hero section and theme colors 4f5dd84
* feat(ui): improve profile edit view with i18n and glassmorphism 2e06532
* feat(ui): optimiser architecture informationnelle du dashboard 06dd338
* feat(ui): remove 'updated at' timestamp from dashboard metrics e44f126
* feat(ui): remove velocity metrics feature 775be75
* feat(ui): standardize input padding system 360518a
* feat(users): add user detail view route GET /users/:id 95261e3
* feat(users): add user edit routes and fix 404 on /users/:id/edit dcb5119
* feat(views): implement Phase 4.2 - EJS Templates Architecture 99d8c66
* refactor: remove contact form from contact page ec497bd
* refactor: remove inactive account functionality d8b2f6e
* refactor(app): improve controllers, queries and view models 300f503
* refactor(auth): remove 'forgot password' link and related i18n 41fb0e5
* refactor(tasks): remove duplicate search input from filters sidebar bcd7ddb
* refactor(ui): remove all breadcrumbs from application 06c12b8
* refactor(ui): remove breadcrumb from task edit page 5653fb7
* refactor(ui): remove glassmorphism design system e2e1131
* refactor(ui): replace glassmorphism classes with standard DaisyUI e1da12c
* chore: ameliorations tests E2E et config d6b8695
* chore: remove backup files 38b1742
* chore: retire les logs de debug de la validation 755e627
* chore(config): update generated CSS and build scripts f2ff934
* chore(ui): rebuild output.css 0e105ae
* docs: add Docker guide and navigation test script 7d70f9d
* docs: documentation tests page édition tâche 126df8b
* docs(docs): add comprehensive design system documentation 60b4fd3
* docs(domain): add Phase 1.1 completion report e34be12
* docs(tests): add Sprint 1 comprehensive status and action plan ac2c58f
* test: parcours utilisateur complet E2E + documentation tests (Phase 6) eec1c20
* test: tests complets pour page édition tâche b6f7869
* test(app): add comprehensive unit tests for CreateUserHandler a28e6e2
* test(app): fix password hashing in TaskController.edit.test.ts 1367aa2
* test(domain): add comprehensive entity tests and fix failing tests 7898c76
* test(tests): add comprehensive task critical path E2E tests 16504ed


### BREAKING CHANGE

* Glassmorphism design system completely removed
* Simplified button classes
Before: btn btn-ghost bg-base-100 border hover:bg-base-200 transition
After: btn btn-ghost

Accessibility: 44px touch, focus rings, WCAG 2.2 AA contrast
Performance: GPU animations, 169.43 KB CSS bundle


