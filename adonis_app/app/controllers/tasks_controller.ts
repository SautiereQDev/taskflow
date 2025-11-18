import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

import TaskService, { TaskAssignmentError, TaskNotFoundError } from '#services/task_service'
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

  public async edit({ auth, params, view, session, request, response }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

    try {
      const task = await this.taskService.findEditableTask(user, params.id)

      if (wantsJson) {
        return { task: task.serialize() }
      }

      const flash = session.flashMessages
      const errorsBag = flash?.get('errors') || {}
      const notification = flash?.get('notification') || null
      const defaultForm = {
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISODate() : '',
        assigneeId: task.assigneeId === user.id ? null : task.assigneeId,
      }
      const flashedForm = flash?.get('form')
      const form = flashedForm ? { ...defaultForm, ...flashedForm } : defaultForm

      const collaborators = await User.query()
        .select(['id', 'name', 'email'])
        .orderBy('name', 'asc')

      const pageContent = await view.render('pages/tasks/edit', {
        form,
        errors: errorsBag,
        statusLabels,
        priorityLabels,
        collaborators,
        locale: user.locale || 'fr',
        currentUser: user,
        task,
      })

      return view.render('layouts/base', {
        title: `Taskflow • Modifier ${task.title}`,
        pageContent,
        notification,
      })
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        if (wantsJson) {
          return response.status(404).send({ message: error.message })
        }

        session.flash('notification', {
          type: 'error',
          message: error.message,
        })
        return response.redirect().toRoute('tasks.index')
      }

      throw error
    }
  }

  public async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const formPayload = this.extractTaskPayload(request)

    try {
      const payload = await taskPayloadValidator.validate(formPayload)

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
      if (
        this.handleMutationFormError({
          error,
          wantsJson,
          response,
          session,
          formPayload,
          redirectRoute: 'tasks.create',
        })
      ) {
        return
      }

      throw error
    }
  }

  public async update({ auth, request, response, session, params }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const formPayload = this.extractTaskPayload(request)
    const taskId = params.id

    try {
      const payload = await taskPayloadValidator.validate(formPayload)
      const task = await this.taskService.updateFor(user, taskId, payload)

      if (wantsJson) {
        return response.ok({ task: task.serialize() })
      }

      session.flash('notification', {
        type: 'success',
        message: 'Tâche mise à jour avec succès.',
      })
      return response.redirect().toRoute('tasks.index')
    } catch (error) {
      if (
        this.handleMutationFormError({
          error,
          wantsJson,
          response,
          session,
          formPayload,
          redirectRoute: 'tasks.edit',
          routeParams: { id: taskId },
        })
      ) {
        return
      }

      if (error instanceof TaskNotFoundError) {
        if (wantsJson) {
          return response.status(404).send({ message: error.message })
        }

        session.flash('notification', {
          type: 'error',
          message: error.message,
        })
        return response.redirect().toRoute('tasks.index')
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

  private extractTaskPayload(request: HttpContext['request']) {
    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'assigneeId',
    ] as const
    const payload: Record<string, unknown> = {}

    for (const field of allowedFields) {
      const value = request.input(field)
      if (value === undefined) {
        continue
      }
      payload[field] = value
    }

    if ('dueDate' in payload) {
      const rawValue = payload.dueDate
      if (
        rawValue === '' ||
        rawValue === null ||
        (typeof rawValue === 'string' && rawValue.trim().length === 0)
      ) {
        payload.dueDate = null
      }
    }

    if ('assigneeId' in payload) {
      const rawValue = payload.assigneeId
      if (rawValue === '' || rawValue === null) {
        payload.assigneeId = null
      } else if (typeof rawValue === 'string') {
        payload.assigneeId = rawValue
      } else if (typeof rawValue === 'number') {
        payload.assigneeId = String(rawValue)
      } else {
        delete payload.assigneeId
      }
    }

    return payload
  }

  private handleMutationFormError({
    error,
    wantsJson,
    response,
    session,
    formPayload,
    redirectRoute,
    routeParams,
  }: {
    error: unknown
    wantsJson: boolean
    response: HttpContext['response']
    session: HttpContext['session']
    formPayload: Record<string, unknown>
    redirectRoute: string
    routeParams?: Record<string, unknown>
  }) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      if (wantsJson) {
        response.status(422).send({ errors: error.messages })
        return true
      }

      session.flash('errors', this.validationErrorsToBag(error))
      session.flash('form', formPayload)
      session.flash('notification', {
        type: 'error',
        message: 'Merci de corriger les erreurs du formulaire.',
      })
      response.redirect().toRoute(redirectRoute, routeParams)
      return true
    }

    if (error instanceof TaskAssignmentError) {
      if (wantsJson) {
        response.status(422).send({
          errors: [{ field: error.field, message: error.message }],
        })
        return true
      }

      session.flash('errors', { [error.field]: error.message })
      session.flash('form', formPayload)
      session.flash('notification', {
        type: 'error',
        message: error.message,
      })
      response.redirect().toRoute(redirectRoute, routeParams)
      return true
    }

    return false
  }
}
