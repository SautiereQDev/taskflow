import type { HttpContext } from '@adonisjs/core/http'

import DashboardService from '#services/dashboard_service'
import { priorityLabels, statusLabels } from '#view_models/task_labels'

export default class HomeController {
  constructor(private readonly dashboardService = new DashboardService()) {}

  public async index({ auth, view, request, response, session }: HttpContext) {
    const user = auth.user!
    const dashboard = await this.dashboardService.buildFor(user)

    const preferredFormat = request.accepts(['html', 'json'])
    const wantsJson = preferredFormat === 'json' || request.ajax()

    if (wantsJson) {
      return dashboard
    }


    const pageContent = await view.render('pages/home', {
      ...dashboard,
      locale: user.locale || 'fr',
      statusLabels,
      priorityLabels,
    })

    const html = await view.render('layouts/base', {
      title: 'Taskflow • Tableau de bord',
      pageContent,
      notification: session.flashMessages?.get('notification') || null,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }
}
