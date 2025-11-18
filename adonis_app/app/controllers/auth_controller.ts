import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import User from '#models/user'
import { loginMessages, loginValidator } from '#validators/auth/login_validator'

export default class AuthController {
  public async showLogin({ view, session, request }: HttpContext) {
    const flash = session.flashMessages
    const form = flash?.get('form') || {}
    const errorsBag = flash?.get('errors') || {}
    const notification = flash?.get('notification') || null
    console.log('[showLogin] flash', {
      sessionId: session.sessionId,
      cookie: request.header('cookie'),
      form,
      errorsBag,
      notification,
    })
    console.log('[showLogin] flash raw payload', flash?.toJSON())
    console.log('[showLogin] session store', session.all())

    const pageContent = await view.render('auth/login', {
      form,
      errors: errorsBag,
    })

    return view.render('layouts/base', {
      title: 'Connexion • Taskflow',
      pageContent,
      notification,
    })
  }

  public async login({ auth, request, response, session }: HttpContext) {
    try {
      const payload = await loginValidator.validate(
        request.only(['email', 'password', 'remember']),
        { messages: loginMessages }
      )
      const { email, password } = payload
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      session.flash('notification', {
        type: 'success',
        message: 'Connexion réussie, bon retour parmi nous 👋',
      })
      return response.redirect().toRoute('home')
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.log('[auth.login] validation errors', {
          sessionId: session.sessionId,
          messages: error.messages,
        })
        session.flash('errors', this.transformValidationErrors(error))
        session.flash('form', { email: request.input('email') })
        session.flash('notification', {
          type: 'error',
          message: 'Certaines informations sont manquantes ou invalides.',
        })
        console.log('[auth.login] after flash', {
          session: session.all(),
          responseFlash: session.responseFlashMessages.toJSON(),
        })
        return response.redirect().toRoute('auth.showLogin')
      }

      session.flash('errors', {
        email: 'Identifiants invalides. Merci de réessayer.',
      })
      session.flash('form', { email: request.input('email') })
      session.flash('notification', {
        type: 'error',
        message: 'Impossible de vous connecter avec ces identifiants.',
      })
      console.log('[auth.login] invalid credentials flash', {
        session: session.all(),
        responseFlash: session.responseFlashMessages.toJSON(),
      })
      return response.redirect().toRoute('auth.showLogin')
    }
  }

  private transformValidationErrors(error: InstanceType<typeof errors.E_VALIDATION_ERROR>) {
    return error.messages.reduce<Record<string, string>>((acc, current) => {
      const key = `${current.field}.${current.rule}`
      const customMessages = loginMessages as Record<string, string>
      acc[current.field] = customMessages[key] ?? current.message
      return acc
    }, {})
  }

  public async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('notification', {
      type: 'info',
      message: 'Vous êtes maintenant déconnecté.',
    })
    return response.redirect('/login')
  }
}
