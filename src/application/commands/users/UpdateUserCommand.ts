import { z } from 'zod';
import type { ICommand } from '../ICommand.js';

/**
 * Update User Command Schema
 *
 * Allows partial updates to user profile.
 * All fields are optional except userId.
 */
export const UpdateUserCommandSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),

  locale: z.enum(['fr', 'en']).optional(),
});

export type UpdateUserCommandInput = z.infer<typeof UpdateUserCommandSchema>;

/**
 * Update User Command
 *
 * Command to update user profile information.
 * Only provided fields will be updated.
 *
 * Note: Email and password have separate commands for security.
 *
 * @example
 * ```typescript
 * const command = new UpdateUserCommand({
 *   userId: 'cuid123',
 *   name: 'Alice Martin-Dupont',
 *   locale: 'en'
 * });
 *
 * const updatedUser = await commandBus.execute(UpdateUserCommand, command);
 * ```
 */
export class UpdateUserCommand implements ICommand {
  public readonly userId: string;
  public readonly name?: string;
  public readonly locale?: string;

  constructor(input: UpdateUserCommandInput) {
    const validated = UpdateUserCommandSchema.parse(input);

    this.userId = validated.userId;
    this.name = validated.name;
    this.locale = validated.locale;
  }
}
