# 💻 Exemples de Code Refactoré - TaskFlow

**Documentation complémentaire à `ARCHITECTURE_REFACTORING_ANALYSIS.md`**

Ce document présente des exemples concrets de code **AVANT** et **APRÈS** le refactoring proposé.

---

## 📦 Structure des Dossiers

### AVANT (Architecture CQRS Complète)

```
src/application/
├── commands/                    # ❌ À SUPPRIMER
│   ├── CommandBus.ts           # ~100 lignes
│   ├── ICommand.ts
│   ├── ICommandHandler.ts
│   ├── tasks/
│   │   ├── CreateTaskCommand.ts         # ~30 lignes
│   │   ├── CreateTaskHandler.ts         # ~40 lignes
│   │   ├── UpdateTaskCommand.ts
│   │   ├── UpdateTaskHandler.ts
│   │   ├── DeleteTaskCommand.ts
│   │   ├── DeleteTaskHandler.ts
│   │   ├── AssignTaskCommand.ts
│   │   ├── AssignTaskHandler.ts
│   │   ├── CompleteTaskCommand.ts
│   │   └── CompleteTaskHandler.ts
│   └── users/
│       ├── CreateUserCommand.ts
│       ├── CreateUserHandler.ts
│       └── ...
├── queries/                     # ❌ À SUPPRIMER
│   ├── QueryBus.ts
│   ├── IQuery.ts
│   ├── IQueryHandler.ts
│   ├── tasks/
│   │   ├── GetAllTasksQuery.ts
│   │   ├── GetAllTasksHandler.ts
│   │   ├── GetTaskByIdQuery.ts
│   │   └── GetTaskByIdHandler.ts
│   └── users/
│       └── ...
├── events/                      # ⚠️ SIMPLIFIER
│   ├── EventBus.ts
│   ├── handlers/
│   │   ├── TaskCreatedEventHandler.ts   # 3/16 utilisés
│   │   ├── TaskAssignedEventHandler.ts
│   │   └── UserRegisteredEventHandler.ts
│   └── ...
└── services/                    # ⚠️ DUPLICATION
    ├── TaskAssignmentService.ts  # Fait la même chose que AssignTaskHandler
    ├── AuthenticationService.ts
    └── DashboardMetricsService.ts

Total: ~45 fichiers, ~2000 lignes
```

### APRÈS (Architecture Service Layer)

```
src/application/
├── services/                    # ⭐ POINT D'ENTRÉE UNIQUE
│   ├── TaskService.ts           # ~250 lignes - TOUT en un
│   ├── UserService.ts           # ~200 lignes
│   ├── AuthService.ts           # ~180 lignes (existant, renommé)
│   └── DashboardService.ts      # ~150 lignes (existant)
├── events/                      # ⚠️ CONSERVÉ SIMPLIFIÉ
│   ├── EventBus.ts
│   └── handlers/
│       ├── TaskAssignedEventHandler.ts    # Garde uniquement
│       └── UserRegisteredEventHandler.ts  # les critiques
└── dtos/                        # ✅ CONSERVÉ
    ├── TaskDto.ts
    └── UserDto.ts

Total: ~8 fichiers, ~900 lignes (-55% code)
```

---

## 🔧 Exemple 1: TaskService Complet

### APRÈS - TaskService.ts (Architecture Cible)

