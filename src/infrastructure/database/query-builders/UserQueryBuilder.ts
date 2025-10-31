import type { Prisma, UserRole } from '@prisma/client';

/**
 * User Query Builder
 *
 * Provides reusable Prisma query filters for User operations.
 * Implements the Builder pattern for complex query construction.
 */
export class UserQueryBuilder {
  /**
   * Build where clause for finding users by role
   */
  static byRole(role: UserRole): Prisma.UserWhereInput {
    return { role };
  }

  /**
   * Build where clause for finding active users
   */
  static active(): Prisma.UserWhereInput {
    return { isActive: true };
  }

  /**
   * Build where clause for finding inactive users
   */
  static inactive(): Prisma.UserWhereInput {
    return { isActive: false };
  }

  /**
   * Build where clause for searching users by name or email
   *
   * @param search - Search term
   * @returns Prisma where clause with OR conditions
   */
  static search(search: string): Prisma.UserWhereInput {
    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  /**
   * Build where clause with multiple filters
   *
   * @param filters - Filter options
   * @returns Combined Prisma where clause
   */
  static buildFilters(filters: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
  }): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters.role !== undefined) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Default include for user relations
   */
  static defaultInclude(): Prisma.UserInclude {
    return {
      tasksCreated: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      tasksAssigned: {
        take: 5,
        where: {
          status: {
            in: ['TODO', 'IN_PROGRESS'],
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    };
  }

  /**
   * Select only essential fields (for lists)
   */
  static selectEssential(): Prisma.UserSelect {
    return {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      avatar: true,
      createdAt: true,
    };
  }
}
