/**
 * Authentication Test Helpers
 *
 * Utilities for testing authenticated endpoints and session management.
 */
import supertest from 'supertest';
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
    password: 'admin12345',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  user: {
    email: 'user@example.com',
    password: 'user12345',
    name: 'Test User',
    role: UserRole.MEMBER,
  },
  manager: {
    email: 'manager@example.com',
    password: 'manager12345',
    name: 'Manager User',
    role: UserRole.MEMBER,
  },
};
/**
 * Create a test user in the database
 *
 * @param prisma - Prisma client instance
 * @param credentials - User credentials
 * @returns Created user domain entity
 */
export async function createTestUser(prisma, credentials) {
  const passwordHasher = new PasswordHashingService();
  const hashedPassword = await passwordHasher.hash(credentials.password);
  const dbUser = await prisma.user.create({
    data: {
      email: credentials.email,
      name: credentials.name,
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
    role: dbUser.role,
    isActive: dbUser.isActive,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
  });
}
/**
 * Login and get session cookie
 *
 * @param app - Express application
 * @param credentials - Login credentials
 * @returns Session cookie string
 */
export async function loginAndGetCookie(app, credentials) {
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
  return cookies[0];
}
/**
 * Cleanup test users from database
 *
 * @param prisma - Prisma client instance
 */
export async function cleanupTestUsers(prisma) {
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
 * Create a test user in the database (returns Prisma user for integration tests)
 *
 * @param prisma - Prisma client instance
 * @param credentials - User credentials
 * @returns Created Prisma user object
 */
export async function createTestUserForIntegration(prisma, credentials) {
  const passwordHasher = new PasswordHashingService();
  const hashedPassword = await passwordHasher.hash(credentials.password);

  return await prisma.user.create({
    data: {
      name: credentials.name,
      email: credentials.email,
      password: hashedPassword,
      role: credentials.role,
      isActive: true,
    },
  });
}

/**
 * Clean up test sessions
 *
 * @param prisma - Prisma client instance
 */
export async function cleanupTestSessions(prisma) {
  await prisma.$executeRaw`DELETE FROM session WHERE expire < NOW()`;
}
