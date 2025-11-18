import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import app from '@adonisjs/core/services/app'

import User from '#models/user'

/**
 * TestAuthHelperMiddleware allows functional tests to impersonate a user
 * by sending the "x-test-user-id" header. The middleware is only active
 * during the test environment to avoid leaking the behavior elsewhere.
 */
export default class TestAuthHelperMiddleware {
  public async handle(ctx: HttpContext, next: NextFn) {
    if (app.inTest) {
      const userId = ctx.request.header('x-test-user-id')

      if (userId) {
        const user = await User.find(userId)
        if (user) {
          await ctx.auth.use('web').login(user)
        }
      }
    }

    return next()
  }
}