```typescript
/**
 * TaskService
 *
 * Centralized business logic for task operations.
 * Replaces Command/Query Handlers with unified service methods.
 *
 * @module application/services/TaskService
 */

import { inject, injectable } from 'tsyringe';
import { z } from 'zod';
import type { Task } from '@domain/entities/Task.js';
import { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import { TaskPriority } from '@domain/value-objects/TaskPriority.js';
import type { ITaskRepository } from '@domain/repositories/ITaskRepository.js';
import type { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { EventBus } from '@application/events/EventBus.js';
import { TaskCreatedEvent, TaskAssignedEvent } from '@domain/events/TaskEvents.js';
import { AppError } from '@utils/AppError.js';
import { logger } from '@utils/logger.util.js';

// ─────────────────────────────────────────────────────────────
// Input DTOs (remplace Commands)
// ─────────────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Title min 3 chars').max(200, 'Title max 200 chars'),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  creatorId: z.string().cuid('Invalid creator ID'),
  assigneeId: z.string().cuid('Invalid assignee ID').optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  creatorId?: string;
  dueDateFilter?: 'overdue' | 'today' | 'week' | 'month';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────
// TaskService (remplace tous les Command/Query Handlers)
// ─────────────────────────────────────────────────────────────

@injectable()
export class TaskService {
  constructor(
    @inject('ITaskRepository') private readonly taskRepository: ITaskRepository,
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject(EventBus) private readonly eventBus: EventBus
  ) {}

  // ─────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new task
   *
   * Replaces: CreateTaskCommand + CreateTaskHandler
   *
   * @param input - Task creation data
   * @returns Created task
   * @throws {AppError} If creator not found or validation fails
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    // 1. Validate input
    const validated = CreateTaskSchema.parse(input);
    logger.debug('Creating task', { title: validated.title, creatorId: validated.creatorId });

    // 2. Validate creator exists
    const creator = await this.userRepository.findById(validated.creatorId);
    if (!creator) {
      throw new AppError('Creator not found', 404);
    }

    // 3. Validate assignee if provided
    if (validated.assigneeId) {
      const assignee = await this.userRepository.findById(validated.assigneeId);
      if (!assignee) {
        throw new AppError('Assignee not found', 404);
      }
    }

    // 4. Create domain entity
    const task = Task.create({
      id: this.generateId(),
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status ?? TaskStatus.TODO,
      priority: validated.priority ?? TaskPriority.MEDIUM,
      creatorId: validated.creatorId,
      assigneeId: validated.assigneeId ?? null,
      dueDate: validated.dueDate ?? null,
    });

    // 5. Persist
    const savedTask = await this.taskRepository.create(task);

    // 6. Publish event
    await this.eventBus.publish(new TaskCreatedEvent(savedTask));

    logger.info('Task created', { taskId: savedTask.id, title: savedTask.title });
    return savedTask;
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Update an existing task
   *
   * Replaces: UpdateTaskCommand + UpdateTaskHandler
   */
  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const validated = UpdateTaskSchema.parse(input);

    // Find task
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Validate assignee if changed
    if (validated.assigneeId !== undefined) {
      if (validated.assigneeId && validated.assigneeId !== task.assigneeId) {
        const assignee = await this.userRepository.findById(validated.assigneeId);
        if (!assignee) {
          throw new AppError('Assignee not found', 404);
        }
      }
    }

    // Update fields
    if (validated.title !== undefined) {
      task.updateTitle(validated.title);
    }
    if (validated.description !== undefined) {
      task.updateDescription(validated.description);
    }
    if (validated.status !== undefined) {
      task.changeStatus(validated.status);
    }
    if (validated.priority !== undefined) {
      task.changePriority(validated.priority);
    }
    if (validated.assigneeId !== undefined) {
      if (validated.assigneeId) {
        task.assignTo(validated.assigneeId);
      } else {
        task.unassign();
      }
    }
    if (validated.dueDate !== undefined) {
      if (validated.dueDate) {
        task.setDueDate(validated.dueDate);
      } else {
        task.clearDueDate();
      }
    }

    // Persist
    const updated = await this.taskRepository.update(task);

    logger.info('Task updated', { taskId });
    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────

  /**
   * Delete a task
   *
   * Replaces: DeleteTaskCommand + DeleteTaskHandler
   */
  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    await this.taskRepository.delete(taskId);
    logger.info('Task deleted', { taskId });
  }

  // ─────────────────────────────────────────────────────────────
  // ASSIGN / UNASSIGN
  // ─────────────────────────────────────────────────────────────

  /**
   * Assign task to a user
   *
   * Replaces: AssignTaskCommand + AssignTaskHandler + TaskAssignmentService
   */
  async assignTask(taskId: string, assigneeId: string): Promise<Task> {
    // Validate task
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Validate assignee
    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) {
      throw new AppError('Assignee not found', 404);
    }

    // Assign
    task.assignTo(assigneeId);
    const updated = await this.taskRepository.update(task);

    // Publish event (important pour notification)
    await this.eventBus.publish(new TaskAssignedEvent(updated, assigneeId));

    logger.info('Task assigned', { taskId, assigneeId });
    return updated;
  }

  /**
   * Unassign task
   */
  async unassignTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    task.unassign();
    return await this.taskRepository.update(task);
  }

  // ─────────────────────────────────────────────────────────────
  // COMPLETE
  // ─────────────────────────────────────────────────────────────

  /**
   * Mark task as completed
   *
   * Replaces: CompleteTaskCommand + CompleteTaskHandler
   */
  async completeTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    task.complete();
    const updated = await this.taskRepository.update(task);

    logger.info('Task completed', { taskId });
    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  // QUERIES (remplace Query Handlers)
  // ─────────────────────────────────────────────────────────────

  /**
   * Get all tasks with filters and pagination
   *
   * Replaces: GetAllTasksQuery + GetAllTasksHandler
   */
  async findAllTasks(filters: TaskFilters = {}): Promise<PaginatedTasks> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskRepository.findAll({
        skip,
        take: limit,
        where: this.buildWhereClause(filters),
        orderBy: { createdAt: 'desc' },
      }),
      this.taskRepository.count({
        where: this.buildWhereClause(filters),
      }),
    ]);

    return {
      items: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get task by ID
   *
   * Replaces: GetTaskByIdQuery + GetTaskByIdHandler
   */
  async findTaskById(taskId: string): Promise<Task | null> {
    return await this.taskRepository.findById(taskId);
  }

  /**
   * Get tasks assigned to a user
   */
  async findTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return await this.taskRepository.findByAssigneeId(assigneeId);
  }

  /**
   * Get tasks created by a user
   */
  async findTasksByCreator(creatorId: string): Promise<Task[]> {
    return await this.taskRepository.findByCreatorId(creatorId);
  }

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  private buildWhereClause(filters: TaskFilters): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dueDateFilter) {
      const now = new Date();
      switch (filters.dueDateFilter) {
        case 'overdue':
          where.dueDate = { lt: now };
          where.status = { not: TaskStatus.DONE };
          break;
        case 'today':
          const endOfDay = new Date(now.setHours(23, 59, 59, 999));
          where.dueDate = { lte: endOfDay };
          break;
        // ... autres cas
      }
    }

    return where;
  }

  private generateId(): string {
    // Utiliser votre générateur d'ID (cuid, uuid, etc.)
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 🎮 Exemple 2: Controller Simplifié

### AVANT - TaskController (CQRS)

```typescript
// task.controller.ts (AVANT)
@injectable()
export class TaskController {
  constructor(
    @inject(CommandBus) private commandBus: CommandBus,
    @inject(QueryBus) private queryBus: QueryBus
  ) {}

  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    // 1. Créer Command
    const command = new CreateTaskCommand({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      creatorId: req.user!.id,
      assigneeId: req.body.assigneeId,
      dueDate: req.body.dueDate,
    });

