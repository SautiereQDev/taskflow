import { injectable, inject } from 'tsyringe';
import type { User, UserRole } from '../../../domain/entities/User.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { PrismaService } from './PrismaService.js';
import { UserMapper } from '../mappers/UserMapper.js';
import { UserQueryBuilder } from '../query-builders/UserQueryBuilder.js';

/**
 * Prisma User Repository
 *
 * Implements IUserRepository interface using Prisma ORM.
 * Handles all user persistence operations with the database.
 */
@injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prismaService.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prismaService.client.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Find all users with optional filters
   */
  async findAll(filters?: {
    role?: UserRole;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<User[]> {
    const { skip, take, ...queryFilters } = filters ?? {};
    const where = queryFilters ? UserQueryBuilder.buildFilters(queryFilters) : {};

    const prismaUsers = await this.prismaService.client.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return prismaUsers.map((user) => UserMapper.toDomain(user));
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const prismaUsers = await this.prismaService.client.user.findMany({
      where: UserQueryBuilder.byRole(role as never),
      orderBy: { name: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return prismaUsers.map((user) => UserMapper.toDomain(user));
  }

  /**
   * Save a new user
   */
  async create(user: User): Promise<User> {
    const data = UserMapper.toPrisma(user);

    const createdUser = await this.prismaService.client.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return UserMapper.toDomain(createdUser);
  }

  /**
   * Update an existing user
   */
  async update(user: User): Promise<User> {
    const data = UserMapper.toPrisma(user);

    const updatedUser = await this.prismaService.client.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return UserMapper.toDomain(updatedUser);
  }

  /**
   * Delete a user by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.client.user.delete({
        where: { id },
      });
    } catch (error) {
      // Ignore P2025 error (record not found) - idempotent delete
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return;
      }
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prismaService.client.user.count({
      where: { email },
    });

    return count > 0;
  }

  /**
   * Check if user exists by ID
   */
  async existsById(id: string): Promise<boolean> {
    const count = await this.prismaService.client.user.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Count users with optional filters
   */
  async count(filters?: { role?: UserRole }): Promise<number> {
    const where = filters ? UserQueryBuilder.buildFilters(filters) : {};

    return this.prismaService.client.user.count({ where });
  }
}
