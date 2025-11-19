import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { errors } from '@adonisjs/auth'
// import { inject } from '@adonisjs/core'

// @inject()
export default class AuthService {
  /**
   * Verify user credentials
   */
  public async verifyCredentials(email: string, password: string): Promise<User> {
    const user = await User.findBy('email', email)
    
    if (!user) {
      throw new errors.E_INVALID_CREDENTIALS()
    }

    const isValid = await hash.verify(user.password, password)
    if (!isValid) {
      throw new errors.E_INVALID_CREDENTIALS()
    }

    return user
  }
}
