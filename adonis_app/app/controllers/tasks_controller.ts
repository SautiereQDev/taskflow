import type { HttpContext } from '@adonisjs/core/http'
// import { inject } from '@adonisjs/core'
import { errors, SimpleMessagesProvider } from '@vinejs/vine'

import TaskService, { TaskAssignmentError, TaskNotFoundError } from '#services/task_service'
import User from '#models/user'
import { buildTaskLabels } from '#view_models/task_labels'
import {
  buildTaskFiltersMessages,
  taskFiltersValidator,
} from '#validators/task/task_filters_validator'
import {
  buildTaskPayloadMessages,
  taskPayloadValidator,
} from '#validators/task/task_payload_validator'

// @inject()
export default class TasksController {
  private readonly taskService: TaskService

  constructor() {
    this.taskService = new TaskService()
  }

  public async index({ auth, request, response, view, session, i18n }: HttpContext) {
    const user = auth.user!
    const filters = await taskFiltersValidator.validate(request.qs(), {
      messagesProvider: new SimpleMessagesProvider(buildTaskFiltersMessages(i18n)),
    })

    const { page = 1, perPage = 10, ...queryFilters } = filters
    const result = await this.taskService.listFor(user, queryFilters, { page, perPage })
    const locale = i18n.locale
    const { statusLabels, priorityLabels } = buildTaskLabels(i18n)

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

    const html = await view.render('pages/tasks/index', {
      filters,
      tasks: result.tasks,
      meta: result.meta,
      statusLabels,
      priorityLabels,
      statusOptions,
      priorityOptions,
      paginationLinks,
      locale,
      title: `${i18n.formatMessage('app.name')} • ${i18n.formatMessage('tasks.titles.list')}`,
      notification: session.flashMessages?.get('notification') || null,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }

  public async create({ auth, view, session, i18n, response, bouncer }: HttpContext) {
    const user = auth.user!
    await bouncer.with('TaskPolicy').authorize('create')
    const flash = session.flashMessages
    const form = flash?.get('form') || { status: 'todo', priority: 'medium' }
    const errorsBag = flash?.get('errors') || {}
    const notification = flash?.get('notification') || null
    const { statusLabels, priorityLabels } = buildTaskLabels(i18n)
    const locale = i18n.locale

    const collaborators = await User.query().select(['id', 'name', 'email']).orderBy('name', 'asc')

    const html = await view.render('pages/tasks/create', {
      form,
      errors: errorsBag,
      statusLabels,
      priorityLabels,
      collaborators,
      locale,
      currentUser: user,
      title: `${i18n.formatMessage('app.name')} • ${i18n.formatMessage('tasks.titles.create')}`,
      notification,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }

  public async show({ params, request, response, view, session, i18n, bouncer, auth }: HttpContext) {
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const { statusLabels, priorityLabels } = buildTaskLabels(i18n)
    const locale = i18n.locale
    const user = auth.user!

    try {
      const task = await this.taskService.findById(params.id, user)
      await bouncer.with('TaskPolicy').authorize('view', task)

      if (wantsJson) {
        return { task: task.serialize() }
      }

      const html = await view.render('pages/tasks/show', {
        task,
        statusLabels,
        priorityLabels,
        locale,
        title: `${i18n.formatMessage('app.name')} • ${task.title}`,
        notification: session.flashMessages?.get('notification') || null,
      })

      return response.header('content-type', 'text/html; charset=utf-8').ok(html)
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        const message = i18n.formatMessage('tasks.notifications.notFound')
        if (wantsJson) {
          return response.status(404).send({ message })
        }

        session.flash('notification', {
          type: 'error',
          message,
        })
        return response.redirect().toRoute('tasks.index')
      }

      throw error
    }
  }

  public async edit({ auth, params, view, session, request, response, i18n, bouncer }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const { statusLabels, priorityLabels } = buildTaskLabels(i18n)
    const locale = i18n.locale

    try {
      const task = await this.taskService.findById(params.id, user)
      await bouncer.with('TaskPolicy').authorize('edit', task)

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

      const html = await view.render('pages/tasks/edit', {
        form,
        errors: errorsBag,
        statusLabels,
        priorityLabels,
        collaborators,
        locale,
        currentUser: user,
        task,
        title: `${i18n.formatMessage('app.name')} • ${i18n.formatMessage('tasks.titles.edit')} – ${task.title}`,
        notification,
      })

      return response.header('content-type', 'text/html; charset=utf-8').ok(html)
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        const message = i18n.formatMessage('tasks.notifications.notFound')
        if (wantsJson) {
          return response.status(404).send({ message })
        }

        session.flash('notification', {
          type: 'error',
          message,
        })
        return response.redirect().toRoute('tasks.index')
      }

      throw error
    }
  }

  public async store({ auth, request, response, session, i18n, bouncer }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const formPayload = this.extractTaskPayload(request)

    try {
      await bouncer.with('TaskPolicy').authorize('create')
      const payload = await taskPayloadValidator.validate(formPayload, {
        messagesProvider: new SimpleMessagesProvider(buildTaskPayloadMessages(i18n)),
      })

      const task = await this.taskService.createFor(user, payload)

      if (wantsJson) {
        return response.created({ task: task.serialize() })
      }

      session.flash('notification', {
        type: 'success',
        message: i18n.formatMessage('tasks.notifications.created'),
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
          i18n,
        })
      ) {
        return
      }

      throw error
    }
  }

  public async update({ auth, request, response, session, params, i18n, bouncer }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const formPayload = this.extractTaskPayload(request)
    const taskId = params.id

    try {
      const payload = await taskPayloadValidator.validate(formPayload, {
        messagesProvider: new SimpleMessagesProvider(buildTaskPayloadMessages(i18n)),
      })
      const task = await this.taskService.findById(taskId, user)
      await bouncer.with('TaskPolicy').authorize('edit', task)
      await this.taskService.update(task, payload, user)

      if (wantsJson) {
        return response.ok({ task: task.serialize() })
      }

      session.flash('notification', {
        type: 'success',
        message: i18n.formatMessage('tasks.notifications.updated'),
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
          i18n,
        })
      ) {
        return
      }

      if (error instanceof TaskNotFoundError) {
        const message = i18n.formatMessage('tasks.notifications.notFound')
        if (wantsJson) {
          return response.status(404).send({ message })
        }

        session.flash('notification', {
          type: 'error',
          message,
        })
        return response.redirect().toRoute('tasks.index')
      }

      throw error
    }
  }

