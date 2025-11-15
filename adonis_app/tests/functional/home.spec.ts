import { test } from '@japa/runner'

test.group('Home page', () => {
  test('renders landing view', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('Bienvenue sur la version AdonisJS de Taskflow')
  })
})
