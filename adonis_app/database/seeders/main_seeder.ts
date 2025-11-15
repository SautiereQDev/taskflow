import { faker } from '@faker-js/faker'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

import { UserFactory } from '#factories/user_factory'
import { TaskFactory } from '#factories/task_factory'
import User from '#models/user'
import Task from '#models/task'

export default class MainSeeder extends BaseSeeder {
  public static readonly developmentOnly = true

  public async run() {
    // Ensure deterministic reruns during local development
    await Task.query().delete()
    await User.query().delete()

    const admin = await UserFactory.merge({
      name: 'Admin TaskFlow',
      email: 'admin@taskflow.dev',
      role: 'admin',
      locale: 'fr',
    }).create()

    const manager = await UserFactory.merge({
      name: 'Manager TaskFlow',
      email: 'manager@taskflow.dev',
      role: 'manager',
      locale: 'en',
    }).create()

    const members = await UserFactory.merge({ role: 'member' }).createMany(4)
    const allUsers = [admin, manager, ...members]

    await Promise.all(
      Array.from({ length: 20 }).map(async () => {
        const creator = faker.helpers.arrayElement(allUsers)
        const assignee = faker.helpers.maybe(() => faker.helpers.arrayElement(allUsers)) ?? null

        await TaskFactory.merge({
          creatorId: creator.id,
          assigneeId: assignee?.id ?? null,
        }).create()
      })
    )
  }
}
