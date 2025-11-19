import type { HttpContext } from '@adonisjs/core/http'
// import { inject } from '@adonisjs/core'
import { errors } from '@vinejs/vine'
import AuthService from '#services/auth_service'
import { buildLoginMessages, loginValidator } from '#validators/auth/login_validator'

// @inject()
export default class AuthController {
  private readonly authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  public async showLogin({ view, session, i18n, response }: HttpContext) {
    const flash = session.flashMessages
    const form = flash?.get('form') || {}
    const errorsBag = flash?.get('errors') || {}
    const notification = flash?.get('notification') || null
    const locale = i18n.locale

    const html = await view.render('auth/login', {
      form,
      errors: errorsBag,
      title: `${i18n.formatMessage('app.name')} • ${i18n.formatMessage('auth.login.title')}`,
      notification,
      locale,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }

  public async login({ auth, request, response, session, i18n }: HttpContext) {
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const loginMessages = buildLoginMessages(i18n)

    try {
      const payload = await loginValidator.validate(
        request.only(['email', 'password', 'remember']),
        { messages: loginMessages }
      )
      const { email, password } = payload
      const user = await this.authService.verifyCredentials(email, password)
      await auth.use('web').login(user, !!payload.remember)

      if (wantsJson) {
        return response.ok({
          message: i18n.formatMessage('auth.messages.success'),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        })
      }

      session.flash('notification', {
        type: 'success',
        message: i18n.formatMessage('auth.messages.welcome'),
      })
      return response.redirect().toRoute('home')
    } catch (error) {
      console.log('Login error:', error)
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const validationErrors = this.transformValidationErrors(error, loginMessages)

        if (wantsJson) {
          return response.status(422).send({ errors: validationErrors })
        }

        session.flash('errors', validationErrors)
        session.flash('form', { email: request.input('email') })
        session.flash('notification', {
          type: 'error',
          message: i18n.formatMessage('auth.messages.invalidPayload'),
        })
        return response.redirect().toRoute('auth.showLogin')
      }

      if (wantsJson) {
        return response.status(401).send({
          errors: {
            email: i18n.formatMessage('auth.messages.invalid'),
          },
        })
      }

      session.flash('errors', {
        email: i18n.formatMessage('auth.messages.invalid'),
      })
      session.flash('form', { email: request.input('email') })
      session.flash('notification', {
        type: 'error',
        message: i18n.formatMessage('auth.messages.blocked'),
      })
      return response.redirect().toRoute('auth.showLogin')
    }
  }

  private transformValidationErrors(
    error: InstanceType<typeof errors.E_VALIDATION_ERROR>,
    customMessages: Record<string, string>
  ) {
    return error.messages.reduce<Record<string, string>>((acc, current) => {
      const key = `${current.field}.${current.rule}`
      acc[current.field] = customMessages[key] ?? current.message
      return acc
    }, {})
  }

  public async logout({ auth, response, session, i18n }: HttpContext) {
    await auth.use('web').logout()
    session.flash('notification', {
      type: 'info',
      message: i18n.formatMessage('auth.messages.logout'),
    })
    return response.redirect('/login')
  }
}
