import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetUserByIdQuery } from './GetUserByIdQuery.js';
import type { IUserDto } from '../../dtos/UserDto.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { AppError } from '../../../utils/errors.util.js';

/**
 * Handler for GetUserByIdQuery
 * Retrieves a single user and maps to DTO (excludes password hash)
 */
@injectable()
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, IUserDto> {
  constructor(
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository
  ) {}

  async handle(query: GetUserByIdQuery): Promise<IUserDto> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Map domain entity to DTO (exclude password hash)
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar ?? undefined,
      locale: user.locale ?? 'fr',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
