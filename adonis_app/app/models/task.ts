import { DateTime } from 'luxon'
import { cuid } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from '#models/user'
import type { TaskPriority, TaskStatus } from '#types/domain'

export default class Task extends BaseModel {
  public static readonly table = 'tasks'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare status: TaskStatus

  @column()
  declare priority: TaskPriority

  @column.dateTime()
  declare dueDate: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare creatorId: string

  @column()
  declare assigneeId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'assigneeId',
  })
  declare assignee: BelongsTo<typeof User>

  @beforeCreate()
  static assignCuid(task: Task) {
    if (!task.id) {
      task.id = cuid()
    }
  }
}
