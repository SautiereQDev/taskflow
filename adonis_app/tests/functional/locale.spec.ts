import { test } from '@japa/runner'

import { UserFactory } from '#factories/user_factory'

const htmlHeaders = {
  accept: 'text/html',
}

const jsonHeaders = {
  accept: 'application/json',
}

test.group('Locale switching', () => {
  test('persists locale selection in the session for guests', async ({ client, assert }) => {
    const response = await client
      .post('/locale')
      .redirects(0)
      .header('referer', '/login')
      .headers(htmlHeaders)
      .form({ locale: 'en' })

    response.assertStatus(302)
    response.assertHeader('location', '/login')

    const cookies = response.header('set-cookie')
    const sessionCookie = (Array.isArray(cookies) ? cookies : [cookies]).find((c) =>
      c.startsWith('taskflow_session=')
    )

    assert.exists(sessionCookie, 'session cookie should be present')

    const followUp = await client
      .get('/login')
      .header('cookie', sessionCookie!.split(';')[0])
      .header('referer', 'http://localhost:3333/login')
      .headers(htmlHeaders)

    followUp.assertStatus(200)
    followUp.assertTextIncludes('Sign in')
  })

  test('updates the authenticated user locale preference', async ({ client, assert }) => {
    const user = await UserFactory.merge({ locale: 'fr' }).create()

    const response = await client
      .post('/locale')
      .headers(jsonHeaders)
      .header('x-test-user-id', String(user.id))
      .json({ locale: 'en' })

    response.assertStatus(200)
    response.assertBodyContains({ locale: 'en' })

    await user.refresh()
    assert.equal(user.locale, 'en')
  })
})
