import os from 'node:os'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import { healthChecks } from '#start/health'
import metricsService from '#services/metrics_service'

export default class DiagnosticController {
  public async index({
    auth,
    request,
    response,
    session,
    i18n,
    view,
    htmx,
  }: HttpContext) {
    const user = auth.user!
    const report = await healthChecks.run()
    const wantsJson = request.accepts(['html', 'json']) === 'json' || request.ajax()
    const generatedAt = DateTime.now()
    const metricsSnapshot = metricsService.getSnapshot()

    const memorySnapshot = process.memoryUsage()
    const memoryBreakdown = Object.entries(memorySnapshot).map(([label, value]) => ({
      label,
      megabytes: Math.round((value / 1024 / 1024) * 100) / 100,
    }))

    const payload = {
      timestamp: generatedAt.toISO(),
      generatedAt,
      application: {
        name: i18n.formatMessage('app.name'),
        version: app.version?.toString() ?? 'dev',
        environment: app.nodeEnvironment,
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      requestMeta: {
        method: request.method(),
        url: request.url(),
        ip: request.ip(),
        userAgent: request.header('user-agent') || 'n/a',
        htmx,
      },
      system: {
        uptimeSeconds: Number(process.uptime().toFixed(2)),
        platform: process.platform,
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        loadAverage: os.loadavg().map((entry) => Number(entry.toFixed(2))),
        memory: memoryBreakdown,
      },
      health: report,
      metrics: metricsSnapshot,
    }

    if (wantsJson) {
      return response.ok(payload)
    }

    const diagnosticChecks = report.checks.map((check) => ({
      name: check.name,
      status: check.status,
      message: check.message,
      meta: check.meta ?? null,
      finishedAtLabel: DateTime.fromJSDate(check.finishedAt)
        .setLocale(i18n.locale)
        .toFormat('dd LLL yyyy HH:mm:ss'),
    }))

    const html = await view.render('pages/diagnostic', {
      ...payload,
      diagnosticChecks,
      recentMetrics: metricsSnapshot.recentRequests.slice(0, 10),
      locale: i18n.locale,
      title: `${i18n.formatMessage('app.name')} • ${i18n.formatMessage('diagnostic.title')}`,
      notification: session.flashMessages?.get('notification') || null,
    })

    return response.header('content-type', 'text/html; charset=utf-8').ok(html)
  }
}
