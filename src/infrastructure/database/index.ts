/**
 * Infrastructure Layer - Database Access
 *
 * Exports Prisma repositories, mappers, query builders, and services.
 * Central barrel file for dependency injection registration.
 */

// Prisma Client Service (Singleton)
export { PrismaService } from './prisma/PrismaService.js';

// Repositories
export { PrismaUserRepository } from './prisma/PrismaUserRepository.js';
export { PrismaTaskRepository } from './prisma/PrismaTaskRepository.js';

// Unit of Work (Transaction Coordinator)
export { UnitOfWork } from './prisma/UnitOfWork.js';

// Mappers (Domain ↔ Prisma)
export { UserMapper } from './mappers/UserMapper.js';
export { TaskMapper } from './mappers/TaskMapper.js';

// Query Builders (Reusable Filters)
export { UserQueryBuilder } from './query-builders/UserQueryBuilder.js';
export { TaskQueryBuilder } from './query-builders/TaskQueryBuilder.js';
