import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { DateTime } from 'luxon'

import { taskPriorities, taskStatuses } from '#types/domain'

const taskPayloadSchema = vine.object({
  title: vine.string().trim().minLength(3).maxLength(180),
  description: vine.string().trim().maxLength(2000).escape().optional(),
  status: vine.enum(taskStatuses).optional(),
  priority: vine.enum(taskPriorities).optional(),
  dueDate: vine
    .date({ formats: ['iso8601', 'YYYY-MM-DD'] })
    .transform((value) => DateTime.fromJSDate(value))
    .optional(),
  assigneeId: vine
    .string()
    .regex(/^[a-z0-9]{24}$/i)
    .optional(),
})

export const taskPayloadValidator = vine.compile(taskPayloadSchema)

taskPayloadValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'title.required': 'Un titre est obligatoire.',
    'title.minLength': 'Le titre doit contenir au moins 3 caractères.',
    'title.maxLength': 'Le titre est trop long.',
    'description.maxLength': 'La description ne peut pas dépasser 2000 caractères.',
    'status.enum': 'Statut non supporté.',
    'priority.enum': 'Priorité non supportée.',
    'dueDate.date': 'Merci de fournir une date ISO valide.',
    'assigneeId.regex': "L'identifiant de la personne assignée est invalide.",
  },
  {}
)

export type TaskPayloadInput = vine.infer<typeof taskPayloadSchema>
