/**
 * CreateUserHandler
 *
 * Handles CreateUserCommand by creating a new user entity.
 */

import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '../ICommandHandler.js';
import type { CreateUserCommand } from './CreateUserCommand.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { User, UserRole } from '../../../domain/entities/User.js';
import { Email } from '../../../domain/value-objects/Email.js';
import { Password } from '../../../domain/value-objects/Password.js';
import { PasswordHashingService } from '../../services/PasswordHashingService.js';
import { AppError } from '../../../utils/AppError.js';

@injectable()
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(
    @inject('IUserRepository') private readonly userRepository: IUserRepository,
    @inject(PasswordHashingService) private readonly passwordHasher: PasswordHashingService
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(command.password);

    // Create user entity with generated ID
    const user = User.create({
      name: command.name,
      email: Email.create(command.email),
      password: Password.fromHash(hashedPassword),
      role: command.role ?? UserRole.MEMBER,
      isActive: true,
    });

    // Persist to database
    return await this.userRepository.create(user);
  }
}
