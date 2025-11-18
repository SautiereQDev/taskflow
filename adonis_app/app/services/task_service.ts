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

export type TaskCreationInput = {
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

  public async createFor(user: User, payload: TaskCreationInput): Promise<Task> {
    let assigneeId = payload.assigneeId || user.id

    if (payload.assigneeId && payload.assigneeId !== user.id) {
      const assignee = await User.find(payload.assigneeId)
      if (!assignee) {
        throw new TaskAssignmentError('Utilisateur assigné introuvable.', 'assigneeId')
      }
      assigneeId = assignee.id
    }

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
}