  public async destroy({ auth, response, session, i18n, params, bouncer, request }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

    try {
      const task = await this.taskService.findById(params.id, user)
      await bouncer.with('TaskPolicy').authorize('delete', task)

      await this.taskService.delete(task)

      if (wantsJson) {
        return response.ok({ message: i18n.formatMessage('tasks.notifications.deleted') })
      }

      session.flash('notification', {
        type: 'success',
        message: i18n.formatMessage('tasks.notifications.deleted'),
      })

      return response.redirect().toRoute('tasks.index')
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        const message = i18n.formatMessage('tasks.notifications.notFound')
        if (wantsJson) {
          return response.status(404).send({ message })
        }

        session.flash('notification', {
          type: 'error',
          message,
        })
        return response.redirect().toRoute('tasks.index')
      }
      throw error
    }
  }

  public async toggle({ auth, response, session, i18n, params, bouncer, request }: HttpContext) {
    const user = auth.user!
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

    try {
      const task = await this.taskService.findById(params.id, user)
      await bouncer.with('TaskPolicy').authorize('edit', task)

      await this.taskService.toggleStatus(task)

      if (wantsJson) {
        return response.ok({
          message: i18n.formatMessage('tasks.notifications.updated'),
          task: task.serialize(),
        })
      }

      return response.redirect().back()
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        const message = i18n.formatMessage('tasks.notifications.notFound')
        if (wantsJson) {
          return response.status(404).send({ message })
        }

        session.flash('notification', {
          type: 'error',
          message,
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
    i18n,
  }: {
    error: unknown
    wantsJson: boolean
    response: HttpContext['response']
    session: HttpContext['session']
    formPayload: Record<string, unknown>
    redirectRoute: string
    routeParams?: Record<string, unknown>
    i18n: HttpContext['i18n']
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
        message: i18n.formatMessage('tasks.notifications.validationError'),
      })
      response.redirect().toRoute(redirectRoute, routeParams)
      return true
    }

    if (error instanceof TaskAssignmentError) {
      const message = i18n.formatMessage('tasks.notifications.assignmentError')
      if (wantsJson) {
        response.status(422).send({
          errors: [{ field: error.field, message }],
        })
        return true
      }

      session.flash('errors', { [error.field]: message })
      session.flash('form', formPayload)
      session.flash('notification', {
        type: 'error',
        message,
      })
      response.redirect().toRoute(redirectRoute, routeParams)
      return true
    }

    return false
  }
}
