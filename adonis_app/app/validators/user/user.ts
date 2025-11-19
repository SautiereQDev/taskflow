import vine from '@vinejs/vine'
import { userRoles } from '#types/domain'

export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100),
    email: vine.string().trim().email().normalizeEmail().unique(async (db, value) => {
      const user = await db.from('users').where('email', value).first()
      return !user
    }),
    password: vine.string().minLength(8).maxLength(32),
    role: vine.enum(userRoles),
    locale: vine.enum(['fr', 'en']),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100).optional(),
    email: vine.string().trim().email().normalizeEmail().unique(async (db, value, field) => {
      const user = await db.from('users').where('email', value).whereNot('id', field.meta.userId).first()
      return !user
    }).optional(),
    password: vine.string().minLength(8).maxLength(32).optional(),
    role: vine.enum(userRoles).optional(),
    locale: vine.enum(['fr', 'en']).optional(),
  })
)
