import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';

import type { UpdateUserCommand } from './UpdateUserCommand.js';

/**import type { User } from '../../../domain/entities/User.js';

 * Deactivate User Command Schemaimport { PrismaUserRepository } from '../../../infrastructure/database/prisma/PrismaUserRepository.js';

 */

export const DeactivateUserCommandSchema = z.object({/**

  userId: z.string().cuid('Invalid user ID format'), * Update User Command Handler

  reason: z.string().optional(), *

}); * Handles user profile updates.

 * Only updates provided fields (partial update).

export type Deactivate UserCommandInput = z.infer<typeof DeactivateUserCommandSchema>; *

 * Business Rules:

/** * - User must exist

 * Deactivate User Command * - Cannot update email or password (separate commands)

 * * - Cannot update role (requires admin privileges - separate command)

 * Soft delete: marks user as inactive instead of deleting. */

 * Preserves audit trail and historical data.@injectable()

 *export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, User> {

 * @example  constructor(

 * ```typescript    @inject(PrismaUserRepository)

 * const command = new DeactivateUserCommand({    private readonly userRepository: PrismaUserRepository

 *   userId: 'cuid123',  ) {}

 *   reason: 'User requested account closure'

 * });  /**

 *   * Execute UpdateUser command

 * await commandBus.execute(DeactivateUserCommand, command);   *

 * ```   * @param command - Validated UpdateUserCommand

 */   * @returns Promise<User> - The updated user entity

export class DeactivateUserCommand implements ICommand {   * @throws {Error} If user not found

  public readonly userId: string;   */

  public readonly reason?: string;  async execute(command: UpdateUserCommand): Promise<User> {

    // Retrieve user

  constructor(input: DeactivateUserCommandInput) {    const user = await this.userRepository.findById(command.userId);

    const validated = DeactivateUserCommandSchema.parse(input);    if (!user) {

      throw new Error(`User with ID ${command.userId} not found`);

    this.userId = validated.userId;    }

    this.reason = validated.reason;

  }    // Update entity (domain method)

}    user.updateProfile({

      name: command.name,
      avatar: command.avatar,
      locale: command.locale,
    });

    // Persist changes
    const updatedUser = await this.userRepository.update(user);

    // Event publishing will be implemented in Phase 2.4

    return updatedUser;
  }
}
