# 📋 PLAN D'ACTION - TaskFlow Refactoring

**Date de début** : 2 novembre 2025  
**Durée estimée** : 3-4 semaines (60-80 heures)  
**Priorité** : P0 (Critique)


---

## 🎯 OBJECTIFS SPRINT PAR SPRINT

### Sprint 1 : P0 - Gaps Critiques (40h) - **URGENT**
**Période** : 4-8 novembre 2025  
**Objectif** : Corriger les incohérences architecturales majeures

### Sprint 2 : P1 - Event System Complet (40h)
**Période** : 11-15 novembre 2025  
**Objectif** : Finaliser le système d'événements + coverage 85%

### Sprint 3 : P2 - Documentation & Polish (20h)
**Période** : 18-22 novembre 2025  
**Objectif** : Documentation complète + UX polish


---

## 📅 SPRINT 1 : GAPS CRITIQUES (4-8 nov 2025)

### 🔴 Tâche 1.1 : AssignTaskCommand + Handler (8h)

#### Contexte
Actuellement, `TaskAssignmentService.assignTask()` existe mais n'est pas exposé via CQRS. Le controller appelle directement `UpdateTaskCommand` pour changer l'assigneeId, contournant la logique métier d'assignation.

#### Sous-tâches
- [ ] **1.1.1** Créer `src/application/commands/tasks/AssignTaskCommand.ts` (1h)
  ```typescript
  import { z } from 'zod';
  import type { ICommand } from '../ICommand.js';

  export const AssignTaskCommandSchema = z.object({
    taskId: z.string().cuid('Invalid task ID'),
    assigneeId: z.string().cuid('Invalid assignee ID').nullable(),
  });

  export type AssignTaskCommandInput = z.infer<typeof AssignTaskCommandSchema>;

  export class AssignTaskCommand implements ICommand {
    public readonly taskId: string;
    public readonly assigneeId: string | null;

    constructor(input: AssignTaskCommandInput) {
      const validated = AssignTaskCommandSchema.parse(input);
      this.taskId = validated.taskId;
      this.assigneeId = validated.assigneeId;
    }
  }
  ```

- [ ] **1.1.2** Créer `src/application/commands/tasks/AssignTaskHandler.ts` (2h)
  ```typescript
  import { injectable, inject } from 'tsyringe';
  import type { ICommandHandler } from '../ICommandHandler.js';
  import type { AssignTaskCommand } from './AssignTaskCommand.js';
  import type { Task } from '../../../domain/entities/Task.js';
  import { TaskAssignmentService } from '../../services/TaskAssignmentService.js';
  import { EventBus } from '../../events/EventBus.js';
  import { TaskAssignedEvent, TaskUnassignedEvent } from '@domain/events/TaskEvents.js';

  @injectable()
  export class AssignTaskHandler implements ICommandHandler<AssignTaskCommand, Task> {
    constructor(
      @inject(TaskAssignmentService) private readonly assignmentService: TaskAssignmentService,
      @inject(EventBus) private readonly eventBus: EventBus
    ) {}

    async execute(command: AssignTaskCommand): Promise<Task> {
      // Use existing service logic
      const task = command.assigneeId
        ? await this.assignmentService.assignTask(command.taskId, command.assigneeId)
        : await this.assignmentService.unassignTask(command.taskId);

      // Publish domain event
      const event = command.assigneeId
        ? new TaskAssignedEvent(task.id, command.assigneeId)
        : new TaskUnassignedEvent(task.id, task.assigneeId!);
      
      await this.eventBus.publish(event);

      return task;
    }
  }
  ```

- [ ] **1.1.3** Enregistrer dans DI container (30min)
  - Modifier `src/config/di-container.ts`
  - Ajouter `AssignTaskHandler` dans les registrations

- [ ] **1.1.4** Exporter dans index (15min)
  - Modifier `src/application/commands/index.ts`

