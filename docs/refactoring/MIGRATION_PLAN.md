# 🗺️ Plan de Migration Détaillé - Refactoring TaskFlow

**Objectif** : Simplifier l'architecture de CQRS complet vers Service Layer  
**Durée estimée** : 5-7 jours  
**Risque** : Faible (migration incrémentale avec tests continus)

---

## 📋 Vue d'Ensemble

### Stratégie de Migration

```
┌─────────────────────────────────────────────────┐
│  Phase 1: Préparation (1 jour)                  │
│  - Setup branche, backup, analyse dépendances   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  Phase 2: Services (2-3 jours)                  │
│  - Créer TaskService, UserService               │
│  - Migrer progressivement les controllers       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  Phase 3: Nettoyage (1 jour)                    │
│  - Supprimer Command/Query/Bus                  │
│  - Simplifier Events                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  Phase 4: Tests & Documentation (1-2 jours)     │
│  - Refactorer tests, valider E2E                │
│  - Mettre à jour docs                           │
└─────────────────────────────────────────────────┘
```

---

## 📅 Phase 1: Préparation (Jour 1)

### ✅ Tâche 1.1: Analyse des Dépendances

**Objectif** : Identifier tous les usages de CommandBus/QueryBus

```bash
# Trouver tous les usages de CommandBus
grep -r "commandBus.execute" src/presentation/controllers/

# Trouver tous les usages de QueryBus
grep -r "queryBus.execute" src/presentation/controllers/

# Lister tous les Command Handlers
find src/application/commands -name "*Handler.ts"

# Lister tous les Query Handlers
find src/application/queries -name "*Handler.ts"
```

**Livrable** : Fichier `docs/MIGRATION_INVENTORY.md` avec :
- Liste de tous les Command Handlers (ex: 10 handlers)
- Liste de tous les Query Handlers (ex: 8 handlers)
- Controllers impactés (ex: TaskController, UserController)

### ✅ Tâche 1.2: Backup & Branche

```bash
# Créer branche dédiée
git checkout -b refactor/service-layer-architecture

# Sauvegarder état actuel
git tag "backup-before-refactor-$(date +%Y%m%d)"

# Créer branche de secours
git branch backup-cqrs-architecture
```

### ✅ Tâche 1.3: Exécuter Tests Baseline

**Objectif** : S'assurer que tous les tests passent AVANT refactoring

```bash
# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Vérifier build
npm run build
```

**Critère de succès** :
- ✅ Tous les tests passent
- ✅ Build sans erreurs
- ✅ Application fonctionne en local

---

## 📅 Phase 2: Création des Services (Jours 2-4)

### ✅ Tâche 2.1: Créer TaskService (Jour 2 - Matin)

**Fichier** : `src/application/services/TaskService.ts`

**Contenu** : Voir `docs/REFACTORING_CODE_EXAMPLES.md`

**Méthodes à implémenter** :
```typescript
class TaskService {
  // Writes
  async createTask(input: CreateTaskInput): Promise<Task>
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task>
  async deleteTask(id: string): Promise<void>
  async assignTask(taskId: string, userId: string): Promise<Task>
  async unassignTask(taskId: string): Promise<Task>
  async completeTask(taskId: string): Promise<Task>

  // Reads
  async findAllTasks(filters: TaskFilters): Promise<PaginatedTasks>
  async findTaskById(id: string): Promise<Task | null>
  async findTasksByAssignee(userId: string): Promise<Task[]>
  async findTasksByCreator(userId: string): Promise<Task[]>
}
```

**Commandes** :
```bash
# Créer le fichier
touch src/application/services/TaskService.ts

# Copier le template depuis REFACTORING_CODE_EXAMPLES.md
# Adapter aux besoins spécifiques

# Enregistrer dans DI
# Éditer src/config/di-container.ts
```

**Temps estimé** : 3-4 heures

### ✅ Tâche 2.2: Créer UserService (Jour 2 - Après-midi)

**Fichier** : `src/application/services/UserService.ts`

