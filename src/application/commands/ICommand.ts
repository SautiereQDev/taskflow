/**
 * Command Interface
 *
 * Marker interface for all commands in the application.
 * Commands represent write operations that change system state.
 *
 * CQRS Pattern:
 * - Commands are DTOs with no behavior
 * - Immutable after creation
 * - Should be named in imperative tense (CreateTask, UpdateUser)
 * - Handled by exactly ONE command handler
 *
 * @example
 * ```typescript
 * export class CreateTaskCommand implements ICommand {
 *   constructor(
 *     public readonly title: string,
 *     public readonly description: string,
 *     public readonly creatorId: string
 *   ) {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICommand {
  // Marker interface - no properties required
  // Commands are identified by their class type
}
