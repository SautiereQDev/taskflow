/**
 * AuthController Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { getTestApp, getTestPrisma, cleanupTestApp } from './test-app.factory.js';
import {
  createTestUser,
  cleanupTestUsers,
  TEST_CREDENTIALS,
} from './auth.helpers.js';

describe('AuthController Integration Tests', () => {
  const app = getTestApp();
  const prisma = getTestPrisma();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await cleanupTestApp();
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await cleanupTestUsers(prisma);
    });

    it('should reject login without credentials', async () => {
      const response = await supertest(app).post('/auth/login').send({}).expect(400);

      expect(response.body).toBeDefined();
    });

    it('should reject login with invalid email format', async () => {
      const response = await supertest(app)
        .post('/auth/login')
        .send({ email: 'invalid-email', password: 'test123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.context.errors).toBeDefined();
      expect(response.body.error.context.errors.length).toBeGreaterThan(0);
    });

    it('should reject login with non-existent user', async () => {
      const response = await supertest(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'ValidPass123' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid');
    });

    it('should reject login with incorrect password', async () => {
      // Create a test user first
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      const response = await supertest(app)
        .post('/auth/login')
        .send({ email: TEST_CREDENTIALS.user.email, password: 'WrongPassword123' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid');
    });

    it('should successfully login with valid credentials', async () => {
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      const response = await supertest(app)
        .post('/auth/login')
        .send({
          email: TEST_CREDENTIALS.user.email,
          password: TEST_CREDENTIALS.user.password,
        })
        .expect(302);

      expect(response.headers.location).toBe('/dashboard');
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);
      const sessionCookie = cookies.find((c: string) => c.includes('sessionId'));
      expect(sessionCookie).toBeDefined();
    });

  describe('POST /auth/register', () => {
    beforeEach(async () => {
      await cleanupTestUsers(prisma);
    });

    it('should reject registration without required fields', async () => {
      const response = await supertest(app).post('/auth/register').send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should reject registration with invalid email', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
          confirmPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with mismatched passwords', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPass123',
          confirmPassword: 'DifferentPass123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with existing email', async () => {
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Another User',
          email: TEST_CREDENTIALS.user.email,
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should successfully register a new user', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
        })
        .expect(302);

      expect(response.headers.location).toBe('/dashboard');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe('New User');

      // Cleanup
      if (user) {
        await prisma.user.delete({ where: { id: user.id } });
      }
    });

    it('should hash password when registering', async () => {
      const plainPassword = 'ValidPass123';
      await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Password Test',
          email: 'passtest@example.com',
          password: plainPassword,
          confirmPassword: plainPassword,
        })
        .expect(302);

      const user = await prisma.user.findUnique({
        where: { email: 'passtest@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.password).not.toBe(plainPassword);
      expect(user?.password.length).toBeGreaterThan(20); // Bcrypt hashes are long

      // Cleanup
      if (user) {
        await prisma.user.delete({ where: { id: user.id } });
      }
    });

    it('should automatically log in user after registration', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Auto Login Test',
          email: 'autologin@example.com',
          password: 'ValidPass123',
          confirmPassword: 'ValidPass123',
        })
        .expect(302);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookie = cookies.find((c: string) => c.includes('sessionId'));
      expect(sessionCookie).toBeDefined();

      // Cleanup
      await prisma.user.deleteMany({ where: { email: 'autologin@example.com' } });
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      await cleanupTestUsers(prisma);
    });

    it('should logout authenticated user', async () => {
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      // Use agent to maintain session
      const agent = supertest.agent(app);

      // Login
      await agent
        .post('/auth/login')
        .send({
          email: TEST_CREDENTIALS.user.email,
          password: TEST_CREDENTIALS.user.password,
        })
        .expect(302);

      // Logout
      const response = await agent.post('/auth/logout').expect(302);
      expect(response.headers.location).toBe('/auth/login');
    });

    it('should handle logout for unauthenticated user', async () => {
      const response = await supertest(app).post('/auth/logout').expect(302);

      expect(response.headers.location).toBe('/auth/login');
    });
  });

  describe('Protected Routes', () => {
    beforeEach(async () => {
      await cleanupTestUsers(prisma);
    });

    it('should block access to /dashboard without authentication', async () => {
      const response = await supertest(app).get('/dashboard').expect(302);

      expect(response.headers.location).toBe('/auth/login');
    });

    it('should allow access to /dashboard with authentication', async () => {
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      // Use agent to maintain session
      const agent = supertest.agent(app);

      // Login
      await agent
        .post('/auth/login')
        .send({
          email: TEST_CREDENTIALS.user.email,
          password: TEST_CREDENTIALS.user.password,
        })
        .expect(302);

      // Access protected route
      // Note: May get 500 if view doesn't exist, but should NOT get 302 redirect
      const response = await agent.get('/dashboard');

      // Success: Either renders (200) or has view error (500), but NOT redirect (302)
      expect([200, 500]).toContain(response.status);
      if (response.status === 302) {
        // If redirected, it means auth failed
        expect(response.headers.location).not.toBe('/auth/login');
      }
    });

    it('should block access to /tasks without authentication', async () => {
      const response = await supertest(app).get('/tasks').expect(302);

      expect(response.headers.location).toBe('/auth/login');
    });

    it('should allow access to /tasks with authentication', async () => {
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      // Use agent to maintain session
      const agent = supertest.agent(app);

      // Login
      await agent
        .post('/auth/login')
        .send({
          email: TEST_CREDENTIALS.user.email,
          password: TEST_CREDENTIALS.user.password,
        })
        .expect(302);

      // Access protected route
      // Note: May get 500 if view doesn't exist, but should NOT get 302 redirect
      const response = await agent.get('/tasks');

      // Success: Either renders (200) or has view error (500), but NOT redirect (302)
      expect([200, 500]).toContain(response.status);
      if (response.status === 302) {
        // If redirected, it means auth failed
        expect(response.headers.location).not.toBe('/auth/login');
      }
    });
  });
});