- [ ] **1.1.5** Modifier TaskController (1h)
  - Créer route `POST /tasks/:id/assign` (nouvelle)
  - Utiliser `AssignTaskCommand` au lieu de `UpdateTaskCommand`

- [ ] **1.1.6** Écrire tests unitaires (3h)
  ```typescript
  // tests/unit/commands/tasks/AssignTaskHandler.test.ts
  describe('AssignTaskHandler', () => {
    it('should assign task to user', async () => {
      const handler = new AssignTaskHandler(mockService, mockEventBus);
      const command = new AssignTaskCommand({ 
        taskId: 'task-123', 
        assigneeId: 'user-456' 
      });
      
      const result = await handler.execute(command);
      
      expect(result.assigneeId).toBe('user-456');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.any(TaskAssignedEvent)
      );
    });

    it('should unassign task when assigneeId is null', async () => {
      // ...
    });

    it('should throw AppError when task not found', async () => {
      // ...
    });

    it('should throw AppError when assignee not found', async () => {
      // ...
    });
  });
  ```

**Validation** :
```bash
npm run build        # Compile OK
npm test             # Tests passent
npm run lint         # No errors
```

---

### 🔴 Tâche 1.2 : Publier Events dans Command Handlers (12h)

#### Contexte
EventBus et Event Handlers existent mais ne sont jamais appelés. Actuellement, les Command Handlers créent/modifient des entités mais ne publient pas d'événements.

#### Sous-tâches
- [ ] **1.2.1** Injecter EventBus dans CreateTaskHandler (1h)
  ```typescript
  // src/application/commands/tasks/CreateTaskHandler.ts
  @injectable()
  export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand, Task> {
    constructor(
      @inject(PrismaTaskRepository) private readonly taskRepo: PrismaTaskRepository,
      @inject(PrismaUserRepository) private readonly userRepo: PrismaUserRepository,
      @inject(EventBus) private readonly eventBus: EventBus  // ← AJOUTER
    ) {}

    async execute(command: CreateTaskCommand): Promise<Task> {
      // ... existing code ...
      const createdTask = await this.taskRepo.create(task);

      // ✅ AJOUTER : Publier événement
      await this.eventBus.publish(
        new TaskCreatedEvent(
          createdTask.id,
          createdTask.title,
          createdTask.creatorId,
          createdTask.priority
        )
      );

      return createdTask;
    }
  }
  ```

- [ ] **1.2.2** UpdateTaskHandler : publier TaskUpdatedEvent + StatusChanged + PriorityChanged (3h)
  ```typescript
  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepo.findById(command.taskId);
    if (!task) throw new AppError('Task not found', 404);

    const oldStatus = task.status;
    const oldPriority = task.priority;

    // Update properties
    if (command.title !== undefined) task.updateTitle(command.title);
    // ... other updates

    const updatedTask = await this.taskRepo.update(command.taskId, task);

    // ✅ Publish events
    const events = [new TaskUpdatedEvent(updatedTask.id)];

    if (command.status && command.status !== oldStatus) {
      events.push(new TaskStatusChangedEvent(updatedTask.id, oldStatus, command.status));
    }

    if (command.priority && command.priority !== oldPriority) {
      events.push(new TaskPriorityChangedEvent(updatedTask.id, oldPriority, command.priority));
    }

    await this.eventBus.publishAll(events);

    return updatedTask;
  }
  ```

- [ ] **1.2.3** CompleteTaskHandler : publier TaskCompletedEvent (1h)
- [ ] **1.2.4** DeleteTaskHandler : publier TaskCancelledEvent (1h)
- [ ] **1.2.5** CreateUserHandler : publier UserRegisteredEvent (1h)
- [ ] **1.2.6** UpdateUserHandler : publier UserEmailUpdated / PasswordChanged (2h)
- [ ] **1.2.7** DeactivateUserHandler : publier UserDeactivatedEvent (1h)

