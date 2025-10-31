import { z } from 'zod';
import type { ICommand } from '../ICommand.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import { TaskPriority } from '../../../domain/value-objects/TaskPriority.js';

/**
 * Update Task Command Schema
 */
export const UpdateTaskCommandSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
});

export type UpdateTaskCommandInput = z.infer<typeof UpdateTaskCommandSchema>;

/**
 * Update Task Command
 */
export class UpdateTaskCommand implements ICommand {
  public readonly taskId: string;
  public readonly title?: string;
  public readonly description?: string | null;
  public readonly status?: TaskStatus;
  public readonly priority?: TaskPriority;
  public readonly dueDate?: Date | null;
  public readonly assigneeId?: string | null;

  constructor(input: UpdateTaskCommandInput) {
    const validated = UpdateTaskCommandSchema.parse(input);
    Object.assign(this, validated);
  }
}
