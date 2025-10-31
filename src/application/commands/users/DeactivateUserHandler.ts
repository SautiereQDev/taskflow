import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { DeactivateUserCommand } from './DeactivateUserCommand.js';
import { PrismaUserRepository } from '../../../infrastructure/database/prisma/PrismaUserRepository.js';

/**
 * Deactivate User Command Handler
 *
 * Soft deletes a user by marking as inactive.
 * User data is preserved for audit and historical purposes.
 *
 * Business Rules:
 * - User must exist
 * - Cannot deactivate already inactive user
 * - Admin users require special handling (TODO: admin check)
 */
@injectable()
export class DeactivateUserHandler implements ICommandHandler<DeactivateUserCommand, void> {
  constructor(
    @inject(PrismaUserRepository)
    private readonly userRepository: PrismaUserRepository
  ) {}

  /**
   * Execute DeactivateUser command
   *
   * @param command - Validated DeactivateUserCommand
   * @throws {Error} If user not found
   * @throws {Error} If user already inactive
   */
  async execute(command: DeactivateUserCommand): Promise<void> {
    // Retrieve user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error(`User with ID ${command.userId} not found`);
    }

    // Check if already inactive
    if (!user.isActive) {
      throw new Error(`User with ID ${command.userId} is already inactive`);
    }

    // Deactivate entity (domain method)
    user.deactivate();

    // Persist changes
    await this.userRepository.update(user);

    // Event publishing will be implemented in Phase 2.4
  }
}
