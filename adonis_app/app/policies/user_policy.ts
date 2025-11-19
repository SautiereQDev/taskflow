import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  public viewList(user: User): AuthorizerResponse {
    return user.role === 'admin'
  }

  public view(user: User, targetUser: User): AuthorizerResponse {
    return user.role === 'admin' || user.id === targetUser.id
  }

  public create(user: User): AuthorizerResponse {
    return user.role === 'admin'
  }

  public update(user: User, targetUser: User): AuthorizerResponse {
    return user.role === 'admin' || user.id === targetUser.id
  }

  public delete(user: User, targetUser: User): AuthorizerResponse {
    return user.role === 'admin' && user.id !== targetUser.id
  }
}
