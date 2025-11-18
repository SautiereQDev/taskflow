import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'
import { TaskFactory } from '#factories/task_factory'

test.group('Home page', () => {
  test('renders dashboard overview for authenticated users', async ({ client, assert }) => {
    const user = await UserFactory.merge({ locale: 'fr' }).create()
    const teammate = await UserFactory.create()

    await TaskFactory.merge({
      title: 'Préparer le rapport sprint',
      creatorId: user.id,
      assigneeId: user.id,
      status: 'in_progress',
      dueDate: DateTime.now().plus({ days: 2 }),
    }).create()

    await TaskFactory.merge({
      title: 'Kick-off client',
      creatorId: user.id,
      assigneeId: teammate.id,
      status: 'todo',
      dueDate: DateTime.now().plus({ days: 5 }),
    }).create()

    const response = await client
      .get('/')
      .header('x-test-user-id', String(user.id))
      .header('accept', 'application/json')

    response.assertStatus(200)
    const payload = response.body() as { summary: any; sections: any }
    assert.equal(payload.summary.total, 2)
    assert.equal(payload.summary.statuses.find((item) => item.status === 'in_progress')?.count, 1)
    assert.includeMembers(
      payload.sections.assigned.map((task) => task.title),
      ['Préparer le rapport sprint']
    )
    assert.includeMembers(
      payload.sections.created.map((task) => task.title),
      ['Préparer le rapport sprint', 'Kick-off client']
    )
  })

  test('only displays tasks tied to the current user', async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const outsider = await UserFactory.create()

    await TaskFactory.merge({
      title: 'Suivi marketing',
      creatorId: owner.id,
      assigneeId: owner.id,
      status: 'todo',
      dueDate: DateTime.now().minus({ days: 1 }),
    }).create()

    await TaskFactory.merge({
      title: 'Confidentiel HR',
      creatorId: outsider.id,
      assigneeId: outsider.id,
      status: 'todo',
    }).create()

    const response = await client
      .get('/')
      .header('x-test-user-id', String(owner.id))
      .header('accept', 'application/json')

    response.assertStatus(200)
    const payload = response.body() as { sections: { assigned: any[]; created: any[] } }
    assert.include(payload.sections.assigned.map((task) => task.title), 'Suivi marketing')
    assert.notInclude(
      payload.sections.assigned.map((task) => task.title),
      'Confidentiel HR'
    )
  })

  test('serves HTML when no JSON preference is provided', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .get('/')
      .header('x-test-user-id', String(user.id))
      .header('accept', 'text/html')

    response.assertStatus(200)
    const contentType = response.header('content-type') || ''
    assert.include(contentType, 'text/html')
    const body = response.text()
    response.assertTextIncludes('Bonjour')
    assert.notInclude(body, '@layout(')
    assert.notInclude(body, '{{ summary.total }}')
  })
})
