import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'

test.group('Users management', () => {
  test('admin can view users list', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/users').header('x-test-user-id', String(admin.id))

    response.assertStatus(200)
  })

  test('admin can view the creation form', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/users/create').header('x-test-user-id', String(admin.id))

    response.assertStatus(200)
  })

  test('non-admin cannot view users list', async ({ client }) => {
    const user = await UserFactory.apply('member').create()
    const response = await client.get('/users').header('x-test-user-id', String(user.id))

    response.assertStatus(403)
  })

  test('admin can create a user', async ({ client, assert }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.post('/users').header('x-test-user-id', String(admin.id)).form({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: 'member',
      locale: 'fr',
    })

    response.assertRedirectsTo('/users')
    const user = await User.findBy('email', 'new@example.com')
    assert.isNotNull(user)
  })

  test('admin can delete a user', async ({ client, assert }) => {
    const admin = await UserFactory.apply('admin').create()
    const userToDelete = await UserFactory.create()

    const response = await client.delete(`/users/${userToDelete.id}`).header('x-test-user-id', String(admin.id))

    response.assertRedirectsTo('/users')
    const user = await User.find(userToDelete.id)
    assert.isNull(user)
  })

  test('admin can view the edit form', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const target = await UserFactory.create()

    const response = await client.get(`/users/${target.id}/edit`).header('x-test-user-id', String(admin.id))

    response.assertStatus(200)
  })
})
