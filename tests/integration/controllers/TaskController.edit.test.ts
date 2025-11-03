/**
 * TaskController Edit Page Integration Tests
 *
 * Tests for GET /tasks/:id/edit endpoint
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { getTestApp, getTestPrisma, cleanupTestApp } from './test-app.factory.js';
import { createTestUser, cleanupTestUsers, TEST_CREDENTIALS } from './auth.helpers.js';
import type { User, Task } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { PasswordHashingService } from '@application/services/PasswordHashingService.js';

describe('TaskController - Edit Page Integration Tests', () => {
  const app = getTestApp();
  const prisma = getTestPrisma();

  let testUser: User;
  let testTask: Task;
  let sessionCookie: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await cleanupTestApp();
  });

  beforeEach(async () => {
    // Clean up existing data
    await prisma.task.deleteMany();
    await cleanupTestUsers(prisma);

    // Create test user
    testUser = await createTestUser(prisma, TEST_CREDENTIALS.user);

    // Login to get session cookie
    const loginResponse = await supertest(app)
      .post('/auth/login')
      .send({
        email: TEST_CREDENTIALS.user.email,
        password: TEST_CREDENTIALS.user.password,
      })
      .expect(302);

    const cookies = loginResponse.headers['set-cookie'];
    sessionCookie = cookies.find((c: string) => c.includes('sessionId')) || '';

    // Create test task
    testTask = await prisma.task.create({
      data: {
        title: 'Test Task for Edit',
        description: 'This is a test task to be edited',
        status: 'TODO',
        priority: 'MEDIUM',
        creatorId: testUser.id,
        assigneeId: testUser.id,
        dueDate: new Date('2025-12-31T23:59:00Z'),
      },
    });
  });

  describe('GET /tasks/:id/edit', () => {
    it('should render edit page with pre-filled task data', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check HTML contains task data
      expect(response.text).toContain('Test Task for Edit');
      expect(response.text).toContain('This is a test task to be edited');
      expect(response.text).toContain('value="Test Task for Edit"');
      expect(response.text).toContain(testTask.description);

      // Check status dropdown has correct selection
      expect(response.text).toContain('selected');
      expect(response.text).toMatch(/TODO.*selected|selected.*TODO/);

      // Check priority dropdown
      expect(response.text).toContain('MEDIUM');

      // Check form action points to correct task
      expect(response.text).toContain(`/tasks/${testTask.id}`);
      expect(response.text).toContain('hx-patch');
    });

    it('should format dueDate for datetime-local input', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check datetime-local format (YYYY-MM-DDTHH:mm)
      expect(response.text).toMatch(/2025-12-31T\d{2}:\d{2}/);
      expect(response.text).toContain('type="datetime-local"');
    });

    it('should include users list for assignee dropdown', async () => {
      // Create additional users with properly hashed passwords
      const passwordHasher = new PasswordHashingService();
      const hashedPassword = await passwordHasher.hash('password123');

      const user2 = await prisma.user.create({
        data: {
          email: 'user2@example.com',
          password: hashedPassword,
          name: 'User Two',
          role: UserRole.USER,
          isActive: true,
        },
      });

      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check both users appear in dropdown
      expect(response.text).toContain(testUser.email);
      expect(response.text).toContain(user2.email);
      expect(response.text).toContain('name="assigneeId"');

      // Cleanup
      await prisma.user.delete({ where: { id: user2.id } });
    });

    it('should include Alpine.js character counter initialization', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check Alpine.js x-data attribute
      expect(response.text).toContain('x-data');
      expect(response.text).toContain('isSubmitting');
      expect(response.text).toContain('title:');
      expect(response.text).toContain('description:');

      // Check character counter bindings
      expect(response.text).toContain('x-text');
      expect(response.text).toMatch(/title\.length/);
      expect(response.text).toMatch(/description\.length/);
    });

    it('should include HTMX form submission attributes', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check HTMX attributes
      expect(response.text).toContain(`hx-patch="/tasks/${testTask.id}"`);
      expect(response.text).toContain('hx-target="body"');
      expect(response.text).toContain('hx-swap="outerHTML"');
      expect(response.text).toContain('hx-indicator');
    });

    it('should include delete button with confirmation', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check delete button exists
      expect(response.text).toContain('btn-error');
      expect(response.text).toContain('confirm(');
      expect(response.text).toContain(`DELETE`);
      expect(response.text).toContain(`/tasks/${testTask.id}`);
      expect(response.text).toContain('htmx.ajax');
    });

    it('should include breadcrumb navigation', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check breadcrumb structure
      expect(response.text).toContain('breadcrumbs');
      expect(response.text).toContain('/tasks');
      expect(response.text).toContain(`/tasks/${testTask.id}`);
    });

    it('should handle task with no dueDate', async () => {
      // Create task without dueDate
      const taskNoDueDate = await prisma.task.create({
        data: {
          title: 'Task without due date',
          status: 'TODO',
          priority: 'LOW',
          creatorId: testUser.id,
        },
      });

      const response = await supertest(app)
        .get(`/tasks/${taskNoDueDate.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check empty dueDate field
      expect(response.text).toContain('type="datetime-local"');
      expect(response.text).toContain('name="dueDate"');

      // Cleanup
      await prisma.task.delete({ where: { id: taskNoDueDate.id } });
    });

    it('should handle task with no assignee', async () => {
      // Create unassigned task
      const unassignedTask = await prisma.task.create({
        data: {
          title: 'Unassigned Task',
          status: 'TODO',
          priority: 'HIGH',
          creatorId: testUser.id,
          assigneeId: null,
        },
      });

      const response = await supertest(app)
        .get(`/tasks/${unassignedTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check "No assignee" option is available
      expect(response.text).toMatch(/no.*assignee/i);

      // Cleanup
      await prisma.task.delete({ where: { id: unassignedTask.id } });
    });

    it('should require authentication', async () => {
      const response = await supertest(app).get(`/tasks/${testTask.id}/edit`).expect(302);

      // Should redirect to login
      expect(response.headers.location).toContain('/auth/login');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await supertest(app)
        .get(`/tasks/${fakeId}/edit`)
        .set('Cookie', sessionCookie)
        .expect(404);

      expect(response.text).toMatch(/not found|404/i);
    });

    it('should handle HTMX partial request', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .set('HX-Request', 'true')
        .expect(200);

      // For HTMX requests, might return partial HTML (depends on renderOrPartial logic)
      expect(response.text).toBeDefined();
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('should include i18n translations', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check for i18n elements (keys should be translated)
      expect(response.text).not.toContain('tasks.edit.title');
      expect(response.text).not.toContain('tasks.form.title');

      // Should contain actual translations
      expect(response.text).toMatch(/edit|modifier/i);
      expect(response.text).toMatch(/save|enregistrer/i);
      expect(response.text).toMatch(/cancel|annuler/i);
    });

    it('should include glassmorphism design classes', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check for design system classes
      expect(response.text).toMatch(/glass(-light|-heavy)?/);
      expect(response.text).toContain('tf-');
    });

    it('should include form validation attributes', async () => {
      const response = await supertest(app)
        .get(`/tasks/${testTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check validation attributes
      expect(response.text).toContain('required');
      expect(response.text).toContain('minlength');
      expect(response.text).toContain('maxlength');
      expect(response.text).toMatch(/minlength="3"/);
      expect(response.text).toMatch(/maxlength="200"/);
      expect(response.text).toMatch(/maxlength="2000"/);
    });

    it('should handle special characters in task data', async () => {
      // Create task with special characters
      const specialTask = await prisma.task.create({
        data: {
          title: `Test "quotes" & <tags>`,
          description: `Line 1\nLine 2\nWith 'quotes'`,
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          creatorId: testUser.id,
        },
      });

      const response = await supertest(app)
        .get(`/tasks/${specialTask.id}/edit`)
        .set('Cookie', sessionCookie)
        .expect(200);

      // Check HTML encoding
      expect(response.text).toBeDefined();
      // Should not have unescaped HTML tags
      expect(response.text).not.toContain('<tags>');

      // Cleanup
      await prisma.task.delete({ where: { id: specialTask.id } });
    });
  });
});
