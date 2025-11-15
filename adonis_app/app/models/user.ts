import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose, cuid } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

import { userRoles, type UserRole } from '#types/domain'
import type Task from '#models/task'

const AuthFinder = withAuthFinder(() => hash.use('argon2'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  public static readonly table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @column()
  declare locale: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Task, {
    foreignKey: 'creatorId',
  })
  declare tasksCreated: HasMany<typeof Task>

  @hasMany(() => Task, {
    foreignKey: 'assigneeId',
  })
  declare tasksAssigned: HasMany<typeof Task>

  @beforeCreate()
  static assignCuid(user: User) {
    if (!user.id) {
      user.id = cuid()
    }
    if (!user.role) {
      user.role = userRoles[userRoles.length - 1]
    }
    if (!user.locale) {
      user.locale = 'fr'
    }
  }

  @beforeSave()
  static normalizeEmail(user: User) {
    user.email = user.email.toLowerCase()
  }
}
