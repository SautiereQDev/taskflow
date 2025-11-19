import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export type HtmxDetails = {
  isHtmx: boolean
  boosted: boolean
  historyRestore: boolean
  currentUrl: string
  target: string | null
  trigger: string | null
  triggerName: string | null
  prompt: string | null
}

export default class HtmxMiddleware {
  public async handle(ctx: HttpContext, next: NextFn) {
    const request = ctx.request
    const getHeader = (name: string) => request.header(name)
    const asBool = (value: string | undefined | null) => value === 'true' || value === '1'

    const details: HtmxDetails = {
      isHtmx: asBool(getHeader('hx-request')),
      boosted: asBool(getHeader('hx-boosted')),
      historyRestore: asBool(getHeader('hx-history-restore-request')),
      currentUrl: getHeader('hx-current-url') || request.url(),
      target: getHeader('hx-target') || null,
      trigger: getHeader('hx-trigger') || null,
      triggerName: getHeader('hx-trigger-name') || null,
      prompt: getHeader('hx-prompt') || null,
    }

    ctx.htmx = details

    if ('view' in ctx) {
      ctx.view.share({ htmx: details })
    }

    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    htmx: HtmxDetails
  }
}