- [ ] **1.2.8** Tests : vérifier que events sont publiés (2h)
  ```typescript
  it('should publish TaskCreatedEvent after creation', async () => {
    const eventBus = container.resolve(EventBus);
    const spy = vi.spyOn(eventBus, 'publish');

    await handler.execute(command);

    expect(spy).toHaveBeenCalledWith(expect.any(TaskCreatedEvent));
  });
  ```

**Validation** :
```bash
npm test -- --grep "event"  # Tests événements passent
```

---

### 🔴 Tâche 1.3 : Test Database Configuration (4h)

#### Contexte
Tests d'intégration attendent PostgreSQL sur port 5434 mais docker-compose.yml expose seulement port 5433.

#### Sous-tâches
- [ ] **1.3.1** Créer `docker-compose.test.yml` (1h)
  ```yaml
  version: '3.9'
  services:
    postgres-test:
      image: postgres:18-alpine
      container_name: taskflow-test-db
      ports:
        - "5434:5432"
      environment:
        POSTGRES_DB: taskflow_test
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
        POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C"
      volumes:
        - test-db-data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U test -d taskflow_test"]
        interval: 5s
        timeout: 3s
        retries: 5

  volumes:
    test-db-data:
  ```

- [ ] **1.3.2** Script pour démarrer/arrêter DB test (30min)
  ```bash
  # scripts/test-db.sh
  #!/bin/bash
  case "$1" in
    start)
      docker-compose -f docker-compose.test.yml up -d
      echo "Waiting for test database..."
      sleep 3
      npx prisma migrate deploy --schema prisma/schema.prisma
      ;;
    stop)
      docker-compose -f docker-compose.test.yml down
      ;;
    reset)
      docker-compose -f docker-compose.test.yml down -v
      $0 start
      ;;
    *)
      echo "Usage: $0 {start|stop|reset}"
      exit 1
  esac
  ```

- [ ] **1.3.3** Modifier `tests/setup.ts` : vérifier DATABASE_URL (30min)
  ```typescript
  // tests/setup.ts
  const TEST_DATABASE_URL = 'postgresql://test:test@localhost:5434/taskflow_test?schema=public';

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    // ... rest of setup
  });
  ```

- [ ] **1.3.4** Ajouter npm scripts (15min)
  ```json
  // package.json
  {
    "scripts": {
      "test:db:start": "bash scripts/test-db.sh start",
      "test:db:stop": "bash scripts/test-db.sh stop",
      "test:db:reset": "bash scripts/test-db.sh reset",
      "test:integration": "npm run test:db:start && npm test && npm run test:db:stop"
    }
  }
  ```

- [ ] **1.3.5** Documentation README (15min)
  ```markdown
  ## Testing

  ### Run Integration Tests
  \`\`\`bash
  npm run test:db:start   # Start test database
  npm test                # Run tests
  npm run test:db:stop    # Stop test database

  # Or all-in-one:
  npm run test:integration
  \`\`\`
  ```

- [ ] **1.3.6** Lancer tests et vérifier (1h)
  ```bash
  npm run test:db:reset
  npm test
  # Expecting: 202/202 tests pass ✅
  ```

**Validation** :
```bash
npm run test:integration  # All tests pass
```

---

### 🔴 Tâche 1.4 : Coverage Tests Critiques (16h)

#### Objectif
Augmenter coverage de 10% → 60% minimum en priorisant les parties critiques.

#### Sous-tâches
- [ ] **1.4.1** Tests Command Handlers (6h)
  - CreateTaskHandler.test.ts
  - UpdateTaskHandler.test.ts
  - AssignTaskHandler.test.ts
  - DeleteTaskHandler.test.ts
  - CreateUserHandler.test.ts

- [ ] **1.4.2** Tests Query Handlers (4h)
  - GetAllTasksHandler.test.ts
  - GetTaskByIdHandler.test.ts
  - GetDashboardStatsHandler.test.ts

- [ ] **1.4.3** Tests Domain Entities (3h)
  - Task.test.ts (toutes les méthodes)
  - User.test.ts (toutes les méthodes)

