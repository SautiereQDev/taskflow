import { z } from 'zod';
import type { ICommand } from '../ICommand.js';
import { TaskStatus } from '../../../domain/value-objects/TaskStatus.js';
import { TaskPriority } from '../../../domain/value-objects/TaskPriority.js';

/**
 * Create Task Command Schema
 */
export const CreateTaskCommandSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),

  description: z.string().max(2000).trim().optional().nullable(),

  status: z
    .nativeEnum(TaskStatus)
    .optional()
    .default('TODO' as TaskStatus),

  priority: z
    .nativeEnum(TaskPriority)
    .optional()
    .default('MEDIUM' as TaskPriority),

  dueDate: z.coerce.date().optional().nullable(),

  creatorId: z.string().cuid('Invalid creator ID'),

  assigneeId: z.string().cuid('Invalid assignee ID').optional().nullable(),
});

export type CreateTaskCommandInput = z.infer<typeof CreateTaskCommandSchema>;

/**
 * Create Task Command
 */
export class CreateTaskCommand implements ICommand {
  public readonly title: string;
  public readonly description?: string | null;
  public readonly status: TaskStatus;
  public readonly priority: TaskPriority;
  public readonly dueDate?: Date | null;
  public readonly creatorId: string;
  public readonly assigneeId?: string | null;

  constructor(input: CreateTaskCommandInput) {
    const validated = CreateTaskCommandSchema.parse(input);

    this.title = validated.title;
    this.description = validated.description;
    this.status = validated.status;
    this.priority = validated.priority;
    this.dueDate = validated.dueDate;
    this.creatorId = validated.creatorId;
    this.assigneeId = validated.assigneeId;
  }
}
