import vine, { SimpleMessagesProvider } from '@vinejs/vine'

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

taskFiltersValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'status.enum': 'Statut non supporté.',
    'priority.enum': 'Priorité non supportée.',
    'search.minLength': 'Merci de préciser au moins 2 caractères pour la recherche.',
    'dueBefore.date': 'Format de date invalide pour la borne avant.',
    'dueAfter.date': 'Format de date invalide pour la borne après.',
  },
  {}
)

export type TaskFiltersInput = vine.infer<typeof taskFiltersValidator>
