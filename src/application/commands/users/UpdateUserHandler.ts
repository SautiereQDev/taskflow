/**
 * UpdateUserHandler
 *
 * Handles UpdateUserCommand for user profile updates.
 */

import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { UpdateUserCommand } from './UpdateUserCommand.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { User } from '../../../domain/entities/User.js';
import { AppError } from '../../../utils/AppError.js';

@injectable()
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, User> {
  constructor(@inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    // Get existing user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update fields
    if (command.name !== undefined) {
      user.updateName(command.name);
    }

    if (command.locale !== undefined) {
      user.updateLocale(command.locale);
    }

    // Save changes
    return await this.userRepository.update(user);
  }
}