- [ ] **1.4.4** Tests Middleware (3h)
  - requireAuth.test.ts
  - requireAdmin.test.ts
  - htmx.middleware.test.ts
  - error.middleware.test.ts

**Template de test** :
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTaskHandler } from './CreateTaskHandler';
import { PrismaTaskRepository } from '@infrastructure/database/prisma/PrismaTaskRepository';

describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let mockTaskRepo: any;
  let mockUserRepo: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockTaskRepo = {
      create: vi.fn(),
      findById: vi.fn(),
    };
    mockUserRepo = {
      findById: vi.fn().mockResolvedValue({ id: 'user-1', name: 'Test' }),
    };
    mockEventBus = {
      publish: vi.fn(),
    };
    handler = new CreateTaskHandler(mockTaskRepo, mockUserRepo, mockEventBus);
  });

  describe('execute()', () => {
    it('should create task with valid data', async () => {
      const command = new CreateTaskCommand({
        title: 'Test Task',
        creatorId: 'user-1',
        status: 'TODO',
        priority: 'MEDIUM',
      });

      mockTaskRepo.create.mockResolvedValue({
        id: 'task-1',
        title: 'Test Task',
        creatorId: 'user-1',
      });

      const result = await handler.execute(command);

      expect(result.id).toBe('task-1');
      expect(mockTaskRepo.create).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.any(TaskCreatedEvent)
      );
    });

    it('should throw AppError when creator not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow('Creator not found');
    });

    it('should throw AppError when assignee not found', async () => {
      const command = new CreateTaskCommand({
        title: 'Test',
        creatorId: 'user-1',
        assigneeId: 'invalid-user',
      });

      mockUserRepo.findById.mockResolvedValueOnce({ id: 'user-1' }); // creator
      mockUserRepo.findById.mockResolvedValueOnce(null); // assignee

      await expect(handler.execute(command)).rejects.toThrow('Assignee not found');
    });
  });
});
```

**Validation** :
```bash
npm run test:coverage
# Expecting: Coverage > 60%
```

---

### ✅ Sprint 1 - Critères de Succès

- [x] `AssignTaskCommand` + `AssignTaskHandler` implémentés et testés
- [x] Events publiés dans **TOUS** les Command Handlers
- [x] Test database configurée et fonctionnelle (port 5434)
- [x] 14 tests réparés → 202/202 tests passent
- [x] Coverage ≥ 60% (actuellement ~10%)
- [x] Build production passe sans erreurs
- [x] Documentation mise à jour (README, ARCHITECTURE_AUDIT.md)

**Validation finale Sprint 1** :
```bash
npm run build              # ✅ No errors
npm run lint               # ✅ No errors
npm run test:integration   # ✅ 202/202 tests pass
npm run test:coverage      # ✅ Coverage ≥ 60%
```


---

## 📅 SPRINT 2 : EVENT SYSTEM COMPLET (11-15 nov 2025)

### 🟠 Tâche 2.1 : GetTeamCapacityQuery + Handler (4h)

#### Sous-tâches
- [ ] **2.1.1** Créer `GetTeamCapacityQuery.ts` (30min)
- [ ] **2.1.2** Créer `GetTeamCapacityHandler.ts` (1h30)
- [ ] **2.1.3** Utiliser `DashboardMetricsService.getTeamCapacity()` existant
- [ ] **2.1.4** Enregistrer dans DI container (30min)
- [ ] **2.1.5** Tests unitaires (1h30)

---

### 🟠 Tâche 2.2 : Event Handlers Manquants (24h)

#### Liste complète des handlers à créer

##### Task Event Handlers (12h)
- [ ] **2.2.1** `TaskCompletedEventHandler` (3h)
  - Envoyer notification de complétion
  - Mettre à jour analytics
  - Tests

- [ ] **2.2.2** `TaskStatusChangedEventHandler` (2h)
  - Logger changements de statut (audit trail)
  - Tests

- [ ] **2.2.3** `TaskPriorityChangedEventHandler` (2h)
  - Notifier si upgraded à URGENT
  - Tests

- [ ] **2.2.4** `TaskUnassignedEventHandler` (2h)
  - Notifier ancien assignee
  - Tests

- [ ] **2.2.5** `TaskCancelledEventHandler` (2h)
  - Archiver tâche
  - Notifier participants
  - Tests

- [ ] **2.2.6** `TaskDueDateSetEventHandler` (1h)
  - Créer reminder
  - Tests

##### User Event Handlers (12h)
- [ ] **2.2.7** `UserEmailUpdatedEventHandler` (3h)
  - Envoyer email de confirmation
  - Tests

- [ ] **2.2.8** `UserPasswordChangedEventHandler` (3h)
  - Alerte de sécurité par email
  - Tests

- [ ] **2.2.9** `UserRoleUpdatedEventHandler` (2h)
  - Logger changement de permissions
  - Tests

- [ ] **2.2.10** `UserActivatedEventHandler` (2h)
  - Envoyer email de bienvenue
  - Tests

- [ ] **2.2.11** `UserDeactivatedEventHandler` (2h)
  - Archiver données
  - Tests

**Template pour Event Handler** :
```typescript
import { injectable } from 'tsyringe';
import type { IDomainEventHandler } from '../IDomainEventHandler.js';
import { TaskCompletedEvent } from '@domain/events/TaskEvents.js';
import { logger } from '@utils/logger.util.js';

