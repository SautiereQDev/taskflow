import { z } from 'zod';
import type { ICommand } from '../ICommand.js';

export const CompleteTaskCommandSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
});

export type CompleteTaskCommandInput = z.infer<typeof CompleteTaskCommandSchema>;

/**
 * Complete Task Command
 */
export class CompleteTaskCommand implements ICommand {
  public readonly taskId: string;

  constructor(input: CompleteTaskCommandInput) {
    const validated = CompleteTaskCommandSchema.parse(input);
    this.taskId = validated.taskId;
  }
}