**Méthodes à implémenter** :
```typescript
class UserService {
  // Writes
  async createUser(input: CreateUserInput): Promise<User>
  async updateUser(id: string, input: UpdateUserInput): Promise<User>
  async deleteUser(id: string): Promise<void>
  async updatePassword(id: string, newPassword: string): Promise<void>
  async updateEmail(id: string, newEmail: string): Promise<User>

  // Reads
  async findAllUsers(filters: UserFilters): Promise<PaginatedUsers>
  async findUserById(id: string): Promise<User | null>
  async findUserByEmail(email: string): Promise<User | null>
}
```

**Temps estimé** : 2-3 heures

### ✅ Tâche 2.3: Migrer TaskController (Jour 3 - Matin)

**Fichier** : `src/presentation/controllers/task.controller.ts`

**Changements** :

```typescript
// AVANT
@injectable()
export class TaskController {
  constructor(
    @inject(CommandBus) private commandBus: CommandBus,
    @inject(QueryBus) private queryBus: QueryBus
  ) {}
}

// APRÈS
@injectable()
export class TaskController {
  constructor(
    @inject(TaskService) private taskService: TaskService
  ) {}
}
```

**Endpoints à migrer** (un par un) :

1. **POST /tasks** (create)
   ```typescript
   // AVANT
   const command = new CreateTaskCommand(input);
   const task = await this.commandBus.execute(CreateTaskCommand, command);

   // APRÈS
   const task = await this.taskService.createTask(input);
   ```

2. **GET /tasks** (list)
   ```typescript
   // AVANT
   const query = new GetAllTasksQuery(filters);
   const result = await this.queryBus.execute(GetAllTasksQuery, query);

   // APRÈS
   const result = await this.taskService.findAllTasks(filters);
   ```

3. **GET /tasks/:id** (detail)
4. **PUT /tasks/:id** (update)
5. **DELETE /tasks/:id** (delete)
6. **POST /tasks/:id/assign** (assign)

**Validation après chaque endpoint** :
```bash
# Test manuel
curl http://localhost:3001/tasks

# Test automatisé
npm test -- task.controller.test.ts
```

**Temps estimé** : 3-4 heures

### ✅ Tâche 2.4: Migrer UserController (Jour 3 - Après-midi)

**Même processus que TaskController**

**Endpoints à migrer** :
- GET /users
- GET /users/:id
- POST /users
- PUT /users/:id
- DELETE /users/:id
- PUT /users/:id/password

**Temps estimé** : 2-3 heures

### ✅ Tâche 2.5: Migrer AdminController (Jour 4 - Matin)

**Endpoints à migrer** :
- GET /admin/users
- GET /admin/users/:id/edit
- PUT /admin/users/:id
- DELETE /admin/users/:id

**Temps estimé** : 1-2 heures

### ✅ Tâche 2.6: Tests Intermédiaires (Jour 4 - Après-midi)

**Validation complète après migration controllers** :

```bash
# 1. Tests unitaires
npm test

# 2. Tests E2E
npm run test:e2e

# 3. Test manuel de tous les parcours
# - Créer tâche
# - Modifier tâche
# - Assigner tâche
# - Compléter tâche
# - Supprimer tâche

# 4. Vérifier logs
# - Pas d'erreurs console
# - Events publiés correctement
```

**Critère de succès** :
- ✅ Tous les tests passent
- ✅ Aucune régression fonctionnelle
- ✅ Performance identique ou meilleure

---

## 📅 Phase 3: Nettoyage (Jour 5)

### ✅ Tâche 3.1: Supprimer Command/Query Infrastructure

**IMPORTANT** : Ne supprimer QUE si Phase 2 est validée à 100%

```bash
# Backup avant suppression
git commit -am "feat: migrate all controllers to services"
git tag "milestone-services-complete"

# Supprimer Command/Query Bus
rm -rf src/application/commands/tasks/
rm -rf src/application/commands/users/
rm src/application/commands/CommandBus.ts
rm src/application/commands/ICommand.ts
rm src/application/commands/ICommandHandler.ts

rm -rf src/application/queries/tasks/
rm -rf src/application/queries/users/
rm src/application/queries/QueryBus.ts
rm src/application/queries/IQuery.ts
rm src/application/queries/IQueryHandler.ts
```