    // 2. Exécuter via CommandBus
    const task = await this.commandBus.execute(CreateTaskCommand, command);

    // 3. Response
    req.flash('success', 'Task created');
    res.redirect(`/tasks/${task.id}`);
  }

  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    // 1. Créer Query
    const query = new GetAllTasksQuery({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      status: req.query.status as string[],
      priority: req.query.priority as string[],
    });

    // 2. Exécuter via QueryBus
    const result = await this.queryBus.execute(GetAllTasksQuery, query);

    // 3. Render
    res.render('pages/tasks/list', { tasks: result });
  }
}
```

### APRÈS - TaskController (Service Layer)

```typescript
// task.controller.ts (APRÈS)
@injectable()
export class TaskController {
  constructor(
    @inject(TaskService) private taskService: TaskService // ⭐ Service unique
  ) {}

  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Appel direct au service
      const task = await this.taskService.createTask({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        creatorId: req.user!.id,
        assigneeId: req.body.assigneeId,
        dueDate: req.body.dueDate,
      });

      req.flash('success', 'Task created');
      res.redirect(`/tasks/${task.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        req.flash('error', 'Validation error');
        return res.redirect('/tasks/new');
      }
      throw error;
    }
  }

  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    // Appel direct au service
    const result = await this.taskService.findAllTasks({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      status: req.query.status as TaskStatus[],
      priority: req.query.priority as TaskPriority[],
      assigneeId: req.query.assigneeId as string,
      search: req.query.search as string,
    });

    res.render('pages/tasks/list', { tasks: result });
  }
}
```

**Différences clés**:
- ✅ **Plus simple** : appel direct `taskService.createTask()`
- ✅ **Stack trace courte** : Controller → Service → Repository
- ✅ **Debugging facile** : Tout dans le Service
- ✅ **Moins de fichiers** : 1 Service au lieu de 10+ Command/Query

---

## 🧪 Exemple 3: Tests Simplifiés

### AVANT - Test avec Mocks CQRS

```typescript
// CreateTaskHandler.test.ts (AVANT)
describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let mockTaskRepo: jest.Mocked<ITaskRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockTaskRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      // ... 10+ méthodes à mocker
    };

    mockEventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    handler = new CreateTaskHandler(mockTaskRepo, mockEventBus);
  });

  it('should create task via handler', async () => {
    const command = new CreateTaskCommand({
      title: 'Test Task',
      creatorId: 'user-123',
    });

    const task = Task.create({ ...command, id: 'task-123' });
    mockTaskRepo.create.mockResolvedValue(task);

    const result = await handler.execute(command);

    expect(result).toEqual(task);
    expect(mockTaskRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Task' })
    );
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.any(TaskCreatedEvent)
    );
  });
});
```

### APRÈS - Test Direct Service

```typescript
// TaskService.test.ts (APRÈS)
describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepo: jest.Mocked<ITaskRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockTaskRepo = { create: jest.fn() };
    mockUserRepo = { findById: jest.fn() };
    mockEventBus = { publish: jest.fn() };

    service = new TaskService(mockTaskRepo, mockUserRepo, mockEventBus);
  });

  it('should create task', async () => {
    // Arrange
    const creator = User.create({ id: 'user-123', email: 'test@test.com' });
    mockUserRepo.findById.mockResolvedValue(creator);

    const task = Task.create({ 
      id: 'task-123', 
      title: 'Test', 
      creatorId: 'user-123' 
    });
    mockTaskRepo.create.mockResolvedValue(task);

    // Act
    const result = await service.createTask({
      title: 'Test',
      creatorId: 'user-123',
    });

    // Assert
    expect(result.title).toBe('Test');
    expect(mockTaskRepo.create).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.any(TaskCreatedEvent)
    );
  });
});
```

**Avantages**:
- ✅ **Moins de setup** : 1 service au lieu de CommandBus + Handler
- ✅ **Tests plus lisibles** : Logic claire dans le service
- ✅ **Moins de mocks** : Pas besoin de mocker CommandBus/QueryBus

---

## 📊 Exemple 4: DI Container Simplifié

### AVANT - di-container.ts (CQRS)

```typescript
// di-container.ts (AVANT - 200 lignes)
import { container } from 'tsyringe';

// Command Bus & Handlers
container.registerSingleton(CommandBus);
container.register('CreateTaskCommandHandler', { useClass: CreateTaskHandler });
container.register('UpdateTaskCommandHandler', { useClass: UpdateTaskHandler });
container.register('DeleteTaskCommandHandler', { useClass: DeleteTaskHandler });
container.register('AssignTaskCommandHandler', { useClass: AssignTaskHandler });
container.register('CompleteTaskCommandHandler', { useClass: CompleteTaskHandler });
// ... 10+ autres handlers

// Query Bus & Handlers
container.registerSingleton(QueryBus);
container.register('GetAllTasksQueryHandler', { useClass: GetAllTasksHandler });
container.register('GetTaskByIdQueryHandler', { useClass: GetTaskByIdHandler });
// ... 8+ autres handlers

// Services (en doublon avec handlers)
container.registerSingleton(TaskAssignmentService);
container.registerSingleton(AuthenticationService);
// ...

// Controllers
container.registerSingleton(TaskController);
// ...
```

### APRÈS - di-container.ts (Service Layer)

```typescript
// di-container.ts (APRÈS - 50 lignes)
import { container } from 'tsyringe';

// ─────────────────────────────────────────────────────────────
// Infrastructure Layer
// ─────────────────────────────────────────────────────────────
container.registerSingleton(PrismaService);
container.registerSingleton(UnitOfWork);

container.register<ITaskRepository>('ITaskRepository', {
  useClass: PrismaTaskRepository,
});
container.register<IUserRepository>('IUserRepository', {
  useClass: PrismaUserRepository,
});

// ─────────────────────────────────────────────────────────────
// Application Layer - Services (⭐ SIMPLIFIÉ)
// ─────────────────────────────────────────────────────────────
container.registerSingleton(TaskService);        // Remplace Command/Query Handlers
container.registerSingleton(UserService);        // Remplace Command/Query Handlers
container.registerSingleton(AuthService);        // Conservé
container.registerSingleton(DashboardService);   // Conservé

// Event System (simplifié)
container.registerSingleton(EventBus);
container.registerSingleton(TaskAssignedEventHandler);
container.registerSingleton(UserRegisteredEventHandler);

// ─────────────────────────────────────────────────────────────
// Presentation Layer - Controllers
// ─────────────────────────────────────────────────────────────
container.registerSingleton(TaskController);
container.registerSingleton(UserController);
container.registerSingleton(AuthController);
container.registerSingleton(DashboardController);

export { container };
```

**Réduction**:
- ✅ **-75% de lignes** (200 → 50)
- ✅ **-80% d'enregistrements** (40+ → 8)
- ✅ **Plus lisible** et maintenable

---

## 🚀 Migration Step-by-Step

### Étape 1: Créer TaskService

```bash
# Créer le nouveau service
touch src/application/services/TaskService.ts

# Copier le code du fichier d'exemple ci-dessus
# Adapter aux besoins spécifiques du projet
```

### Étape 2: Migrer un Controller (exemple: create)

```typescript
// AVANT
const command = new CreateTaskCommand(input);
const task = await this.commandBus.execute(CreateTaskCommand, command);

// APRÈS
const task = await this.taskService.createTask(input);
```

### Étape 3: Exécuter les Tests

```bash
npm test
npm run test:e2e
```

### Étape 4: Supprimer l'Ancien Code (après validation)

```bash
# Une fois tous les controllers migrés et tests OK
rm -rf src/application/commands/tasks/
rm -rf src/application/queries/tasks/
```

---

## 📝 Checklist de Migration

### Pour Chaque Endpoint:

- [ ] **1. Créer méthode** dans Service
- [ ] **2. Migrer Controller** vers Service
- [ ] **3. Tester** endpoint manuellement
- [ ] **4. Valider** tests automatisés
- [ ] **5. Code review**
- [ ] **6. Supprimer** ancien Command/Query (après validation)

### Validation Finale:

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests E2E Playwright passent
- [ ] Aucune régression fonctionnelle
- [ ] Performance identique ou améliorée
- [ ] Documentation mise à jour

---

## 🎓 Conclusion

Ce refactoring propose de **réduire la complexité de 70%** tout en **conservant les bénéfices** de Clean Architecture :

✅ **Conservé** :
- Domain Layer (Entities, Value Objects)
- Repository Pattern
- Dependency Injection
- Type Safety

❌ **Supprimé** :
- Command/Query Bus overhead
- Duplication Services ↔ Handlers
- Event Bus complexe (simplifié)

🎯 **Résultat** : Code plus simple, maintenable, et véloce.

