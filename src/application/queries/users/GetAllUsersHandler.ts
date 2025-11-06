import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '../IQueryHandler.js';
import type { GetAllUsersQuery } from './GetAllUsersQuery.js';
import type { IUserSummaryDto } from '../../dtos/UserDto.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';

/**
 * Paginated result for user listings
 */
export interface IPaginatedUsersDto {
  users: IUserSummaryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Handler for GetAllUsersQuery
 * Retrieves paginated user list with optional filtering
 */
@injectable()
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery, IPaginatedUsersDto> {
  constructor(
    @inject('IUserRepository' as never)
    private readonly userRepository: IUserRepository
  ) {}

  async handle(query: GetAllUsersQuery): Promise<IPaginatedUsersDto> {
    // Fetch all users (repository doesn't support pagination params)
    const allUsers = await this.userRepository.findAll();

    // Apply manual pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    // Map to IUserSummaryDto (excludes password hash and sensitive data)
    const userDtos: IUserSummaryDto[] = paginatedUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email.value,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar,
      locale: user.locale,
    }));

    // Calculate pagination metadata
    const total = allUsers.length;
    const totalPages = Math.ceil(total / query.limit);

    return {
      users: userDtos,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }
}
