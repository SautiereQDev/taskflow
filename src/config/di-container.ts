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
container.register('CompleteTaskCommandHandler', { useClass: CompleteTaskHandler });
container.register('DeleteTaskCommandHandler', { useClass: DeleteTaskHandler });

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
