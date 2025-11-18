import { DateTime } from 'luxon'
import { test } from '@japa/runner'

import TaskService from '#services/task_service'
import { UserFactory } from '#factories/user_factory'
import { TaskFactory } from '#factories/task_factory'

test.group('TaskService.listFor', () => {
  test('returns tasks where the user is creator or assignee', async ({ assert }) => {
    const owner = await UserFactory.create()
    const teammate = await UserFactory.create()

    const createdByOwner = await TaskFactory.merge({
      title: 'Pilotage Q1',
      creatorId: owner.id,
      assigneeId: teammate.id,
      status: 'todo',
      dueDate: DateTime.now().plus({ days: 3 }),
    }).create()

    const assignedToOwner = await TaskFactory.merge({
      title: 'Livrables design',
      creatorId: teammate.id,
      assigneeId: owner.id,
      status: 'in_progress',
      dueDate: DateTime.now().plus({ days: 5 }),
    }).create()

    await TaskFactory.merge({
      title: 'Hors scope',
      creatorId: teammate.id,
      assigneeId: teammate.id,
      status: 'todo',
      dueDate: DateTime.now().plus({ days: 7 }),
    }).create()

    const service = new TaskService()
    const result = await service.listFor(owner)

    assert.equal(result.meta.total, 2)
    const titles = result.tasks.map((task) => task.title)
    assert.includeMembers(titles, [createdByOwner.title, assignedToOwner.title])
    assert.notInclude(titles, 'Hors scope')
  })

  test('applies filters for status, priority, search and dates', async ({ assert }) => {
    const owner = await UserFactory.create()
    const windowStart = DateTime.now().minus({ days: 1 })
    const windowEnd = DateTime.now().plus({ days: 10 })

    const matchingTask = await TaskFactory.merge({
      title: 'Synthèse budget trimestriel',
      creatorId: owner.id,
      assigneeId: owner.id,
      status: 'in_progress',
      priority: 'urgent',
      dueDate: windowStart.plus({ days: 2 }),
      description: 'Inclure les équipes finance.',
    }).create()

    await TaskFactory.merge({
      title: 'Suivi hors scope',
      creatorId: owner.id,
      assigneeId: owner.id,
      status: 'todo',
      priority: 'low',
      dueDate: windowEnd.plus({ days: 3 }),
      description: 'Ne doit pas apparaître dans la recherche.',
    }).create()

    const service = new TaskService()
    const result = await service.listFor(
      owner,
      {
        status: 'in_progress',
        priority: 'urgent',
        search: 'budget',
        dueAfter: windowStart,
        dueBefore: windowEnd,
      },
      { page: 1, perPage: 5 }
    )

    assert.equal(result.meta.total, 1)
    assert.equal(result.tasks.length, 1)
    assert.equal(result.tasks[0].id, matchingTask.id)
  })

  test('paginates results deterministically', async ({ assert }) => {
    const owner = await UserFactory.create()
    const service = new TaskService()

    for (let index = 0; index < 12; index += 1) {
      await TaskFactory.merge({
        title: `Task ${index + 1}`,
        creatorId: owner.id,
        assigneeId: owner.id,
        dueDate: DateTime.now().plus({ days: index }),
      }).create()
    }

    const result = await service.listFor(owner, {}, { page: 2, perPage: 5 })

    assert.equal(result.meta.currentPage, 2)
    assert.equal(result.meta.perPage, 5)
    assert.equal(result.meta.total, 12)
    assert.equal(result.tasks.length, 5)
    assert.equal(result.meta.lastPage, 3)
  })
})
