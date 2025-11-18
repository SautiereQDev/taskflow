import type { HttpContext } from '@adonisjs/core/http'

import TaskService from '#services/task_service'
import { priorityLabels, statusLabels } from '#view_models/task_labels'
import { taskFiltersValidator } from '#validators/task/task_filters_validator'

export default class TasksController {
  constructor(private readonly taskService = new TaskService()) {}

  public async index({ auth, request, response, view, session }: HttpContext) {
    const user = auth.user!
    const filters = await taskFiltersValidator.validate(request.qs())

    const { page = 1, perPage = 10, ...queryFilters } = filters
    const result = await this.taskService.listFor(user, queryFilters, { page, perPage })
    const locale = user.locale || 'fr'

    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

    if (wantsJson) {
      return {
        meta: result.meta,
        tasks: result.tasks.map((task) => task.serialize()),
      }
    }

    const statusOptions = Object.entries(statusLabels)
    const priorityOptions = Object.entries(priorityLabels)

    const buildPageQuery = (pageNumber: number) => {
      const params = new URLSearchParams()
      const current = request.qs()

      for (const [key, value] of Object.entries(current)) {
        if (key === 'page') {
          continue
        }

        if (Array.isArray(value)) {
          for (const entry of value) {
            if (entry !== undefined && entry !== null) {
              params.append(key, String(entry))
            }
          }
        } else if (value !== undefined && value !== null) {
          params.set(key, String(value))
        }
      }

      params.set('page', String(pageNumber))
      return params.toString()
    }

    const paginationLinks = {
      prev: result.meta.currentPage > 1 ? buildPageQuery(result.meta.currentPage - 1) : null,
      next:
        result.meta.currentPage < result.meta.lastPage
          ? buildPageQuery(result.meta.currentPage + 1)
          : null,
    }

    const pageContent = await view.render('pages/tasks/index', {
      filters,
      tasks: result.tasks,
      meta: result.meta,
      statusLabels,
      priorityLabels,
      statusOptions,
      priorityOptions,
      paginationLinks,
      locale,
    })

    const html = await view.render('layouts/base', {
      title: 'Taskflow • Mes tâches',
      pageContent,
      notification: session.flashMessages?.get('notification') || null,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }
}
