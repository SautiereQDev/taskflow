/**
 * Assign Task Command
 *
 * Command to assign a task to a user.
 * Follows CQRS pattern - separates task assignment from generic updates.
 *
 * Business Rules Enforced:
 * - Task must exist
 * - Assignee must exist and be active
 * - Cannot assign to inactive users
 *
 * @example
 * ```typescript
 * const command = new AssignTaskCommand('task-123', 'user-456');
 * const result = await commandBus.execute(command);
 * ```
 */
export class AssignTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string
  ) {
    if (!taskId?.trim()) {
      throw new Error('Task ID is required');
    }
    if (!assigneeId?.trim()) {
      throw new Error('Assignee ID is required');
    }
  }
}