@injectable()
export class TaskCompletedEventHandler implements IDomainEventHandler<TaskCompletedEvent> {
  handle(event: TaskCompletedEvent): Promise<void> {
    logger.info('Handling TaskCompleted event', {
      taskId: event.aggregateId,
      occurredAt: event.occurredAt,
    });

    // TODO Phase 3: Send notification email
    // TODO Phase 3: Update analytics/metrics
    // TODO Phase 3: Trigger webhook for integrations

    return Promise.resolve();
  }

  getEventTypes(): string[] {
    return ['TaskCompleted'];
  }
}
```

---

### 🟠 Tâche 2.3 : Tests Coverage 85% (12h)

#### Sous-tâches
- [ ] **2.3.1** Tests intégration Controllers (6h)
  - TaskController complet (tous les endpoints)
  - AuthController complet
  - UserController complet
  - DashboardController complet

- [ ] **2.3.2** Tests E2E Playwright (6h)
  - User journey : Register → Login → Create Task → Edit Task → Complete Task
  - Task filters avec HTMX
  - Dashboard stats
  - Logout

**Template test E2E** :
```typescript
// tests/e2e/task-flow.spec.ts
import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test.describe('Complete Task Flow', () => {
  test('should complete full task lifecycle', async ({ page }) => {
    // Login
    await login(page, 'admin@example.com', 'admin123');

    // Create task
    await page.goto('/tasks/new');
    await page.fill('input[name="title"]', 'E2E Test Task');
    await page.selectOption('select[name="priority"]', 'HIGH');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tasks\/\w+/);

    // Verify task created
    await expect(page.locator('h1')).toContainText('E2E Test Task');

    // Edit task
    await page.click('a:has-text("Edit")');
    await page.fill('input[name="title"]', 'E2E Test Task (Updated)');
    await page.click('button[type="submit"]');

    // Complete task
    await page.click('button:has-text("Mark as Complete")');
    await expect(page.locator('.badge-success')).toContainText('DONE');

    // Verify in dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.stat-value:first')).toContainText('1');
  });
});
```

**Validation** :
```bash
npm run test:coverage      # Coverage ≥ 85%
npm run test:e2e:browser   # All E2E tests pass
```

---

### ✅ Sprint 2 - Critères de Succès

- [x] `GetTeamCapacityQuery` implémenté et testé
- [x] 11 Event Handlers créés et enregistrés
- [x] Coverage tests ≥ 85%
- [x] Tests E2E complets (Playwright)
- [x] Tous les événements loggés correctement

**Validation finale Sprint 2** :
```bash
npm run build              # ✅ No errors
npm run test:coverage      # ✅ Coverage ≥ 85%
npm run test:e2e:browser   # ✅ All E2E tests pass
```


---

## 📅 SPRINT 3 : DOCUMENTATION & POLISH (18-22 nov 2025)

### 🟡 Tâche 3.1 : ADRs (Architecture Decision Records) (8h)

#### Contexte
Aucun ADR actuellement dans `docs/adr/`. Besoin de documenter les décisions architecturales clés.

#### Sous-tâches
- [ ] **3.1.1** ADR-001: SSR Pure Architecture (1h30)
  ```markdown
  # ADR-001: SSR Pure Architecture

  ## Status
  Accepted

  ## Context
  Need to choose between SPA (React/Vue) vs SSR for TaskFlow.

  ## Decision
  Use pure SSR with EJS templates, no client-side routing.

  ## Consequences
  ### Positive
  - Better SEO (HTML rendered server-side)
  - Faster TTI (no JS bundle)
  - Works without JavaScript
  - Simpler mental model

  ### Negative
  - Full page reloads by default
  - More server load
  - Less "app-like" feel

  ### Mitigations
  - Use HTMX for partial updates
  - Implement aggressive caching

  ## Alternatives Considered
  - React SPA: Rejected (heavier, worse SEO)
  - Next.js SSR: Rejected (too opinionated)
  ```

- [ ] **3.1.2** ADR-002: Technology Stack (1h)
- [ ] **3.1.3** ADR-003: Progressive Enhancement (1h30)
- [ ] **3.1.4** ADR-004: Testing Strategy (1h30)
- [ ] **3.1.5** ADR-005: Observability (OpenTelemetry) (1h)
- [ ] **3.1.6** ADR-006: HTMX Conventions (1h30)

---

### 🟡 Tâche 3.2 : HTMX Patterns Documentation (4h)

#### Sous-tâches
- [ ] **3.2.1** Créer `docs/HTMX_PATTERNS.md` (3h)
  ```markdown
  # HTMX Patterns - TaskFlow

  ## Pattern 1: Partial Page Updates

  ### Problem
  Need to update a section without full page reload.

  ### Solution
  \`\`\`html
  <!-- Trigger -->
  <form hx-post="/tasks" hx-target="#task-list" hx-swap="beforeend">
    <!-- form fields -->
  </form>

  <!-- Target -->
  <div id="task-list">
    <!-- Existing tasks -->
  </div>
  \`\`\`

  ### Server Response
  \`\`\`typescript
  if (req.isHtmx) {
    res.render('partials/tasks/task-item', { task, layout: false });
  } else {
    res.redirect(`/tasks/${task.id}`);
  }
  \`\`\`

  ## Pattern 2: Active Search with Debouncing
  // ... etc
  ```

