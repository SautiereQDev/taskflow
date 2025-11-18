import { DateTime } from 'luxon'

import Task from '#models/task'
import User from '#models/user'
import type { TaskPriority, TaskStatus } from '#types/domain'

export type TaskFilters = {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  dueBefore?: DateTime
  dueAfter?: DateTime
}

export type TaskListMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export type TaskListResult = {
  tasks: Task[]
  meta: TaskListMeta
}

export type TaskMutationInput = {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: DateTime | null
  assigneeId?: string | null
}

export class TaskAssignmentError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message)
    this.name = 'TaskAssignmentError'
  }
}

export class TaskNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TaskNotFoundError'
  }
}

export default class TaskService {
  public async listFor(
    user: User,
    filters: TaskFilters = {},
    pagination: { page?: number; perPage?: number } = {}
  ): Promise<TaskListResult> {
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1
    const perPage = pagination.perPage && pagination.perPage > 0 ? pagination.perPage : 10

    const query = Task.query()
      .where((builder) => {
        builder.where('creator_id', user.id).orWhere('assignee_id', user.id)
      })
      .preload('assignee')
      .preload('creator')
      .orderBy('due_date', 'asc')
      .orderBy('created_at', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.priority) {
      query.where('priority', filters.priority)
    }

    if (filters.search) {
      query.where((builder) => {
        builder
          .whereILike('title', `%${filters.search}%`)
          .orWhereILike('description', `%${filters.search}%`)
      })
    }

    if (filters.dueBefore) {
      query.where('due_date', '<=', filters.dueBefore.toSQL({ includeOffset: false }))
    }

    if (filters.dueAfter) {
      query.where('due_date', '>=', filters.dueAfter.toSQL({ includeOffset: false }))
    }

    const paginator = await query.paginate(page, perPage)
    const meta = paginator.getMeta()

    return {
      tasks: paginator.all(),
      meta: {
        total: meta.total,
        perPage: meta.perPage,
        currentPage: meta.currentPage,
        lastPage: meta.lastPage,
      },
    }
  }

  public async createFor(user: User, payload: TaskMutationInput): Promise<Task> {
    const assigneeId = await this.resolveAssigneeId(user, payload.assigneeId)

    const task = await Task.create({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? 'todo',
      priority: payload.priority ?? 'medium',
      dueDate: payload.dueDate ?? null,
      creatorId: user.id,
      assigneeId,
    })

    await task.load('assignee')
    await task.load('creator')
    return task
  }

  public async updateFor(user: User, taskId: string, payload: TaskMutationInput): Promise<Task> {
    const task = await this.findVisibleTask(user, taskId)
    const assigneeId = await this.resolveAssigneeId(user, payload.assigneeId, task.assigneeId)

    task.title = payload.title
    if (payload.description !== undefined) {
      task.description = payload.description ?? null
    }
    if (payload.status) {
      task.status = payload.status
    }
    if (payload.priority) {
      task.priority = payload.priority
    }
    if (payload.dueDate !== undefined) {
      task.dueDate = payload.dueDate ?? null
    }
    task.assigneeId = assigneeId

    await task.save()
    await task.load('assignee')
    await task.load('creator')
    return task
  }

  public async findVisibleTask(user: User, taskId: string): Promise<Task> {
    const task = await Task.query()
      .where('id', taskId)
      .where((builder) => {
        builder.where('creator_id', user.id).orWhere('assignee_id', user.id)
      })
      .preload('assignee')
      .preload('creator')
      .first()

    if (!task) {
      throw new TaskNotFoundError('Tâche introuvable ou accès refusé.')
    }

    return task
  }

  private async resolveAssigneeId(
    user: User,
    desiredId: string | null | undefined,
    fallback?: string | null
  ) {
    if (desiredId === undefined) {
      return fallback ?? user.id
    }

    if (desiredId === null) {
      return user.id
    }

    if (desiredId === user.id) {
      return desiredId
    }

    const assignee = await User.find(desiredId)
    if (!assignee) {
      throw new TaskAssignmentError('Utilisateur assigné introuvable.', 'assigneeId')
    }

    return assignee.id
  }
}
