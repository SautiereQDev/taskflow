import type { IQuery } from './IQuery.js';

/**
 * Query Handler Interface
 *
 * Generic interface for all query handlers in the CQRS pattern.
 * Handlers contain the logic to retrieve and transform data.
 *
 * @template TQuery - The query type this handler processes
 * @template TResult - The return type (typically a DTO)
 *
 * Design Principles:
 * - Single Responsibility: One handler per query
 * - Read-only: Handlers must not modify state
 * - DTO Mapping: Transform domain entities to view-optimized DTOs
 * - Dependency Injection: Use constructor injection for repositories
 *
 * @example
 * ```typescript
 * @injectable()
 * class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, IUserDto> {
 *   constructor(
 *     @inject('IUserRepository')
 *     private readonly userRepo: IUserRepository
 *   ) {}
 *
 *   async handle(query: GetUserByIdQuery): Promise<IUserDto> {
 *     const user = await this.userRepo.findById(query.userId);
 *     if (!user) throw new AppError('User not found', 404);
 *     return mapUserToDto(user);
 *   }
 * }
 * ```
 */
export interface IQueryHandler<TQuery extends IQuery, TResult> {
  /**
   * Handle the query and return the result
   *
   * @param query - The query to process
   * @returns Promise resolving to the query result (DTO)
   * @throws {AppError} When query cannot be fulfilled
   */
  handle(query: TQuery): Promise<TResult>;
}
