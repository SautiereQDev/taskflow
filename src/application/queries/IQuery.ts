/**
 * Query Marker Interface
 *
 * Marker interface for all queries in the CQRS pattern.
 * Queries represent read operations that retrieve data without modifying state.
 *
 * Characteristics:
 * - Read-only operations
 * - No side effects
 * - Can be cached
 * - Return DTOs optimized for views
 *
 * @example
 * ```typescript
 * class GetUserByIdQuery implements IQuery {
 *   constructor(public readonly userId: string) {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IQuery {}
