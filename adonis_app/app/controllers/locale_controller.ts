import type { HttpContext } from '@adonisjs/core/http'

import { isSupportedLocale } from '#constants/locales'

export default class LocaleController {
  public async update({ request, response, session, auth, i18n }: HttpContext) {
    const locale = request.input('locale')
    const expectsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()

    if (!isSupportedLocale(locale)) {
      const message = i18n.formatMessage('app.language.invalid')

      if (expectsJson) {
        return response.badRequest({ errors: [{ field: 'locale', message }] })
      }

      session.flash('notification', {
        type: 'error',
        message,
      })
      const fallback = request.header('referer') || '/'
      return response.redirect().toPath(fallback)
    }

    session.put('locale', locale)

    const loggedInUser = auth.user
    if (loggedInUser) {
      loggedInUser.locale = locale
      await loggedInUser.save()
    }

    if (expectsJson) {
      return response.ok({ locale })
    }

    session.flash('notification', {
      type: 'success',
      message: i18n.formatMessage('app.language.updated'),
    })

    const requestedRedirect = request.input('redirectTo')
    const isSafePath = typeof requestedRedirect === 'string' && requestedRedirect.startsWith('/')
    const redirectTo = isSafePath ? requestedRedirect : request.header('referer') || '/'
    return response.redirect().toPath(redirectTo)
  }
}
