/**
 * Authentication Test Helpers
 *
 * Utilities for testing authenticated endpoints and session management.
 */

import type { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { User, UserRole } from '@domain/entities/User.js';
import { Email } from '@domain/value-objects/Email.js';
import { Password } from '@domain/value-objects/Password.js';
import supertest from 'supertest';
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
 */
export async function loginAndGetCookie(
  app: Express,
  credentials: { email: string; password: string }
): Promise<string> {
  const response = await supertest(app).post('/auth/login').send(credentials).expect(302);

  const cookies = response.headers['set-cookie'];
  if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
    throw new Error('No session cookie returned from login');
  }

  return cookies[0] as string;
}

/**
 * Create an authenticated supertest agent
 */
export async function createAuthenticatedAgent(
  app: Express,
  credentials: { email: string; password: string }
) {
  const agent = supertest.agent(app);
  await agent.post('/auth/login').send(credentials);
  return agent;
}

/**
 * Clean up test users from database
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
 */
export async function cleanupTestSessions(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRaw`DELETE FROM session WHERE expire < NOW()`;
}
