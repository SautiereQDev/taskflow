/**
 * Authentication Test Helpers

 * *

 * Tests authentication endpoints with supertest: * Utilities for testing authenticated endpoints and session management.

 * - GET/POST /auth/login */

 * - GET/POST /auth/register

 * - POST /auth/logoutimport type { Express } from 'express';

 * - Session managementimport supertest from 'supertest';

 * - Protected routesimport { PrismaClient } from '@prisma/client';

 */import { User, UserRole } from '@domain/entities/User.js';

import { Email } from '@domain/value-objects/Email.js';

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';import { Password } from '@domain/value-objects/Password.js';

import supertest from 'supertest';import { PasswordHashingService } from '@application/services/PasswordHashingService.js';

import { getTestApp, getTestPrisma, cleanupTestApp } from './test-app.factory.js';

import {/**

  TEST_CREDENTIALS, * Test user credentials

  createTestUser, */

  loginAndGetCookie,export const TEST_CREDENTIALS = {

  cleanupTestUsers,  admin: {

  cleanupTestSessions,    email: 'admin@example.com',

} from './auth.helpers.js';    password: 'admin123',

    name: 'Admin User',

describe('AuthController Integration Tests', () => {    role: UserRole.ADMIN,

  const app = getTestApp();  },

  const prisma = getTestPrisma();  user: {

    email: 'user@example.com',

  beforeAll(async () => {    password: 'user123',

    // Ensure database is connected    name: 'Test User',

    await prisma.$connect();    role: UserRole.USER,

  });  },

  manager: {

  afterAll(async () => {    email: 'manager@example.com',

    // Cleanup    password: 'manager123',

    await cleanupTestUsers(prisma);    name: 'Manager User',

    await cleanupTestSessions(prisma);    role: UserRole.MANAGER,

    await cleanupTestApp();  },

  });} as const;



  beforeEach(async () => {/**

    // Clean up before each test * Create a test user in the database

    await cleanupTestUsers(prisma); *

  }); * @param prisma - Prisma client

 * @param credentials - User credentials

  describe('GET /auth/login', () => { * @returns Created user entity

    it('should render login page', async () => { */

      const response = await supertest(app).get('/auth/login').expect(200);export async function createTestUser(

  prisma: PrismaClient,

      expect(response.text).toContain('login');  credentials: (typeof TEST_CREDENTIALS)[keyof typeof TEST_CREDENTIALS]

      expect(response.headers['content-type']).toMatch(/html/);): Promise<User> {

    });  const passwordHasher = new PasswordHashingService();

  const hashedPassword = await passwordHasher.hash(credentials.password);

    it('should not be accessible when already authenticated', async () => {

      // Create test user and login  const dbUser = await prisma.user.create({

      await createTestUser(prisma, TEST_CREDENTIALS.user);    data: {

      const cookie = await loginAndGetCookie(app, {      name: credentials.name,

        email: TEST_CREDENTIALS.user.email,      email: credentials.email,

        password: TEST_CREDENTIALS.user.password,      password: hashedPassword,

      });      role: credentials.role,

      isActive: true,

      // Try to access login page while authenticated    },

      const response = await supertest(app).get('/auth/login').set('Cookie', cookie).expect(302);  });



      // Should redirect to dashboard  return User.create({

      expect(response.headers.location).toBe('/dashboard');    id: dbUser.id,

    });    name: dbUser.name,

  });    email: Email.create(dbUser.email),

    password: Password.fromHash(dbUser.password),

  describe('POST /auth/login', () => {    role: dbUser.role as UserRole,

    beforeEach(async () => {    isActive: dbUser.isActive,

      // Create test user for login tests  });

      await createTestUser(prisma, TEST_CREDENTIALS.user);}

    });

/**

    it('should login with valid credentials', async () => { * Login and get session cookie

      const response = await supertest(app) *

        .post('/auth/login') * @param app - Express application

        .send({ * @param credentials - Login credentials

          email: TEST_CREDENTIALS.user.email, * @returns Session cookie string

          password: TEST_CREDENTIALS.user.password, */

        })export async function loginAndGetCookie(

        .expect(302);  app: Express,

  credentials: { email: string; password: string }

      // Should redirect to dashboard): Promise<string> {

      expect(response.headers.location).toBe('/dashboard');  const response = await supertest(app)

    .post('/auth/login')

      // Should set session cookie    .send({

      const cookies = response.headers['set-cookie'];      email: credentials.email,

      expect(cookies).toBeDefined();      password: credentials.password,

      expect(Array.isArray(cookies)).toBe(true);    })

      if (Array.isArray(cookies)) {    .expect(302); // Redirect after login

        expect(cookies.some((cookie) => cookie.includes('taskflow.sid'))).toBe(true);

      }  const cookies = response.headers['set-cookie'];

    });  if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {

    throw new Error('No session cookie returned from login');

    it('should reject invalid email', async () => {  }

      const response = await supertest(app)

        .post('/auth/login')  // Return the session cookie

        .send({  return cookies[0] as string;

          email: 'nonexistent@example.com',}

          password: 'wrongpassword',

        })/**

        .expect(401); * Create an authenticated supertest agent

 *

      expect(response.body.error).toBeDefined(); * @param app - Express application

      expect(response.body.error).toContain('Invalid email or password'); * @param credentials - Login credentials

    }); * @returns Authenticated supertest agent

 */

    it('should reject invalid password', async () => {export async function createAuthenticatedAgent(

      const response = await supertest(app)  app: Express,

        .post('/auth/login')  credentials: { email: string; password: string }

        .send({) {

          email: TEST_CREDENTIALS.user.email,  const agent = supertest.agent(app);

          password: 'wrongpassword',

        })  await agent.post('/auth/login').send({

        .expect(401);    email: credentials.email,

    password: credentials.password,

      expect(response.body.error).toBeDefined();  });

      expect(response.body.error).toContain('Invalid email or password');

    });  return agent;

}

    it('should reject inactive user', async () => {

      // Deactivate user/**

      await prisma.user.update({ * Clean up test users from database

        where: { email: TEST_CREDENTIALS.user.email }, *

        data: { isActive: false }, * @param prisma - Prisma client

      }); */

export async function cleanupTestUsers(prisma: PrismaClient): Promise<void> {

      const response = await supertest(app)  await prisma.user.deleteMany({

        .post('/auth/login')    where: {

        .send({      email: {

          email: TEST_CREDENTIALS.user.email,        in: [

          password: TEST_CREDENTIALS.user.password,          TEST_CREDENTIALS.admin.email,

        })          TEST_CREDENTIALS.user.email,

        .expect(403);          TEST_CREDENTIALS.manager.email,

        ],

      expect(response.body.error).toBeDefined();      },

      expect(response.body.error).toContain('deactivated');    },

    });  });

}

    it('should validate email format', async () => {

      const response = await supertest(app)/**

        .post('/auth/login') * Clean up test sessions

        .send({ *

          email: 'invalid-email', * @param prisma - Prisma client

          password: 'password123', */

        })export async function cleanupTestSessions(prisma: PrismaClient): Promise<void> {

        .expect(400);  // PostgreSQL session table cleanup

  await prisma.$executeRaw`DELETE FROM session WHERE expire < NOW()`;

      expect(response.body.errors).toBeDefined();}

    });

    it('should require password', async () => {
      const response = await supertest(app)
        .post('/auth/login')
        .send({
          email: TEST_CREDENTIALS.user.email,
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /auth/register', () => {
    it('should render registration page', async () => {
      const response = await supertest(app).get('/auth/register').expect(200);

      expect(response.text).toContain('register');
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should not be accessible when already authenticated', async () => {
      // Create test user and login
      await createTestUser(prisma, TEST_CREDENTIALS.user);
      const cookie = await loginAndGetCookie(app, {
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      });

      // Try to access register page while authenticated
      const response = await supertest(app).get('/auth/register').set('Cookie', cookie).expect(302);

      // Should redirect to dashboard
      expect(response.headers.location).toBe('/dashboard');
    });
  });

  describe('POST /auth/register', () => {
    it('should register new user with valid data', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'securepassword123',
          passwordConfirm: 'securepassword123',
        })
        .expect(302);

      // Should redirect to dashboard
      expect(response.headers.location).toBe('/dashboard');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe('New User');
      expect(user?.isActive).toBe(true);
    });

    it('should reject duplicate email', async () => {
      // Create existing user
      await createTestUser(prisma, TEST_CREDENTIALS.user);

      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Duplicate User',
          email: TEST_CREDENTIALS.user.email,
          password: 'password123',
          passwordConfirm: 'password123',
        })
        .expect(409);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('already exists');
    });

    it('should reject mismatched passwords', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          passwordConfirm: 'differentpassword',
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContain('Passwords do not match');
    });

    it('should validate email format', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          passwordConfirm: 'password123',
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should require minimum password length', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
          passwordConfirm: '123',
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should require name', async () => {
      const response = await supertest(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          passwordConfirm: 'password123',
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      // Create test user
      await createTestUser(prisma, TEST_CREDENTIALS.user);
    });

    it('should logout authenticated user', async () => {
      // Login first
      const cookie = await loginAndGetCookie(app, {
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      });

      // Logout
      const response = await supertest(app)
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(302);

      // Should redirect to login
      expect(response.headers.location).toBe('/auth/login');

      // Session cookie should be cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      if (Array.isArray(cookies)) {
        expect(cookies.some((cookie) => cookie.includes('taskflow.sid'))).toBe(true);
      }
    });

    it('should handle logout when not authenticated', async () => {
      const response = await supertest(app).post('/auth/logout').expect(302);

      // Should redirect to login
      expect(response.headers.location).toBe('/auth/login');
    });
  });

  describe('Protected Routes', () => {
    it('should block unauthenticated access to /dashboard', async () => {
      const response = await supertest(app).get('/dashboard').expect(302);

      // Should redirect to login
      expect(response.headers.location).toBe('/auth/login');
    });

    it('should allow authenticated access to /dashboard', async () => {
      // Create test user and login
      await createTestUser(prisma, TEST_CREDENTIALS.user);
      const cookie = await loginAndGetCookie(app, {
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      });

      const response = await supertest(app).get('/dashboard').set('Cookie', cookie).expect(200);

      expect(response.text).toContain('dashboard');
    });

    it('should block unauthenticated access to /tasks', async () => {
      const response = await supertest(app).get('/tasks').expect(302);

      // Should redirect to login
      expect(response.headers.location).toBe('/auth/login');
    });

    it('should allow authenticated access to /tasks', async () => {
      // Create test user and login
      await createTestUser(prisma, TEST_CREDENTIALS.user);
      const cookie = await loginAndGetCookie(app, {
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      });

      const response = await supertest(app).get('/tasks').set('Cookie', cookie).expect(200);

      expect(response.text).toContain('task');
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      // Create test user
      await createTestUser(prisma, TEST_CREDENTIALS.user);
    });

    it('should persist session across requests', async () => {
      // Login
      const cookie = await loginAndGetCookie(app, {
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      });

      // Make multiple requests with same cookie
      const response1 = await supertest(app).get('/dashboard').set('Cookie', cookie).expect(200);

      const response2 = await supertest(app).get('/tasks').set('Cookie', cookie).expect(200);

      // Both should succeed
      expect(response1.text).toContain('dashboard');
      expect(response2.text).toContain('task');
    });

    it('should invalidate session on logout', async () => {
      // Login
      const cookie = await loginAndGetCookie(app, {
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      });

      // Verify authenticated
      await supertest(app).get('/dashboard').set('Cookie', cookie).expect(200);

      // Logout
      await supertest(app).post('/auth/logout').set('Cookie', cookie).expect(302);

      // Try to access protected route with old cookie
      const response = await supertest(app).get('/dashboard').set('Cookie', cookie).expect(302);

      // Should redirect to login
      expect(response.headers.location).toBe('/auth/login');
    });
  });
});
