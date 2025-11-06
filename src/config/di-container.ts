/**
 * Dependency Injection Container
 *
 * Central registry for all injectable services using tsyringe.
 * Import this file BEFORE any DI-registered classes in entry files.
 *
 * @example
 * ```typescript
 * // In main.ts or app.ts
 * import './config/di-container.js';
 * import { container } from 'tsyringe';
 * import { TaskService } from '@services/TaskService.js';
 *
 * const taskService = container.resolve(TaskService);
 * ```
 */

import 'reflect-metadata';
import { container } from 'tsyringe';

// Infrastructure Layer - Database
import { PrismaService } from '../infrastructure/database/prisma/PrismaService.js';
import { PrismaUserRepository } from '../infrastructure/database/prisma/PrismaUserRepository.js';
import { PrismaTaskRepository } from '../infrastructure/database/prisma/PrismaTaskRepository.js';
import { UnitOfWork } from '../infrastructure/database/prisma/UnitOfWork.js';

// Domain Layer - Repository Interfaces
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { ITaskRepository } from '../domain/repositories/ITaskRepository.js';

// Application Layer - Command Handlers
import { CommandBus } from '../application/commands/CommandBus.js';
import { CreateUserHandler } from '../application/commands/users/CreateUserHandler.js';
import { UpdateUserHandler } from '../application/commands/users/UpdateUserHandler.js';
import { DeactivateUserHandler } from '../application/commands/users/DeactivateUserHandler.js';
import { CreateTaskHandler } from '../application/commands/tasks/CreateTaskHandler.js';
import { UpdateTaskHandler } from '../application/commands/tasks/UpdateTaskHandler.js';
import { CompleteTaskHandler } from '../application/commands/tasks/CompleteTaskHandler.js';
import { DeleteTaskHandler } from '../application/commands/tasks/DeleteTaskHandler.js';
import { AssignTaskHandler } from '../application/commands/tasks/AssignTaskHandler.js';

// Application Layer - Query Handlers
import { QueryBus } from '../application/queries/QueryBus.js';
import { GetUserByIdHandler } from '../application/queries/users/GetUserByIdHandler.js';
import { GetAllUsersHandler } from '../application/queries/users/GetAllUsersHandler.js';
import { GetAllTasksHandler } from '../application/queries/tasks/GetAllTasksHandler.js';
import { GetTaskByIdHandler } from '../application/queries/tasks/GetTaskByIdHandler.js';
import { GetDashboardStatsHandler } from '../application/queries/dashboard/GetDashboardStatsHandler.js';

// Application Layer - Domain Services
import { PasswordHashingService } from '../application/services/PasswordHashingService.js';
import { AuthenticationService } from '../application/services/AuthenticationService.js';
import { TaskAssignmentService } from '../application/services/TaskAssignmentService.js';
import { DashboardMetricsService } from '../application/services/DashboardMetricsService.js';
import type { IPasswordHasher } from '../application/interfaces/IPasswordHasher.js';

// Application Layer - Event System
import { EventBus } from '../application/events/EventBus.js';
import { TaskCreatedEventHandler } from '../application/events/handlers/TaskCreatedEventHandler.js';
import { TaskAssignedEventHandler } from '../application/events/handlers/TaskAssignedEventHandler.js';
import { UserRegisteredEventHandler } from '../application/events/handlers/UserRegisteredEventHandler.js';

// Presentation Layer - Controllers
import { AuthController } from '../presentation/controllers/auth.controller.js';
import { DashboardController } from '../presentation/controllers/dashboard.controller.js';
import { TaskController } from '../presentation/controllers/task.controller.js';
import { UserController } from '../presentation/controllers/user.controller.js';
import { AdminController } from '../presentation/controllers/admin.controller.js';

/**
 * Register Infrastructure Services
 */

// Singleton PrismaService (shared across entire application)
container.registerSingleton(PrismaService);

