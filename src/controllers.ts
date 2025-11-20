import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from './db.js';
import { passwordUtils, renderOrPartial, htmxRedirect, logger } from './utils.js';
import { IAuthenticatedRequest, UserRole, TaskStatus, TaskPriority } from './types.js';

const normalizeQueryValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

export const AuthController = {
  loginPage: (req: Request, res: Response) => {
    renderOrPartial(req, res, 'pages/auth/login', 'pages/auth/login', { title: 'Connexion' });
  },

  login: async (req: IAuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await passwordUtils.compare(password, user.password))) {
      return renderOrPartial(req, res, 'pages/auth/login', 'pages/auth/login', {
        title: 'Connexion',
        formData: { email },
        errors: { general: 'Invalid credentials' },
      });
    }

    req.session.userId = user.id;
    req.session.locale = user.locale;

    if (req.isHtmx) htmxRedirect(res, '/dashboard');
    else res.redirect('/dashboard');
  },

  registerPage: (req: Request, res: Response) => {
    renderOrPartial(req, res, 'pages/auth/register', 'pages/auth/register', {
      title: 'Inscription',
    });
  },

  register: async (req: IAuthenticatedRequest, res: Response) => {
    const { name, email, password } = req.body;
    const hashedPassword = await passwordUtils.hash(password);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.MEMBER,
          locale: req.i18n?.language ?? 'fr',
        },
      });

      req.session.userId = user.id;
      if (req.isHtmx) htmxRedirect(res, '/dashboard');
      else res.redirect('/dashboard');
    } catch (error) {
      logger.error('Registration failed', error);
      renderOrPartial(req, res, 'pages/auth/register', 'pages/auth/register', {
        title: 'Inscription',
        formData: { name, email },
        errors: { general: 'Email already exists' },
      });
    }
  },

  logout: (req: IAuthenticatedRequest, res: Response) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      if (req.isHtmx) htmxRedirect(res, '/auth/login');
      else res.redirect('/auth/login');
    });
  },
};

export const TaskController = {
  list: async (req: IAuthenticatedRequest, res: Response) => {
    const query = req.query as Record<string, unknown>;
    const pageParam = normalizeQueryValue(query.page);
    const parsedPage = pageParam ? Number(pageParam) : Number.NaN;
    const page = Number.isNaN(parsedPage) || parsedPage <= 0 ? 1 : parsedPage;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};
    const statusParam = normalizeQueryValue(query.status);
    const priorityParam = normalizeQueryValue(query.priority);
    const assigneeParam = normalizeQueryValue(query.assigneeId);
    const searchParam = normalizeQueryValue(query.search);

    if (statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)) {
      where.status = statusParam as TaskStatus;
    }
    if (priorityParam && Object.values(TaskPriority).includes(priorityParam as TaskPriority)) {
      where.priority = priorityParam as TaskPriority;
    }
    if (assigneeParam) where.assigneeId = assigneeParam;
    if (searchParam) {
      where.OR = [
        { title: { contains: searchParam, mode: 'insensitive' } },
        { description: { contains: searchParam, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: { assignee: true, creator: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    const users = await prisma.user.findMany();

    renderOrPartial(req, res, 'pages/tasks/list', 'pages/tasks/list', {
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      filters: req.query,
      users,
      user: req.user,
      title: 'Tâches',
    });
  },

  detail: async (req: IAuthenticatedRequest, res: Response) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { assignee: true, creator: true },
    });

    if (!task) return res.status(404).render('pages/404');

    renderOrPartial(req, res, 'pages/tasks/detail', 'pages/tasks/detail', {
      task,
      user: req.user,
      title: task.title,
    });
  },

  createPage: async (req: IAuthenticatedRequest, res: Response) => {
    const users = await prisma.user.findMany();
    renderOrPartial(req, res, 'pages/tasks/form', 'pages/tasks/form', {
      user: req.user,
      task: null,
      users,
      mode: 'create',
      title: 'Nouvelle tâche',
    });
  },

  create: async (req: IAuthenticatedRequest, res: Response) => {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status ?? TaskStatus.TODO,
        priority: priority ?? TaskPriority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId ?? null,
        creatorId: req.user!.id,
      },
    });

    if (req.isHtmx) htmxRedirect(res, `/tasks/${task.id}`);
    else res.redirect(`/tasks/${task.id}`);
  },

  updatePage: async (req: IAuthenticatedRequest, res: Response) => {
    const [task, users] = await Promise.all([
      prisma.task.findUnique({ where: { id: req.params.id } }),
      prisma.user.findMany(),
    ]);

    if (!task) return res.status(404).render('pages/404');

    renderOrPartial(req, res, 'pages/tasks/form', 'pages/tasks/form', {
      task,
      users,
      user: req.user,
      mode: 'edit',
      title: 'Modifier',
    });
  },

  update: async (req: IAuthenticatedRequest, res: Response) => {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId ?? null,
      },
    });

    if (req.isHtmx) htmxRedirect(res, `/tasks/${req.params.id}`);
    else res.redirect(`/tasks/${req.params.id}`);
  },

  delete: async (req: IAuthenticatedRequest, res: Response) => {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Forbidden');
    }
    await prisma.task.delete({ where: { id: req.params.id } });
    if (req.isHtmx) htmxRedirect(res, '/tasks');
    else res.redirect('/tasks');
  },
};

export const DashboardController = {
  index: async (req: IAuthenticatedRequest, res: Response) => {
    const [totalTasks, myTasks, completedTasks] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { assigneeId: req.user!.id, status: { not: TaskStatus.DONE } } }),
      prisma.task.count({ where: { status: TaskStatus.DONE } }),
    ]);

    const recentTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { assignee: true },
    });

    renderOrPartial(req, res, 'pages/dashboard', 'pages/dashboard', {
      stats: { totalTasks, myTasks, completedTasks },
      recentTasks,
      user: req.user,
      title: 'Dashboard',
    });
  },
};
