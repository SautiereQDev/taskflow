import { injectable, inject } from 'tsyringe';
import { PrismaService } from './PrismaService.js';

/**
 * Unit of Work Pattern
 *
 * Coordinates multiple repository operations within a single transaction.
 * Ensures atomicity, consistency, isolation, and durability (ACID).
 *
 * @example
 * ```typescript
 * await unitOfWork.execute(async (prisma) => {
 *   const user = await prisma.user.create({ data: userData });
 *   await prisma.task.create({ data: { ...taskData, creatorId: user.id } });
 * });
 * ```
 */
@injectable()
export class UnitOfWork {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  /**
   * Execute operations within a transaction
   *
   * All operations succeed together or fail together.
   * Automatic rollback on error.
   *
   * @param work - Transaction callback with Prisma client
   * @returns Result of the transaction
   * @throws {Error} If transaction fails
   *
   * @example
   * ```typescript
   * const result = await unitOfWork.execute(async (prisma) => {
   *   const task = await prisma.task.update({
   *     where: { id: taskId },
   *     data: { status: 'DONE', completedAt: new Date() }
   *   });
   *
   *   await prisma.user.update({
   *     where: { id: task.assigneeId },
   *     data: { tasksCompleted: { increment: 1 } }
   *   });
   *
   *   return task;
   * });
   * ```
   */
  async execute<T>(
    work: (prisma: ReturnType<typeof this.prismaService.client>) => Promise<T>
  ): Promise<T> {
    return this.prismaService.transaction(work);
  }

  /**
   * Execute operations with custom transaction options
   *
   * @param work - Transaction callback
   * @param options - Prisma transaction options (timeout, isolation level)
   * @returns Result of the transaction
   *
   * @example
   * ```typescript
   * await unitOfWork.executeWithOptions(
   *   async (prisma) => {
   *     // Critical financial operation
   *     await prisma.payment.create({ data: paymentData });
   *     await prisma.invoice.update({ where: { id }, data: { paid: true } });
   *   },
   *   {
   *     maxWait: 5000,      // Wait max 5s to start transaction
   *     timeout: 10000,     // Transaction timeout 10s
   *     isolationLevel: 'Serializable' // Highest isolation
   *   }
   * );
   * ```
   */
  async executeWithOptions<T>(
    work: (prisma: ReturnType<typeof this.prismaService.client>) => Promise<T>,
    options: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
    }
  ): Promise<T> {
    return this.prismaService.client.$transaction(work as never, options);
  }

  /**
   * Execute multiple independent operations in parallel
   *
   * Uses Promise.all internally. Not a database transaction.
   * Use `execute()` for transactional operations.
   *
   * @param operations - Array of async operations
   * @returns Array of results
   *
   * @example
   * ```typescript
   * const [user, tasks, stats] = await unitOfWork.batch([
   *   userRepo.findById(userId),
   *   taskRepo.findByAssignee(userId),
   *   statsService.getUserStats(userId)
   * ]);
   * ```
   */
  async batch<T extends readonly unknown[]>(
    operations: [...T]
  ): Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }> {
    return Promise.all(operations);
  }
}
