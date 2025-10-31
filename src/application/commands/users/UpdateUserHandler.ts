import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { UpdateUserCommand } from './UpdateUserCommand.js';
import type { User } from '../../../domain/entities/User.js';
import { PrismaUserRepository } from '../../../infrastructure/database/prisma/PrismaUserRepository.js';

/**
 * Update User Command Handler
 *
 * Handles user profile updates.
 * Only updates provided fields (partial update).
 *
 * Business Rules:
 * - User must exist
 * - Cannot update email or password (separate commands)
 * - Cannot update role (requires admin privileges - separate command)
 */
@injectable()
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, User> {
  constructor(
    @inject(PrismaUserRepository)
    private readonly userRepository: PrismaUserRepository
  ) {}

  /**
   * Execute UpdateUser command
   *
   * @param command - Validated UpdateUserCommand
   * @returns Promise<User> - The updated user entity
   * @throws {Error} If user not found
   */
  async execute(command: UpdateUserCommand): Promise<User> {
    // Retrieve user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error(`User with ID ${command.userId} not found`);
    }

    // Update entity (domain method)
    user.updateProfile({
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
