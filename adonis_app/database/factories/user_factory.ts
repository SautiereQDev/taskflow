import factory from '@adonisjs/lucid/factories'

import { userRoles } from '#types/domain'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      locale: faker.helpers.arrayElement(['fr', 'en']),
      role: faker.helpers.arrayElement(userRoles),
      password: 'password',
    }
  })
  .state('admin', (user) => {
    user.role = 'admin'
  })
  .state('manager', (user) => {
    user.role = 'manager'
  })
  .state('member', (user) => {
    user.role = 'member'
  })
  .build()
