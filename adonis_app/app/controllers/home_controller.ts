import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  public async index({ view }: HttpContext) {
    return view.render('pages/home')
  }
}
