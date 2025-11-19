import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  public async handle({ auth, request, response, session, i18n }: HttpContext, next: NextFn) {
    const user = auth.user
    if (!user) {
      return response.redirect().toRoute('auth.showLogin')
    }

    if (user.role !== 'admin') {
      const message = i18n.formatMessage('generic.access_denied')
      const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

      if (wantsJson) {
        return response.status(403).send({ message })
      }

      session.flash('notification', {
        type: 'error',
        message,
      })

      return response.redirect().toRoute('home')
    }

    return next()
  }
}
