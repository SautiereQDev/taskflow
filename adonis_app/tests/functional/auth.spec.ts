import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('Auth flow', () => {
  test('guest can view the login form', async ({ client }) => {
    const response = await client.get('/login')

    response.assertStatus(200)
    response.assertTextIncludes('Connexion')
  })

  test('user can authenticate with valid credentials', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/login')
      .redirects(0)
      .form({
        email: user.email,
        password: 'password',
        // remember: 'on',
      })

    response.assertStatus(302)
    response.assertHeader('location', '/')
    response.assertCookie('taskflow_session')
  })

  test('authenticated user cannot access login form again', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client
      .get('/login')
      .header('x-test-user-id', String(user.id))
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/')
  })

  test('rejects invalid credentials payload with helpful errors', async ({ client, assert }) => {
    const response = await client
      .post('/login')
      .redirects(0)
      .form({
        email: 'not-an-email',
        password: 'short',
      })

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

    followUp.assertStatus(200)
    followUp.assertTextIncludes('Adresse email invalide')
    followUp.assertTextIncludes('Votre mot de passe doit contenir au moins 8 caractères')
    followUp.assertTextIncludes('Certaines informations sont manquantes ou invalides')
  })

  test('applies rate limiting after repeated failed attempts', async ({ client }) => {
    const payload = {
      email: 'bot@example.com',
      password: 'definitely-wrong',
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await client.post('/login').redirects(0).form(payload)
      response.assertStatus(302)
    }

    const throttledResponse = await client.post('/login').redirects(0).form(payload)
    throttledResponse.assertStatus(429)
    throttledResponse.assertTextIncludes('Trop de tentatives de connexion')
  })
})
