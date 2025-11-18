import { DateTime } from 'luxon'

import Task from '#models/task'
import type User from '#models/user'
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
}