- [ ] **3.2.2** Ajouter exemples réels du code (1h)

---

### 🟡 Tâche 3.3 : Pages d'Erreur Personnalisées (4h)

#### Sous-tâches
- [ ] **3.3.1** `views/pages/errors/404.ejs` (1h)
- [ ] **3.3.2** `views/pages/errors/500.ejs` (1h)
- [ ] **3.3.3** `views/pages/errors/403.ejs` (1h)
- [ ] **3.3.4** Modifier error middleware pour rendre HTML (1h)
  ```typescript
  // src/presentation/middleware/error.middleware.ts
  export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (req.isHtmx || req.headers.accept?.includes('application/json')) {
      res.status(statusCode).json({
        error: err.message,
        statusCode,
      });
    } else {
      // Render HTML error page
      res.status(statusCode).render(`pages/errors/${statusCode}`, {
        error: err.message,
        statusCode,
        user: req.user,
      });
    }
  };
  ```

---

### 🟡 Tâche 3.4 : Responsive Design Polish (4h)

#### Sous-tâches
- [ ] **3.4.1** Tester sur mobile (< 768px) (1h)
- [ ] **3.4.2** Ajuster breakpoints si nécessaire (1h)
- [ ] **3.4.3** Tester sur tablette (768px-1024px) (1h)
- [ ] **3.4.4** Tests Lighthouse mobile (1h)

