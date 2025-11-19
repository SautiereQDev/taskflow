import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import metricsService, { RequestMetric } from '#services/metrics_service'

export default class PerformanceTrackerMiddleware {
  public async handle(ctx: HttpContext, next: NextFn) {
    const start = process.hrtime.bigint()
    await next()

    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1_000_000
    const status = ctx.response.response.statusCode
    const metric = {
      method: ctx.request.method(),
      url: ctx.request.url(),
      status,
      durationMs: Math.round(durationMs * 100) / 100,
      timestamp: DateTime.now(),
    }

    metricsService.record(metric)
    ctx.performance = metric

    if ('view' in ctx) {
      ctx.view.share({ performance: metric })
    }
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    performance?: RequestMetric
  }
}
