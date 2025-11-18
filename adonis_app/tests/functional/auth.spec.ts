import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

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
        remember: 'on',
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
    response.assertCookie('taskflow_session')

    const sessionCookie = response.cookie('taskflow_session')
    const flashCookie = sessionCookie ? response.cookie(sessionCookie.value) : undefined

    assert.exists(flashCookie, 'flash cookie should be persisted')

    const flashPayload = flashCookie?.value?.__flash__
    assert.exists(flashPayload, 'flash payload should exist')

    assert.deepEqual(flashPayload?.errors, {
      email: 'Adresse email invalide.',
      password: 'Votre mot de passe doit contenir au moins 8 caractères.',
    })

    assert.equal(flashPayload?.form?.email, 'not-an-email')
    assert.equal(flashPayload?.notification?.message, 'Certaines informations sont manquantes ou invalides.')
  })
})