---

### ✅ Sprint 3 - Critères de Succès

- [x] 6 ADRs complets dans `docs/adr/`
- [x] Documentation HTMX patterns complète
- [x] 3 pages d'erreur personnalisées
- [x] Responsive design validé (mobile, tablette, desktop)
- [x] Lighthouse Score ≥ 90 (mobile + desktop)

**Validation finale Sprint 3** :
```bash
ls docs/adr/              # ✅ 6 ADR files
cat docs/HTMX_PATTERNS.md # ✅ Documentation complète
npm run lighthouse        # ✅ Score ≥ 90
```


---

## 🎯 CHECKLIST FINALE AVANT PRODUCTION

### Architecture
- [ ] ✅ AssignTaskCommand implémenté
- [ ] ✅ GetTeamCapacityQuery implémenté
- [ ] ✅ Events publiés dans tous Command Handlers
- [ ] ✅ 11+ Event Handlers actifs

### Tests
- [ ] ✅ Test database configurée (port 5434)
- [ ] ✅ Tous les tests passent (202/202)
- [ ] ✅ Coverage ≥ 85%
- [ ] ✅ Tests E2E complets (Playwright)

### Documentation
- [ ] ✅ 6 ADRs rédigés
- [ ] ✅ HTMX patterns documentés
- [ ] ✅ README mis à jour
- [ ] ✅ ARCHITECTURE_AUDIT.md finalisé

### UX/UI
- [ ] ✅ Pages d'erreur custom (404, 500, 403)
- [ ] ✅ Responsive design validé
- [ ] ✅ WCAG 2.2 AA (axe-core)
- [ ] ✅ Lighthouse Score ≥ 90

### DevOps
- [ ] ✅ Build production passe
- [ ] ✅ Docker Compose OK
- [ ] ✅ Healthcheck endpoints testés
- [ ] ✅ Logs structurés (Pino)
- [ ] ✅ CI/CD passe (GitHub Actions)


---

## 📊 MÉTRIQUES DE SUIVI

| Métrique | Actuel | Objectif | Sprint 1 | Sprint 2 | Sprint 3 |
|----------|--------|----------|----------|----------|----------|
| Tests Passing | 188/202 | 202/202 | 202/202 ✅ | - | - |
| Test Coverage | ~10% | 85% | 60% | 85% ✅ | - |
| Commands CQRS | 7/8 | 8/8 | 8/8 ✅ | - | - |
| Queries CQRS | 5/6 | 6/6 | 5/6 | 6/6 ✅ | - |
| Event Handlers | 3/14 | 14/14 | 3/14 | 14/14 ✅ | - |
| ADRs | 0/6 | 6/6 | - | - | 6/6 ✅ |
| Pages Erreur | 0/3 | 3/3 | - | - | 3/3 ✅ |
| Lighthouse Score | ? | 90+ | - | - | 90+ ✅ |


---

## 🔄 REVUE QUOTIDIENNE

### Template Daily Standup
```markdown
## Date: [YYYY-MM-DD]

### ✅ Hier
- [ ] Tâche 1
- [ ] Tâche 2

### 🚀 Aujourd'hui
- [ ] Tâche 3
- [ ] Tâche 4

### ⚠️ Blocages
- Aucun / [Description du blocage]

### 📊 Métriques
- Tests: X/202 passing
- Coverage: X%
```


---

## 📞 CONTACT & SUPPORT

- **Repository**: [GitHub](https://github.com/your-org/taskflow)
- **Documentation**: `/docs/*`
- **Questions**: Ouvrir une issue GitHub
- **Revue de code**: Créer une PR avec template

**Dernière mise à jour** : 2 novembre 2025
