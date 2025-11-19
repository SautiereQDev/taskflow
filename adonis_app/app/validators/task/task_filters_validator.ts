import vine from '@vinejs/vine'
import type { I18n } from '@adonisjs/i18n'

import { taskPriorities, taskStatuses } from '#types/domain'

const taskFiltersSchema = vine.object({
  status: vine.enum(taskStatuses).optional(),
  priority: vine.enum(taskPriorities).optional(),
  search: vine.string().trim().escape().minLength(2).maxLength(120).optional(),
  dueBefore: vine.date({ formats: ['iso8601'] }).optional(),
  dueAfter: vine.date({ formats: ['iso8601'] }).optional(),
  page: vine.number().withoutDecimals().positive().optional(),
  perPage: vine
    .number()
    .withoutDecimals()
    .positive()
    .max(50)
    .optional(),
})

export const taskFiltersValidator = vine.compile(taskFiltersSchema)

export function buildTaskFiltersMessages(i18n: I18n) {
  return {
    'status.enum': i18n.formatMessage('tasks.errors.status'),
    'priority.enum': i18n.formatMessage('tasks.errors.priority'),
    'search.minLength': i18n.formatMessage('tasks.errors.searchLength'),
    'dueBefore.date': i18n.formatMessage('tasks.errors.dueBefore'),
    'dueAfter.date': i18n.formatMessage('tasks.errors.dueAfter'),
  }
}

export type TaskFiltersInput = vine.infer<typeof taskFiltersValidator>
