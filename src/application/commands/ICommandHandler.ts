import type { ICommand } from './ICommand.js';

/**
 * Command Handler Interface
 *
 * Generic interface for command handlers following CQRS pattern.
 * Each handler processes exactly one command type.
 *
 * Responsibilities:
 * - Input validation (simple checks)
 * - Business logic execution
 * - Domain model coordination
 * - Repository orchestration
 * - Event publishing
 *
 * Best Practices:
 * - Keep handlers thin - delegate to domain services
 * - Fail fast with clear error messages
 * - Use transactions for multi-repository operations
 * - Publish domain events after successful execution
 *
 * @template TCommand - The command type this handler processes
 * @template TResult - The result type (usually the created/updated entity or void)
 *
 * @example
 * ```typescript
 * @injectable()
 * export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand, Task> {
 *   constructor(
 *     @inject(PrismaTaskRepository) private taskRepo: PrismaTaskRepository
 *   ) {}
 *
 *   async execute(command: CreateTaskCommand): Promise<Task> {
 *     // Validation
 *     if (!command.title.trim()) {
 *       throw new Error('Title cannot be empty');
 *     }
 *
 *     // Create domain entity
 *     const task = Task.create({
 *       title: command.title,
 *       creatorId: command.creatorId
 *     });
 *
 *     // Persist
 *     return this.taskRepo.create(task);
 *   }
 * }
 * ```
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  /**
   * Execute the command
   *
   * @param command - The command to execute
   * @returns Promise resolving to the result (entity, DTO, or void)
   * @throws {Error} If validation fails or business rules are violated
   */
  execute(command: TCommand): Promise<TResult>;
}
