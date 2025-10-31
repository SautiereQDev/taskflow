import { z } from 'zod';
import type { ICommand } from '../ICommand.js';

export const DeleteTaskCommandSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
});

export type DeleteTaskCommandInput = z.infer<typeof DeleteTaskCommandSchema>;

/**
 * Delete Task Command
 */
export class DeleteTaskCommand implements ICommand {
  public readonly taskId: string;

  constructor(input: DeleteTaskCommandInput) {
    const validated = DeleteTaskCommandSchema.parse(input);
    this.taskId = validated.taskId;
  }
}
