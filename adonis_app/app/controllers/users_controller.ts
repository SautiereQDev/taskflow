import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'
import { createUserValidator, updateUserValidator } from '#validators/user/user'

export default class UsersController {
  private readonly userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  public async index({ view, request, bouncer }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('viewList')

    const page = request.input('page', 1)
    const perPage = request.input('perPage', 10)
    const search = request.input('search')
    const role = request.input('role')

    const result = await this.userService.list({ search, role }, { page, perPage })

    return view.render('pages/users/index', {
      users: result.users,
      meta: result.meta,
      filters: { search, role }
    })
  }

  public async create({ view, bouncer }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('create')
    return view.render('pages/users/create')
  }

  public async store({ request, response, session, bouncer }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('create')

    const payload = await createUserValidator.validate(request.all())
    await this.userService.create(payload)

    session.flash('notification', {
      type: 'success',
      message: 'Utilisateur créé avec succès'
    })

    return response.redirect().toRoute('users.index')
  }

  public async edit({ view, params, bouncer }: HttpContext) {
    const user = await this.userService.findById(params.id)
    if (!user) {
      return view.render('errors/not_found')
    }

    await bouncer.with('UserPolicy').authorize('update', user)
    return view.render('pages/users/edit', { user })
  }

  public async update({ request, response, session, params, bouncer }: HttpContext) {
    const user = await this.userService.findById(params.id)
    if (!user) {
      return response.notFound()
    }

    await bouncer.with('UserPolicy').authorize('update', user)

    const payload = await updateUserValidator.validate(request.all(), {
      meta: { userId: user.id }
    })

    await this.userService.update(user, payload)

    session.flash('notification', {
      type: 'success',
      message: 'Utilisateur mis à jour avec succès'
    })

    return response.redirect().toRoute('users.index')
  }

  public async destroy({ response, session, params, bouncer }: HttpContext) {
    const user = await this.userService.findById(params.id)
    if (!user) {
      return response.notFound()
    }

    await bouncer.with('UserPolicy').authorize('delete', user)

    await this.userService.delete(user)

    session.flash('notification', {
      type: 'success',
      message: 'Utilisateur supprimé avec succès'
    })

    return response.redirect().toRoute('users.index')
  }
}
