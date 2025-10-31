/**
 * Authentication Test Helpers
 *
 * Utilities for testing authenticated endpoints and session management.
 */

import type { Express } from 'express';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import { PasswordHashingService } from '@application/services/PasswordHashingService.js';

/**
 * Test user credentials
 */
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  user: {
    email: 'user@example.com',
    password: 'user123',
    name: 'Test User',
    role: UserRole.USER,
  },
  manager: {
    email: 'manager@example.com',
    password: 'manager123',
    name: 'Manager User',
    role: UserRole.MANAGER,
  },
} as const;

/**
 * Create a test user in the database
 *
 * @param prisma - Prisma client
 * @param credentials - User credentials
 * @returns Created user entity
 */
export async function createTestUser(
  prisma: PrismaClient,
  credentials: (typeof TEST_CREDENTIALS)[keyof typeof TEST_CREDENTIALS]
): Promise<User> {
  const passwordHasher = new PasswordHashingService();
  const hashedPassword = await passwordHasher.hash(credentials.password);

  const dbUser = await prisma.user.create({
    data: {
      name: credentials.name,
      email: credentials.email,
      password: hashedPassword,
      role: credentials.role,
      isActive: true,
    },
  });

  return User.create({
    id: dbUser.id,
    name: dbUser.name,
    email: Email.create(dbUser.email),
    password: Password.fromHash(dbUser.password),
    role: dbUser.role as UserRole,
    isActive: dbUser.isActive,
  });
}

/**
 * Login and get session cookie
 *
 * @param app - Express application
 * @param credentials - Login credentials
 * @returns Session cookie string
 */
export async function loginAndGetCookie(
  app: Express,
  credentials: { email: string; password: string }
): Promise<string> {
  const response = await supertest(app)
    .post('/auth/login')
    .send({
      email: credentials.email,
      password: credentials.password,
    })
    .expect(302); // Redirect after login

  const cookies = response.headers['set-cookie'];
  if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
    throw new Error('No session cookie returned from login');
  }

  // Return the session cookie
  return cookies[0] as string;
}

/**
 * Create an authenticated supertest agent
 *
 * @param app - Express application
 * @param credentials - Login credentials
 * @returns Authenticated supertest agent
 */
export async function createAuthenticatedAgent(
  app: Express,
  credentials: { email: string; password: string }
) {
  const agent = supertest.agent(app);

  await agent.post('/auth/login').send({
    email: credentials.email,
    password: credentials.password,
  });

  return agent;
}

/**
 * Clean up test users from database
 *
 * @param prisma - Prisma client
 */
export async function cleanupTestUsers(prisma: PrismaClient): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          TEST_CREDENTIALS.admin.email,
          TEST_CREDENTIALS.user.email,
          TEST_CREDENTIALS.manager.email,
        ],
      },
    },
  });
}

/**
 * Clean up test sessions
 *
 * @param prisma - Prisma client
 */
export async function cleanupTestSessions(prisma: PrismaClient): Promise<void> {
  // PostgreSQL session table cleanup
  await prisma.$executeRaw`DELETE FROM session WHERE expire < NOW()`;
}
