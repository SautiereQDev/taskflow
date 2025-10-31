import { PrismaClient } from '@prisma/client';
import { injectable } from 'tsyringe';

import { Email } from '@domain/value-objects/Email.js';

import { Password } from '@domain/value-objects/Password.js';/**

 * Prisma Client Singleton

/** *

 * User Mapper * Manages a single instance of PrismaClient throughout the application lifecycle.

 * * Implements best practices for connection pooling and graceful shutdown.

 * Maps between Prisma User model and Domain User entity. *

 * Implements the Adapter pattern for data transformation. * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

 */ */

export class UserMapper {@injectable()

  /**export class PrismaService {

   * Map Prisma User to Domain User entity  private static instance: PrismaClient | null = null;

   *  private static isShuttingDown = false;

   * @param prismaUser - Prisma user model

   * @returns Domain User entity  /**

   */   * Get Prisma Client instance

  static toDomain(prismaUser: PrismaUser): User {   * Creates a new instance if none exists

    const email = Email.create(prismaUser.email);   */

    const password = Password.fromHash(prismaUser.password);  get client(): PrismaClient {

    if (!PrismaService.instance) {

    return User.create({      PrismaService.instance = this.createClient();

      id: prismaUser.id,      this.setupHooks();

      email,    }

      password,    return PrismaService.instance;

      name: prismaUser.name,  }

      role: this.mapRoleToDomain(prismaUser.role),

      isActive: prismaUser.isActive,  /**

      createdAt: prismaUser.createdAt,   * Create new Prisma Client with optimized configuration

      updatedAt: prismaUser.updatedAt,   */

    });  private createClient(): PrismaClient {

  }    return new PrismaClient({

      log:

  /**        process.env.NODE_ENV === 'development'

   * Map Domain User entity to Prisma format          ? [

   *              { emit: 'event', level: 'query' },

   * @param user - Domain User entity              { emit: 'stdout', level: 'error' },

   * @returns Plain object for Prisma operations              { emit: 'stdout', level: 'warn' },

   */            ]

  static toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt' | 'avatar' | 'locale'> {          : [{ emit: 'stdout', level: 'error' }],

    return {      errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',

      id: user.id,    });

      email: user.email.value,  }

      password: user.password.value,

      name: user.name,  /**

      role: this.mapRoleToPrisma(user.role),   * Setup lifecycle hooks for logging and cleanup

      isActive: user.isActive,   */

    };  private setupHooks(): void {

  }    if (!PrismaService.instance) return;



  /**    // Log slow queries in development

   * Map Prisma UserRole to Domain UserRole    if (process.env.NODE_ENV === 'development') {

   */      PrismaService.instance.$on('query' as never, (e: { query: string; duration: number }) => {

  private static mapRoleToDomain(prismaRole: PrismaUserRole): UserRole {        if (e.duration > 1000) {

    const roleMap: Record<PrismaUserRole, UserRole> = {          console.warn(`⚠️  Slow query detected (${e.duration}ms):`, e.query);

      ADMIN: UserRole.ADMIN,        }

      MANAGER: UserRole.MANAGER,      });

      MEMBER: UserRole.MEMBER,    }

    };

    return roleMap[prismaRole];    // Graceful shutdown handlers

  }    const cleanup = async () => {

      if (PrismaService.isShuttingDown) return;

  /**      PrismaService.isShuttingDown = true;

   * Map Domain UserRole to Prisma UserRole

   */      console.info('🔌 Disconnecting from database...');

  private static mapRoleToPrisma(domainRole: UserRole): PrismaUserRole {      await this.disconnect();

    const roleMap: Record<UserRole, PrismaUserRole> = {      process.exit(0);

      [UserRole.ADMIN]: 'ADMIN',    };

      [UserRole.MANAGER]: 'MANAGER',

      [UserRole.MEMBER]: 'MEMBER',    process.on('SIGINT', cleanup);

    };    process.on('SIGTERM', cleanup);

    return roleMap[domainRole];    process.on('beforeExit', cleanup);

  }  }

}

  /**
   * Disconnect from database
   * Should be called before application shutdown
   */
  async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
    }
  }

  /**
   * Test database connection
   * Useful for health checks
   */
  async ping(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute operations in a transaction
   *
   * @example
   * ```typescript
   * await prismaService.transaction(async (tx) => {
   *   await tx.user.create({ data: userData });
   *   await tx.task.create({ data: taskData });
   * });
   * ```
   */
  async transaction<T>(
    fn: (
      tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>
    ) => Promise<T>
  ): Promise<T> {
    return this.client.$transaction(fn);
  }
}
