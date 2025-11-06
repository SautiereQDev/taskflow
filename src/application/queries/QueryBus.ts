import { injectable, container } from 'tsyringe';
import type { IQuery } from './IQuery.js';
import type { IQueryHandler } from './IQueryHandler.js';

/**
 * Query Bus
 *
 * Mediator pattern implementation for dispatching queries to their handlers.
 * Similar to CommandBus but for read operations.
 *
 * Features:
 * - Single query execution
 * - Parallel execution of multiple queries
 * - Automatic handler resolution via DI
 * - Type-safe query/handler mapping
 *
 * Handler Resolution:
 * Handlers are resolved by token: `${QueryClassName}Handler`
 * Example: GetUserByIdQuery → GetUserByIdQueryHandler
 *
 * @example
 * ```typescript
 * // Single query
 * const user = await queryBus.execute(
 *   GetUserByIdQuery,
 *   new GetUserByIdQuery('user-123')
 * );
 *
 * // Parallel queries
 * const [stats, tasks] = await queryBus.executeMany<[IStatsDto, ITaskDto[]]>([
 *   [GetDashboardStatsQuery, new GetDashboardStatsQuery()],
 *   [GetAllTasksQuery, new GetAllTasksQuery({ page: 1, limit: 10 })]
 * ]);
 * ```
 */
@injectable()
export class QueryBus {
  /**
   * Execute a single query
   *
   * @template TResult - The expected result type
   * @param QueryType - The query class constructor
   * @param query - The query instance
   * @returns Promise resolving to the query result
   * @throws {Error} If handler not found or execution fails
   */
  async execute<TResult>(
    QueryType: new (...args: never[]) => IQuery,
    query: IQuery
  ): Promise<TResult> {
    const handlerToken = `${QueryType.name}Handler`;

    try {
      const handler = container.resolve<IQueryHandler<IQuery, TResult>>(handlerToken as never);
      return await handler.handle(query);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot resolve')) {
        throw new Error(
          `Query handler not found for ${QueryType.name}. ` +
            `Expected token: ${handlerToken}. ` +
            `Make sure to register the handler in di-container.ts`
        );
      }
      throw error;
    }
  }

  /**
   * Execute multiple queries in parallel
   *
   * Useful for dashboard views or complex pages that need multiple data sources.
   * Uses Promise.all for concurrent execution.
   *
   * @template TResults - Tuple type of all result types
   * @param queries - Array of [QueryType, query instance] tuples
   * @returns Promise resolving to array of results in same order
   * @throws {Error} If any query fails
   *
   * @example
   * ```typescript
   * const [user, tasks, stats] = await queryBus.executeMany<
   *   [IUserDto, ITaskDto[], IDashboardStatsDto]
   * >([
   *   [GetUserByIdQuery, new GetUserByIdQuery('user-123')],
   *   [GetAllTasksQuery, new GetAllTasksQuery({ page: 1, limit: 10 })],
   *   [GetDashboardStatsQuery, new GetDashboardStatsQuery()]
   * ]);
   * ```
   */
  async executeMany<TResults extends unknown[]>(
    queries: [new (...args: never[]) => IQuery, IQuery][]
  ): Promise<TResults> {
    const promises = queries.map(([QueryType, query]) => this.execute(QueryType, query));
    return (await Promise.all(promises)) as TResults;
  }
}