**Vérification** :
```bash
# Build doit passer
npm run build

# Tests doivent passer
npm test
```

### ✅ Tâche 3.2: Simplifier Event System

**Garder uniquement** :
- TaskAssignedEventHandler (notification assignee)
- UserRegisteredEventHandler (email bienvenue)

**Supprimer** :
- TaskCreatedEventHandler (si juste un log)
- Tous les événements sans handler

```bash
# Liste des événements à supprimer
rm src/application/events/handlers/TaskCreatedEventHandler.ts
rm src/application/events/handlers/TaskUpdatedEventHandler.ts
# ... autres handlers inutilisés
```

**Adapter EventBus** si nécessaire (simplifier)

### ✅ Tâche 3.3: Nettoyer di-container.ts

**Supprimer enregistrements obsolètes** :

```typescript
// SUPPRIMER
container.registerSingleton(CommandBus);
container.register('CreateTaskCommandHandler', { useClass: CreateTaskHandler });
// ... tous les handlers

// GARDER
container.registerSingleton(TaskService);
container.registerSingleton(UserService);
```

**Fichier cible** : 50-60 lignes (au lieu de 200+)

---

## 📅 Phase 4: Tests & Documentation (Jours 6-7)

### ✅ Tâche 4.1: Refactorer Tests Unitaires (Jour 6)

**Mettre à jour tests de services** :

```typescript
// AVANT - CreateTaskHandler.test.ts
describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  // ... setup complexe
});

// APRÈS - TaskService.test.ts
describe('TaskService', () => {
  let service: TaskService;
  // ... setup simplifié
});
```

**Fichiers à migrer** :
- `src/application/services/TaskService.test.ts`
- `src/application/services/UserService.test.ts`

**Temps estimé** : 3-4 heures

### ✅ Tâche 4.2: Valider Tests E2E (Jour 6)

```bash
# Exécuter suite complète Playwright
npm run test:e2e

# Si échecs, débugger
npm run test:e2e:headed
```

**Parcours critiques à valider** :
- ✅ Login/Logout
- ✅ Dashboard
- ✅ CRUD Tâches (create, read, update, delete)
- ✅ Assignation tâches
- ✅ Filtres et pagination
- ✅ Profil utilisateur

### ✅ Tâche 4.3: Mettre à Jour Documentation (Jour 7)

**Fichiers à modifier** :

1. **docs/ARCHITECTURE.md**
   - Supprimer sections CQRS
   - Ajouter section Service Layer
   - Mettre à jour diagrammes

2. **.github/instructions/copilot-instructions.md**
   - Mettre à jour conventions architecture
   - Supprimer références Command/Query Bus

3. **README.md**
   - Mettre à jour section Architecture
   - Simplifier diagrammes

4. **Créer docs/MIGRATION_CHANGELOG.md**
   - Documenter changements
   - Rationale des décisions
   - Breaking changes (si API publique)

### ✅ Tâche 4.4: Code Review & Merge (Jour 7)

```bash
# Créer Pull Request
git push origin refactor/service-layer-architecture

# Checklist PR
- [ ] Tous les tests passent (CI/CD)
- [ ] Documentation mise à jour
- [ ] Aucune régression fonctionnelle
- [ ] Performance validée
- [ ] Code review approuvé

# Merge
git checkout master
git merge refactor/service-layer-architecture
git push origin master

# Tag release
git tag v2.0.0-simplified-architecture
git push --tags
```

---

## 📊 Métriques de Succès

### Avant Refactoring

| Métrique | Valeur Actuelle |
|----------|----------------|
| Fichiers Application Layer | ~45 fichiers |
| Lignes de code (Application) | ~2000 LOC |
| Profondeur stack trace | 8-10 niveaux |
| Temps création feature | 3-4 heures |
| Courbe apprentissage | 2-3 semaines |
| Tests unitaires | 2 fichiers |

