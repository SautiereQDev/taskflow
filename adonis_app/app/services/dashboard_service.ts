import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'

import Task from '#models/task'
import type User from '#models/user'
import { taskStatuses, type TaskStatus } from '#types/domain'

export type DashboardSummary = {
  total: number
  overdue: number
  upcoming: number
  nextDueDate: DateTime | null
  statuses: Array<{ status: TaskStatus; count: number }>
}

export type DashboardSections = {
  assigned: Task[]
  created: Task[]
  overdue: Task[]
  recent: Task[]
}

export type DashboardPayload = {
  summary: DashboardSummary
  sections: DashboardSections
}

@inject()
export default class DashboardService {
  public async buildFor(user: User): Promise<DashboardPayload> {
    const tasks = await Task.query()
      .where((query) => {
        query.where('creator_id', user.id).orWhere('assignee_id', user.id)
      })
      .preload('assignee')
      .preload('creator')
      .orderBy('due_date', 'asc')
      .orderBy('created_at', 'desc')

    const now = DateTime.now()
    const upcomingThreshold = now.plus({ days: 7 })

    const summary: DashboardSummary = {
      total: tasks.length,
      overdue: tasks.filter((task) => this.isOverdue(task, now)).length,
      upcoming: tasks.filter((task) => this.isUpcoming(task, now, upcomingThreshold)).length,
      nextDueDate: this.findNextDueDate(tasks, now),
      statuses: taskStatuses.map((status) => ({
        status,
        count: tasks.filter((task) => task.status === status).length,
      })),
    }

    const sections: DashboardSections = {
      assigned: tasks.filter((task) => task.assigneeId === user.id).slice(0, 5),
      created: tasks.filter((task) => task.creatorId === user.id).slice(0, 5),
      overdue: tasks.filter((task) => this.isOverdue(task, now)).slice(0, 5),
      recent: [...tasks]
        .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
        .slice(0, 5),
    }

    return { summary, sections }
  }

  private isOverdue(task: Task, now: DateTime): boolean {
    if (!task.dueDate) {
      return false
    }

    return task.dueDate < now && task.status !== 'done' && task.status !== 'cancelled'
  }

  private isUpcoming(task: Task, now: DateTime, threshold: DateTime): boolean {
    if (!task.dueDate) {
      return false
    }

    return (
      task.dueDate >= now &&
      task.dueDate <= threshold &&
      task.status !== 'done' &&
      task.status !== 'cancelled'
    )
  }

  private findNextDueDate(tasks: Task[], now: DateTime): DateTime | null {
    const upcoming = tasks
      .filter((task) => task.dueDate && task.dueDate >= now && task.status !== 'done')
      .sort((a, b) => a.dueDate!.toMillis() - b.dueDate!.toMillis())

    return upcoming[0]?.dueDate ?? null
  }
}
