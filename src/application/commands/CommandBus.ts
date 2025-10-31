import { injectable, container } from 'tsyringe';
import type { ICommand } from './ICommand.js';
import type { ICommandHandler } from './ICommandHandler.js';

/**
 * Command Bus
 *
 * Mediator pattern implementation for dispatching commands to their handlers.
 * Provides centralized command execution with error handling.
 *
 * Features:
 * - Type-safe command dispatch
 * - Automatic handler resolution via DI container
 * - Centralized error handling
 * - Execution logging (future: metrics, tracing)
 *
 * Usage:
 * ```typescript
 * // In DI container:
 * container.register('CreateTaskHandler', { useClass: CreateTaskHandler });
 *
 * // In controller:
 * const task = await commandBus.execute(CreateTaskCommand, new CreateTaskCommand(...));
 * ```
 *
 * Note: Handlers must be registered in DI container with token format: `${CommandName}Handler`
 */
@injectable()
export class CommandBus {
  /**
   * Execute a command through its registered handler
   *
   * @template TCommand - Command type
   * @template TResult - Result type
   * @param CommandType - Command class constructor (for handler resolution)
   * @param command - Command instance to execute
   * @returns Promise resolving to handler result
   * @throws {Error} If handler not found or execution fails
   *
   * @example
   * ```typescript
   * const result = await commandBus.execute(
   *   CreateTaskCommand,
   *   new CreateTaskCommand('Fix bug', 'user-123')
   * );
   * ```
   */
  async execute<TCommand extends ICommand, TResult = void>(
    CommandType: new (...args: never[]) => TCommand,
    command: TCommand
  ): Promise<TResult> {
    const handlerToken = `${CommandType.name}Handler`;

    try {
      // Resolve handler from DI container
      const handler = container.resolve<ICommandHandler<TCommand, TResult>>(handlerToken);

      // Execute command
      const result = await handler.execute(command);

      return result;
    } catch (error) {
      // Log error (future: integrate with logger)
      console.error(`[CommandBus] Error executing ${CommandType.name}:`, error);
      throw error;
    }
  }

  /**
   * Execute multiple commands in sequence
   *
   * Commands are executed one by one. If one fails, the rest are not executed.
   * For transactional batch execution, use UnitOfWork.
   *
   * @param commands - Array of [CommandType, command] tuples
   * @returns Promise resolving to array of results
   * @throws {Error} If any command fails
   *
   * @example
   * ```typescript
   * const [task1, task2] = await commandBus.executeMany([
   *   [CreateTaskCommand, new CreateTaskCommand('Task 1', 'user-1')],
   *   [CreateTaskCommand, new CreateTaskCommand('Task 2', 'user-1')]
   * ]);
   * ```
   */
  async executeMany<TResults extends unknown[]>(
    commands: [new (...args: never[]) => ICommand, ICommand][]
  ): Promise<TResults> {
    const results: unknown[] = [];

    for (const [CommandType, command] of commands) {
      const result = await this.execute(CommandType, command);
      results.push(result);
    }

    return results as TResults;
  }
}