### Après Refactoring (Objectifs)

| Métrique | Valeur Cible | Gain |
|----------|--------------|------|
| Fichiers Application Layer | ~8 fichiers | **-82%** |
| Lignes de code (Application) | ~900 LOC | **-55%** |
| Profondeur stack trace | 4-5 niveaux | **-50%** |
| Temps création feature | 1-2 heures | **-50%** |
| Courbe apprentissage | 3-5 jours | **-70%** |
| Tests unitaires | 4 fichiers | **+100%** |

---

## ⚠️ Gestion des Risques

### Risque 1: Tests échouent après migration

**Probabilité** : Moyenne  
**Impact** : Élevé  
**Mitigation** :
- Migration incrémentale (endpoint par endpoint)
- Tests après chaque changement
- Branche de backup disponible

**Plan B** : Rollback vers branche `backup-cqrs-architecture`

### Risque 2: Régression fonctionnelle non détectée

**Probabilité** : Faible  
**Impact** : Élevé  
**Mitigation** :
- Suite E2E Playwright complète
- Tests manuels des parcours critiques
- Review par pair

**Plan B** : Hotfix si détecté en production

### Risque 3: Performance dégradée

**Probabilité** : Très faible  
**Impact** : Moyen  
**Mitigation** :
- Monitoring performance avant/après
- Load testing si possible
- Profiling avec Node.js profiler

**Plan B** : Optimisation ciblée ou rollback

---

## ✅ Checklist Globale

### Préparation
- [ ] Analyse dépendances complète
- [ ] Branche de refactoring créée
- [ ] Tests baseline passent à 100%
- [ ] Équipe informée du refactoring

### Développement
- [ ] TaskService créé et testé
- [ ] UserService créé et testé
- [ ] TaskController migré
- [ ] UserController migré
- [ ] AdminController migré
- [ ] DashboardController vérifié (pas de changement si AuthService OK)
- [ ] Tests intermédiaires passent

### Nettoyage
- [ ] Command/Query infrastructure supprimée
- [ ] Event system simplifié
- [ ] di-container.ts nettoyé
- [ ] Build passe sans erreurs

### Validation
- [ ] Tests unitaires refactorés et passent
- [ ] Tests E2E passent à 100%
- [ ] Tests manuels OK
- [ ] Performance validée
- [ ] Aucune régression détectée

### Documentation
- [ ] ARCHITECTURE.md mis à jour
- [ ] copilot-instructions.md mis à jour
- [ ] README.md mis à jour
- [ ] MIGRATION_CHANGELOG.md créé
- [ ] Code review complète
- [ ] PR mergée

---

## 📞 Support & Questions

### FAQ Refactoring

**Q: Dois-je vraiment supprimer CQRS ?**  
R: Oui, si votre contexte correspond aux critères :
- App monolithique SSR
- 1-5 développeurs
- Time-to-market prioritaire
- Pas de microservices prévus

**Q: Peut-on garder CQRS partiellement ?**  
R: Oui, voir "CQRS Light" dans `ARCHITECTURE_REFACTORING_ANALYSIS.md`

**Q: Et si je veux revenir en arrière ?**  
R: Branche `backup-cqrs-architecture` disponible, merge facile

**Q: Impact sur les tests existants ?**  
R: Tests E2E inchangés, tests unitaires simplifiés

---

## 🎯 Conclusion

Ce plan de migration offre une **transition sécurisée** de CQRS complet vers Service Layer :

✅ **Approche incrémentale** : Pas de "big bang"  
✅ **Tests continus** : Validation à chaque étape  
✅ **Rollback possible** : Branches de backup  
✅ **Durée raisonnable** : 5-7 jours  
✅ **Gains mesurables** : -70% complexité, +50% vélocité

**Prêt à démarrer ?** 🚀

Commencer par **Phase 1 - Préparation** (1 jour).

