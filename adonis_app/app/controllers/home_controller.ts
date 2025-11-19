import type { HttpContext } from '@adonisjs/core/http'
// import { inject } from '@adonisjs/core'

import DashboardService from '#services/dashboard_service'
import { buildTaskLabels } from '#view_models/task_labels'

// @inject()
export default class HomeController {
  private readonly dashboardService: DashboardService

  constructor() {
    this.dashboardService = new DashboardService()
  }

  public async index({ auth, view, request, response, session, i18n }: HttpContext) {
    const user = auth.user!
    const dashboard = await this.dashboardService.buildFor(user)

    const preferredFormat = request.accepts(['html', 'json'])
    const wantsJson = preferredFormat === 'json' || request.ajax()

    if (wantsJson) {
      return dashboard
    }


    const { statusLabels, priorityLabels } = buildTaskLabels(i18n)
    const locale = i18n.locale

    const html = await view.render('pages/home', {
      ...dashboard,
      locale,
      statusLabels,
      priorityLabels,
      title: `${i18n.formatMessage('app.name')} • ${i18n.formatMessage('nav.dashboard')}`,
      notification: session.flashMessages?.get('notification') || null,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }
}
