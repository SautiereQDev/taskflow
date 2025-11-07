import type { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';
import { User, UserRole } from '../../../domain/entities/User.js';
import { Email } from '../../../domain/value-objects/Email.js';
import { Password } from '../../../domain/value-objects/Password.js';

/**
 * User Mapper
 *
 * Maps between Prisma User model and Domain User entity.
 * Implements the Adapter pattern for data transformation.
 */
export class UserMapper {
  /**
   * Map Prisma User to Domain User entity
   *
   * @param prismaUser - Prisma user model
   * @returns Domain User entity
   */
  static toDomain(prismaUser: PrismaUser): User {
    const email = Email.create(prismaUser.email);
    const password = Password.fromHash(prismaUser.password);

    return User.create(
      {
        email,
        password,
        name: prismaUser.name,
        role: this.mapRoleToDomain(prismaUser.role),
        isActive: prismaUser.isActive,
        avatar: prismaUser.avatar,
        locale: prismaUser.locale,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
      },
      prismaUser.id
    );
  }

  /**
   * Map Domain User entity to Prisma format
   *
   * @param user - Domain User entity
   * @returns Plain object for Prisma operations
   */
  static toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: user.id,
      email: user.email.value,
      password: user.password.value,
      name: user.name,
      role: this.mapRoleToPrisma(user.role),
      isActive: user.isActive,
      avatar: user.avatar,
      locale: user.locale ?? 'fr',
    };
  }

  /**
   * Map Domain User entity to a partial Prisma object for updates
   *
   * @param user - Domain User entity
   * @returns Partial object for Prisma update operations
   */
  static toPrismaUpdate(user: Partial<User> & { id: string }): Omit<
    Partial<PrismaUser>,
    'createdAt' | 'updatedAt' | 'id' | 'email' | 'password'
  > & {
    role?: PrismaUserRole;
  } {
    const data: Omit<
      Partial<PrismaUser>,
      'createdAt' | 'updatedAt' | 'id' | 'email' | 'password'
    > & {
      role?: PrismaUserRole;
    } = {};

    if (user.name) data.name = user.name;
    if (user.isActive !== undefined) data.isActive = user.isActive;
    if (user.avatar) data.avatar = user.avatar;
    if (user.locale) data.locale = user.locale;
    if (user.role) data.role = this.mapRoleToPrisma(user.role);

    return data;
  }

  /**
   * Map Prisma UserRole to Domain UserRole
   */
  private static mapRoleToDomain(prismaRole: PrismaUserRole): UserRole {
    const roleMap: Record<PrismaUserRole, UserRole> = {
      ADMIN: UserRole.ADMIN,
      MANAGER: UserRole.MANAGER,
      MEMBER: UserRole.MEMBER,
    };
    return roleMap[prismaRole];
  }

  /**
   * Map Domain UserRole to Prisma UserRole
   */
  private static mapRoleToPrisma(domainRole: UserRole): PrismaUserRole {
    const roleMap: Record<UserRole, PrismaUserRole> = {
      [UserRole.ADMIN]: 'ADMIN',
      [UserRole.MANAGER]: 'MANAGER',
      [UserRole.MEMBER]: 'MEMBER',
    };
    return roleMap[domainRole];
  }
}
