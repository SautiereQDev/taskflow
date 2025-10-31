/**
 * AuthController Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { getTestApp, getTestPrisma, cleanupTestApp } from './test-app.factory.js';

describe('AuthController Integration Tests', () => {
  const app = getTestApp();
  const prisma = getTestPrisma();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await cleanupTestApp();
  });

  describe('GET /auth/login', () => {
    it('should render login page', async () => {
      const response = await supertest(app).get('/auth/login').expect(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });
});
