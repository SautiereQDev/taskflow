import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

import TaskService, { TaskAssignmentError } from '#services/task_service'
import User from '#models/user'
import { priorityLabels, statusLabels } from '#view_models/task_labels'
import { taskFiltersValidator } from '#validators/task/task_filters_validator'
import { taskPayloadValidator } from '#validators/task/task_payload_validator'

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

  public async create({ auth, view, session }: HttpContext) {
    const user = auth.user!
    const flash = session.flashMessages
    const form = flash?.get('form') || { status: 'todo', priority: 'medium' }
    const errorsBag = flash?.get('errors') || {}
    const notification = flash?.get('notification') || null

    const collaborators = await User.query().select(['id', 'name', 'email']).orderBy('name', 'asc')

    const pageContent = await view.render('pages/tasks/create', {
      form,
      errors: errorsBag,
      statusLabels,
      priorityLabels,
      collaborators,
      locale: user.locale || 'fr',
      currentUser: user,
    })

    return view.render('layouts/base', {
      title: 'Taskflow • Nouvelle tâche',
      pageContent,
      notification,
    })
  }

  public async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

    try {
      const payload = await taskPayloadValidator.validate(
        request.only(['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId'])
      )

      const task = await this.taskService.createFor(user, payload)

      if (wantsJson) {
        return response.created({ task: task.serialize() })
      }

      session.flash('notification', {
        type: 'success',
        message: 'Tâche créée avec succès.',
      })
      return response.redirect().toRoute('tasks.index')
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        if (wantsJson) {
          return response.status(422).send({ errors: error.messages })
        }

        session.flash('errors', this.validationErrorsToBag(error))
        session.flash(
          'form',
          request.only(['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId'])
        )
        session.flash('notification', {
          type: 'error',
          message: 'Merci de corriger les erreurs du formulaire.',
        })
        return response.redirect().toRoute('tasks.create')
      }

      if (error instanceof TaskAssignmentError) {
        if (wantsJson) {
          return response.status(422).send({
            errors: [{ field: error.field, message: error.message }],
          })
        }

        session.flash('errors', { [error.field]: error.message })
        session.flash(
          'form',
          request.only(['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId'])
        )
        session.flash('notification', {
          type: 'error',
          message: error.message,
        })
        return response.redirect().toRoute('tasks.create')
      }

      throw error
    }
  }

  private validationErrorsToBag(error: InstanceType<typeof errors.E_VALIDATION_ERROR>) {
    return error.messages.reduce<Record<string, string>>((acc, current) => {
      acc[current.field] = current.message
      return acc
    }, {})
  }
}
