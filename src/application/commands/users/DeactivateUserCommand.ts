import { z } from 'zod';
import type { ICommand } from '../ICommand.js';

/**
 * Deactivate User Command Schema
 */
export const DeactivateUserCommandSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

export type DeactivateUserCommandInput = z.infer<typeof DeactivateUserCommandSchema>;

/**
 * Deactivate User Command
 */
export class DeactivateUserCommand implements ICommand {
  public readonly userId: string;

  constructor(input: DeactivateUserCommandInput) {
    const validated = DeactivateUserCommandSchema.parse(input);
    this.userId = validated.userId;
  }
}
