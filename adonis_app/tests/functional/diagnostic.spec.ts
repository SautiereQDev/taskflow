import { test } from '@japa/runner'

import { UserFactory } from '#database/factories/user_factory'

const jsonHeaders = {
  accept: 'application/json',
}

test.group('Diagnostics endpoint', () => {
  test('redirects guests to the login page', async ({ client }) => {
    const response = await client.get('/diagnostic').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('rejects non-admin users for JSON requests', async ({ client }) => {
    const member = await UserFactory.apply('member').merge({ locale: 'en' }).create()

    const response = await client
      .get('/diagnostic')
      .header('x-test-user-id', String(member.id))
      .header('accept-language', 'en')
      .headers(jsonHeaders)

    response.assertStatus(403)
    response.assertBodyContains({ message: 'You do not have access to this area.' })
  })

  test('returns JSON diagnostics for admin users', async ({ client, assert }) => {
    const admin = await UserFactory.apply('admin').merge({ locale: 'en' }).create()

    const response = await client
      .get('/diagnostic')
      .header('x-test-user-id', String(admin.id))
      .header('accept-language', 'en')
      .headers(jsonHeaders)

    response.assertStatus(200)

    const payload = response.body() as {
      user: { id: string }
      application: { environment: string }
      health: { checks: unknown[] }
    }

    assert.equal(payload.user.id, admin.id)
    assert.equal(payload.application.environment, 'test')
    assert.isArray(payload.health.checks)
    assert.isAtLeast(payload.health.checks.length, 1)
  })

  test('renders the diagnostics dashboard in HTML for admins', async ({ client }) => {
    const admin = await UserFactory.apply('admin').merge({ locale: 'fr' }).create()

    const response = await client.get('/diagnostic').header('x-test-user-id', String(admin.id))

    response.assertStatus(200)
    response.assertTextIncludes('Centre de diagnostic')
    response.assertTextIncludes('Contrôles de santé')
  })
})
