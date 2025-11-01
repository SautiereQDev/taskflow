/**
 * Test App Factory
 *
 * Creates an Express application instance configured for testing.
 * Separates app creation from server startup for integration testing.
 */
// CRITICAL: Import DI container FIRST before any DI-registered classes
import '../../../src/config/di-container.js';
import { createApp } from '@config/express.config.js';
import { PrismaClient } from '@prisma/client';
let testApp = null;
let testPrisma = null;
/**
 * Get or create test application instance
 *
 * @returns Express application configured for testing
 */
export function getTestApp() {
  testApp ??= createApp();
  return testApp;
}
/**
 * Get or create test Prisma client
 *
 * @returns PrismaClient for test database
 */
export function getTestPrisma() {
  testPrisma ??= new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  return testPrisma;
}
/**
 * Cleanup test resources
 * Call this in afterAll hooks
 */
export async function cleanupTestApp() {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
  testApp = null;
}
