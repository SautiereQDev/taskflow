import type { I18n } from '@adonisjs/i18n'

import { taskPriorities, taskStatuses } from '#types/domain'

export function buildTaskLabels(i18n: I18n) {
  const statusLabels = Object.fromEntries(
    taskStatuses.map((status) => [status, i18n.formatMessage(`status.${status}`)])
  ) as Record<(typeof taskStatuses)[number], string>

  const priorityLabels = Object.fromEntries(
    taskPriorities.map((priority) => [priority, i18n.formatMessage(`priority.${priority}`)])
  ) as Record<(typeof taskPriorities)[number], string>

  return { statusLabels, priorityLabels }
}
