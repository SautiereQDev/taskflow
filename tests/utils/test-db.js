/**
 * Test Database Utilities
 * Manage test database setup, teardown, and cleanup
 */
import { PrismaClient } from '@prisma/client';
let prismaTestInstance = null;
/**
 * Get or create Prisma test client
 */
export function getTestPrismaClient() {
  prismaTestInstance ??= new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ??
          'postgresql://test:test@localhost:5434/taskflow_test?schema=public',
      },
    },
  });
  return prismaTestInstance;
}
/**
 * Clean all tables in test database
 * Use this in beforeEach/afterEach hooks
 */
export async function cleanDatabase() {
  const prisma = getTestPrismaClient();
  // Delete in correct order (respecting foreign keys)
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
/**
 * Disconnect from test database
 * Use this in afterAll hook
 */
export async function disconnectTestDatabase() {
  if (prismaTestInstance) {
    await prismaTestInstance.$disconnect();
    prismaTestInstance = null;
  }
}
/**
 * Seed test database with initial data
 */
export async function seedTestDatabase() {
  const prisma = getTestPrismaClient();
  // Create test users
  await prisma.user.createMany({
    data: [
      {
        id: 'test-admin',
        email: 'admin@test.com',
        name: 'Test Admin',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyLB.dQkqq', // 'password123'
        role: 'ADMIN',
      },
      {
        id: 'test-user',
        email: 'user@test.com',
        name: 'Test User',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyLB.dQkqq', // 'password123'
        role: 'USER',
      },
    ],
  });
}
