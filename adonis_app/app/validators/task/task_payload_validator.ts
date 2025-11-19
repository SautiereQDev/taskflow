import vine from '@vinejs/vine'
import type { I18n } from '@adonisjs/i18n'
import { DateTime } from 'luxon'

import { taskPriorities, taskStatuses } from '#types/domain'

const taskPayloadSchema = vine.object({
  title: vine.string().trim().minLength(3).maxLength(180),
  description: vine.string().trim().maxLength(2000).escape().optional(),
  status: vine.enum(taskStatuses).optional(),
  priority: vine.enum(taskPriorities).optional(),
  dueDate: vine
    .date({ formats: ['iso8601', 'YYYY-MM-DD'] })
    .nullable()
    .optional()
    .transform((value) => (value ? DateTime.fromJSDate(value) : null)),
  assigneeId: vine
    .string()
    .regex(/^[a-z0-9]{24}$/i)
    .optional()
    .nullable(),
})

export const taskPayloadValidator = vine.compile(taskPayloadSchema)

export function buildTaskPayloadMessages(i18n: I18n) {
  return {
    'title.required': i18n.formatMessage('tasks.errors.titleRequired'),
    'title.minLength': i18n.formatMessage('tasks.errors.titleMin'),
    'title.maxLength': i18n.formatMessage('tasks.errors.titleMax'),
    'description.maxLength': i18n.formatMessage('tasks.errors.descriptionMax'),
    'status.enum': i18n.formatMessage('tasks.errors.status'),
    'priority.enum': i18n.formatMessage('tasks.errors.priority'),
    'dueDate.date': i18n.formatMessage('tasks.errors.dueDate'),
    'assigneeId.regex': i18n.formatMessage('tasks.errors.assignee'),
  }
}

export type TaskPayloadInput = vine.infer<typeof taskPayloadSchema>
