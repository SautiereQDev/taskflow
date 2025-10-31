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
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prismaService.client.user.findUnique({
      where: { email },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Find all users with optional filters
   */
  async findAll(filters?: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
  }): Promise<User[]> {
    const where = filters ? UserQueryBuilder.buildFilters(filters) : {};

    const prismaUsers = await this.prismaService.client.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
    });

    return prismaUsers.map((user) => UserMapper.toDomain(user));
  }

  /**
   * Find active users
   */
  async findActive(): Promise<User[]> {
    const prismaUsers = await this.prismaService.client.user.findMany({
      where: UserQueryBuilder.active(),
      orderBy: { name: 'asc' },
    });

    return prismaUsers.map((user) => UserMapper.toDomain(user));
  }

  /**
   * Save a new user
   */
  async create(user: User): Promise<User> {
    const data = UserMapper.toPrisma(user);

    const createdUser = await this.prismaService.client.user.create({
      data: {
        ...data,
        locale: 'fr', // Default locale
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
  async count(filters?: { role?: UserRole; isActive?: boolean }): Promise<number> {
    const where = filters ? UserQueryBuilder.buildFilters(filters) : {};

    return this.prismaService.client.user.count({ where });
  }
}