// Unit of Work (transaction coordinator)
container.registerSingleton(UnitOfWork);

/**
 * Register Repositories
 *
 * Bind domain interfaces to concrete implementations.
 * This allows domain layer to remain independent of infrastructure.
 */

// User Repository
container.register<IUserRepository>('IUserRepository', {
  useClass: PrismaUserRepository,
});

// Task Repository
container.register<ITaskRepository>('ITaskRepository', {
  useClass: PrismaTaskRepository,
});

/**
 * Register Application Layer - Command Bus & Handlers
 */

// Command Bus (singleton)
container.registerSingleton(CommandBus);

// User Command Handlers
container.register('CreateUserCommandHandler', { useClass: CreateUserHandler });
container.register('UpdateUserCommandHandler', { useClass: UpdateUserHandler });
container.register('DeactivateUserCommandHandler', { useClass: DeactivateUserHandler });

// Task Command Handlers
container.register('CreateTaskCommandHandler', { useClass: CreateTaskHandler });
container.register('UpdateTaskCommandHandler', { useClass: UpdateTaskHandler });
container.register('AssignTaskCommandHandler', { useClass: AssignTaskHandler });
container.register('CompleteTaskCommandHandler', { useClass: CompleteTaskHandler });
container.register('DeleteTaskCommandHandler', { useClass: DeleteTaskHandler });

/**
 * Register Application Layer - Query Bus & Handlers
 */

// Query Bus (singleton)
container.registerSingleton(QueryBus);

// User Query Handlers
container.register('GetUserByIdQueryHandler', { useClass: GetUserByIdHandler });
container.register('GetAllUsersQueryHandler', { useClass: GetAllUsersHandler });

// Task Query Handlers
container.register('GetAllTasksQueryHandler', { useClass: GetAllTasksHandler });
container.register('GetTaskByIdQueryHandler', { useClass: GetTaskByIdHandler });

// Dashboard Query Handlers
container.register('GetDashboardStatsQueryHandler', { useClass: GetDashboardStatsHandler });

/**
 * Register Application Layer - Domain Services
 */

// Password Hashing Service (interface binding)
container.register<IPasswordHasher>('IPasswordHasher' as never, {
  useClass: PasswordHashingService,
});

// Domain Services (singletons)
container.registerSingleton(AuthenticationService);
container.registerSingleton(TaskAssignmentService);
container.registerSingleton(DashboardMetricsService);

/**
 * Register Event System
 */

// EventBus as singleton (shared event dispatcher)
container.registerSingleton(EventBus);

// Event handlers as singletons
container.registerSingleton(TaskCreatedEventHandler);
container.registerSingleton(TaskAssignedEventHandler);
container.registerSingleton(UserRegisteredEventHandler);

// Register event handlers with EventBus
const eventBus = container.resolve(EventBus);
eventBus.register(container.resolve(TaskCreatedEventHandler));
eventBus.register(container.resolve(TaskAssignedEventHandler));
eventBus.register(container.resolve(UserRegisteredEventHandler));

/**
 * Register Presentation Layer - Controllers
 */

// Controllers as singletons (one instance per application)
container.registerSingleton(AuthController);
container.registerSingleton(DashboardController);
container.registerSingleton(TaskController);
container.registerSingleton(UserController);
container.registerSingleton(AdminController);

/**
 * Helper function to get repository instances
 */
export function getUserRepository(): IUserRepository {
  return container.resolve<IUserRepository>('IUserRepository' as never);
}

export function getTaskRepository(): ITaskRepository {
  return container.resolve<ITaskRepository>('ITaskRepository' as never);
}

/**
 * Lifecycle Hooks
 */

// Graceful shutdown - cleanup Prisma connection
const cleanup = async (): Promise<void> => {
  const prisma = container.resolve(PrismaService);
  await prisma.disconnect();
  console.info('DI Container: Prisma connection closed');
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Export container for manual resolution
export { container };
