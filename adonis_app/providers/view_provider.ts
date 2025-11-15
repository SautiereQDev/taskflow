import { BriskRoute, HttpContext } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'

/**
 * Local copy of @adonisjs/view provider that tolerates missing Edge.GLOBALS
 * until upstream packages expose an official guard.
 */
export default class ViewProvider {
  public constructor(protected app: ApplicationService) {}

  private registerReplBindings() {
    if (this.app.getEnvironment() !== 'repl') {
      return
    }

    this.app.container.resolving('repl', async (repl) => {
      const { defineReplBindings } = await import('@adonisjs/view/build/src/bindings.js')
      defineReplBindings(this.app, repl)
    })
  }

  private addRouteGlobal(view: any, router: any) {
    view.global('route', (routeIdentifier: any, params?: any, options?: any) => {
      return router.makeUrl(routeIdentifier, params, options)
    })

    view.global('signedRoute', (routeIdentifier: any, params?: any, options?: any) => {
      return router.makeSignedUrl(routeIdentifier, params, options)
    })
  }

  private async addGlobals(view: any) {
    view.global('app', this.app)
    view.global('config', (key: string, defaultValue?: any) => {
      return this.app.config.get(key, defaultValue)
    })
  }

  private async copyEdgeGlobals(view: any) {
    const edge = await import('edge.js')
    const globals = (edge as Record<string, any>).GLOBALS

    if (!globals) {
      return
    }

    for (const key of Object.keys(globals)) {
      view.global(key, globals[key])
    }
  }

  private registerBriskRoute() {
    BriskRoute.macro('render', function renderView(template: string, data?: any) {
      return this.setHandler(({ view }: any) => {
        return view.render(template, data)
      })
    })
  }

  private registerHTTPContextGetter(view: any) {
    HttpContext.getter(
      'view',
      function getView() {
        return view.share({ request: this.request })
      },
      true
    )
  }

  private shouldCacheViews() {
    const config = this.app.config.get('views', { cache: { enabled: false } })
    return config.cache.enabled
  }

  private registerViewBinding() {
    this.app.container.singleton('view', async () => {
      const { Edge } = await import('edge.js')
      const { Supercharged } = await import('edge-supercharged')

      const cacheViews = this.shouldCacheViews()
      const edge = new Edge({ cache: cacheViews })

      edge.mount(this.app.viewsPath())
      edge.use(new Supercharged().wire, { recurring: !cacheViews })

      return edge
    })
  }

  /**
   * Register bindings
   */
  public async register() {
    this.registerViewBinding()
    this.registerReplBindings()
  }

  /**
   * Setup view on boot
   */
  public async boot() {
    const view = await this.app.container.make('view')
    const router = await this.app.container.make('router')

    this.addRouteGlobal(view, router)
    await this.addGlobals(view)
    await this.copyEdgeGlobals(view)
    this.registerBriskRoute()
    this.registerHTTPContextGetter(view)
  }
}
