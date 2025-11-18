import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config, PluginFn } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'

const EXIT_DEBUG_ENABLED = process.env.DEBUG_TEST_EXIT === 'true'

const createExitDebugPlugin = (): PluginFn => {
  return async ({ runner, emitter }) => {
    const prefix = '[@adonis-tests]'
    const summarize = () => {
      const summary = runner.getSummary()
      const failureTree = summary.failureTree?.map((suite) => ({
        name: suite.name,
        errors: suite.errors?.length || 0,
        children: suite.children?.length || 0,
      }))
      console.log(
        `${prefix} summary: hasError=${summary.hasError} duration=${summary.duration}ms aggregates=${JSON.stringify(summary.aggregates)}`
      )
      console.log(`${prefix} summary failureTree=${JSON.stringify(failureTree)}`)
    }

    emitter.on('runner:start', () => {
      console.log(`${prefix} runner:start suites=${runner.suites.length}`)
    })

    emitter.on('runner:end', () => {
      console.log(`${prefix} runner:end`)
      summarize()
    })
  }
}

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [assert(), apiClient(), pluginAdonisJS(app)]

if (EXIT_DEBUG_ENABLED) {
  plugins.push(createExitDebugPlugin())
}

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
