import { BaseCommand, CommandOptions } from '@adonisjs/core/ace'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class CheckPassword extends BaseCommand {
  static readonly commandName = 'check:password'
  static readonly description = 'Check user password hash'

  static readonly options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const plain = 'password'
    const hashed = await hash.make(plain)
    this.logger.info(`Generated hash: ${hashed}`)
    const isValid = await hash.verify(hashed, plain)
    this.logger.info(`Is valid? ${isValid}`)

    const user = await User.findBy('email', 'admin@taskflow.dev')
    if (!user) {
      this.logger.error('User admin@taskflow.dev not found')
      return
    }

    this.logger.info(`User found: ${user.email}`)
    this.logger.info(`Password hash in DB: ${user.password}`)

    const newHash = await hash.make('password')
    this.logger.info(`New hash of "password": ${newHash}`)

    const isPasswordValid = await hash.verify(user.password, 'password')
    this.logger.info(`Is password "password" valid? ${isPasswordValid}`)

    // Test manual creation
    const testUser = new User()
    testUser.name = 'Test User'
    testUser.email = 'test@test.com'
    testUser.password = 'password'
    await testUser.save()

    this.logger.info(`Test user saved. Hash: ${testUser.password}`)
    const testValid = await hash.verify(testUser.password, 'password')
    this.logger.info(`Test user password valid? ${testValid}`)

    // Debug: verify the hash explicitly
    const explicitValid = await hash.verify(testUser.password, 'password')
    this.logger.info(`Explicit verify: ${explicitValid}`)

    await testUser.delete()

    try {
      const verifiedUser = await User.verifyCredentials('admin@taskflow.dev', 'password')
      this.logger.info(`User.verifyCredentials success: ${verifiedUser.id === user.id}`)
    } catch (error) {
      this.logger.error(`User.verifyCredentials failed: ${error.message}`)
    }
  }
}
