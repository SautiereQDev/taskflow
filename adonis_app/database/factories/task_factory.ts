import { DateTime } from 'luxon'
import factory from '@adonisjs/lucid/factories'

import Task from '#models/task'
import { taskPriorities, taskStatuses } from '#types/domain'

export const TaskFactory = factory
  .define(Task, ({ faker }) => {
    const status = faker.helpers.arrayElement(taskStatuses)
    const priority = faker.helpers.arrayElement(taskPriorities)
    const dueDate =
      faker.helpers.maybe(() => DateTime.fromJSDate(faker.date.soon({ days: 30 }))) ?? null
    const completedAt =
      status === 'done' ? DateTime.fromJSDate(faker.date.recent({ days: 5 })) : null

    return {
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      description: faker.lorem.paragraph(),
      status,
      priority,
      dueDate,
      completedAt,
      creatorId: '',
      assigneeId: null,
    }
  })
  .build()
