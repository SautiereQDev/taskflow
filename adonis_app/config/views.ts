import env from '#start/env'
import { defineConfig } from '@adonisjs/view'

/**
 * Configuration options for the Edge view provider.
 */
export default defineConfig({
  cache: {
    /**
     * Cache compiled templates in memory after first render.
     * Should stay true only in production for faster SSR responses.
     */
    enabled: env.get('CACHE_VIEWS', false),
  },
})
