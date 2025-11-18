import { DateTime } from 'luxon'
import { test } from '@japa/runner'

import Task from '#models/task'
import { UserFactory } from '#factories/user_factory'
import { TaskFactory } from '#factories/task_factory'

const jsonHeaders = {
  accept: 'application/json',
}

const htmlHeaders = {
  accept: 'text/html',
}

test.group('Tasks listing', () => {
  test('returns paginated JSON list filtered for the authenticated user', async ({
    client,
    assert,
  }) => {
    const owner = await UserFactory.create()
    const teammate = await UserFactory.create()

    const focusTask = await TaskFactory.merge({
      title: 'Relancer le fournisseur X',
      creatorId: owner.id,
      assigneeId: owner.id,
      status: 'todo',
      priority: 'high',
      dueDate: DateTime.now().plus({ days: 3 }),
    }).create()

    await TaskFactory.merge({
      title: 'Clore le sprint',
      creatorId: owner.id,
      assigneeId: teammate.id,
      status: 'done',
      priority: 'medium',
      dueDate: DateTime.now().plus({ days: 7 }),
    }).create()

    await TaskFactory.merge({
      title: 'Task hors scope',
      creatorId: teammate.id,
      assigneeId: teammate.id,
      status: 'todo',
    }).create()

    const response = await client
      .get('/tasks')
      .qs({ status: 'todo', perPage: 5 })
      .header('x-test-user-id', String(owner.id))
      .headers(jsonHeaders)

    response.assertStatus(200)
    const payload = response.body() as {
      tasks: Array<{ id: string; title: string; status: string }>
      meta: { total: number; perPage: number }
    }

    assert.equal(payload.meta.total, 1)
    assert.equal(payload.meta.perPage, 5)
    assert.lengthOf(payload.tasks, 1)
    assert.equal(payload.tasks[0].id, focusTask.id)
    assert.equal(payload.tasks[0].status, 'todo')
    assert.notInclude(
      payload.tasks.map((task) => task.title),
      'Task hors scope'
    )
  })

  test('renders the HTML view with filters echoed back', async ({ client }) => {
    const user = await UserFactory.create()

    await TaskFactory.merge({
      title: 'Préparer la restitution Q4',
      creatorId: user.id,
      assigneeId: user.id,
      status: 'in_progress',
      priority: 'urgent',
    }).create()

    const response = await client
      .get('/tasks')
      .qs({ search: 'Préparer' })
      .header('x-test-user-id', String(user.id))
      .headers(htmlHeaders)

    response.assertStatus(200)
    response.assertTextIncludes('Mes tâches')
    response.assertTextIncludes('Préparer la restitution Q4')
    response.assertTextIncludes('value="Préparer"')
    response.assertTextIncludes('Total listé')
  })

  test('rejects invalid filters', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .get('/tasks')
      .qs({ status: 'unknown' })
      .header('x-test-user-id', String(user.id))
      .headers(jsonHeaders)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ field: 'status' }],
    })
    response.assertBodyContains({
      errors: [{ message: 'Statut non supporté.' }],
    })
  })
})

test.group('Task creation', () => {
  test('renders the creation form with collaborators list', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const teammate = await UserFactory.merge({ name: 'Teammate' }).create()

    const response = await client.get('/tasks/create').header('x-test-user-id', String(user.id))

    response.assertStatus(200)
    response.assertTextIncludes('Créer une nouvelle tâche')
    response.assertTextIncludes(teammate.name)
    assert.include(response.text(), 'Retour à mes tâches')
  })

  test('creates a task via HTML form submission', async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const teammate = await UserFactory.create()
    const dueDate = DateTime.now().plus({ days: 4 }).toISODate()

    const response = await client
      .post('/tasks')
      .header('x-test-user-id', String(owner.id))
      .redirects(0)
      .form({
        title: 'Suivi intégration',
        description: 'Préciser les dépendances front.',
        priority: 'high',
        status: 'in_progress',
        dueDate,
        assigneeId: teammate.id,
      })

    response.assertStatus(302)
    response.assertHeader('location', '/tasks')

    const task = await Task.query()
      .where('title', 'Suivi intégration')
      .andWhere('creator_id', owner.id)
      .firstOrFail()
    assert.equal(task.creatorId, owner.id)
    assert.equal(task.assigneeId, teammate.id)
    assert.equal(task.priority, 'high')
  })

  test('returns JSON validation errors when payload is invalid', async ({ client }) => {
    const owner = await UserFactory.create()

    const response = await client
      .post('/tasks')
      .header('x-test-user-id', String(owner.id))
      .header('accept', 'application/json')
      .json({
        title: 'Ok',
        dueDate: 'invalid-date',
      })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ field: 'dueDate' }],
    })
  })
})

test.group('Task editing', () => {
  test('renders the edit form with current values', async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const teammate = await UserFactory.merge({ name: 'Coéquipier' }).create()
    const task = await TaskFactory.merge({
      creatorId: owner.id,
      assigneeId: teammate.id,
      title: 'Synthèse hebdo',
      status: 'in_progress',
      priority: 'medium',
      dueDate: DateTime.now().plus({ days: 2 }),
    }).create()

    const response = await client
      .get(`/tasks/${task.id}/edit`)
      .header('x-test-user-id', String(owner.id))

    response.assertStatus(200)
    response.assertTextIncludes('Modifier une tâche')
    response.assertTextIncludes('Synthèse hebdo')
    response.assertTextIncludes(teammate.name)
    assert.include(response.text(), task.dueDate?.toISODate() || '')
  })

  test('updates a task via HTML form submission', async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const teammate = await UserFactory.create()
    const task = await TaskFactory.merge({
      creatorId: owner.id,
      assigneeId: teammate.id,
      status: 'todo',
      priority: 'low',
      dueDate: DateTime.now().plus({ days: 5 }),
    }).create()

    const response = await client
      .put(`/tasks/${task.id}`)
      .header('x-test-user-id', String(owner.id))
      .redirects(0)
      .form({
        title: 'Revue design',
        description: 'Focus sur les bannières mobiles.',
        priority: 'urgent',
        status: 'in_progress',
        dueDate: '',
        assigneeId: '',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/tasks')

    await task.refresh()
    assert.equal(task.title, 'Revue design')
    assert.equal(task.priority, 'urgent')
    assert.equal(task.status, 'in_progress')
    assert.equal(task.assigneeId, owner.id)
    assert.isNull(task.dueDate)
    assert.equal(task.description, 'Focus sur les bannières mobiles.')
  })

  test('updates a task via JSON payload', async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const teammate = await UserFactory.create()
    const task = await TaskFactory.merge({
      creatorId: owner.id,
      assigneeId: owner.id,
      status: 'todo',
    }).create()

    const newDueDate = DateTime.now().plus({ days: 10 }).toISODate()

    const response = await client
      .put(`/tasks/${task.id}`)
      .header('x-test-user-id', String(owner.id))
      .header('accept', 'application/json')
      .json({
        title: 'Point hebdo',
        status: 'done',
        priority: 'high',
        dueDate: newDueDate,
        assigneeId: teammate.id,
      })

    response.assertStatus(200)
    response.assertBodyContains({
      task: { status: 'done', priority: 'high', assigneeId: teammate.id },
    })

    await task.refresh()
    assert.equal(task.status, 'done')
    assert.equal(task.priority, 'high')
    assert.equal(task.assigneeId, teammate.id)
    assert.equal(task.dueDate?.toISODate(), newDueDate)
  })

  test('prevents editing tasks outside the current user scope', async ({ client }) => {
    const owner = await UserFactory.create()
    const intruder = await UserFactory.create()
    const task = await TaskFactory.merge({
      creatorId: owner.id,
      assigneeId: owner.id,
    }).create()

    const response = await client
      .put(`/tasks/${task.id}`)
      .header('x-test-user-id', String(intruder.id))
      .header('accept', 'application/json')
      .json({
        title: 'Tentative',
      })

    response.assertStatus(404)
  })
})
