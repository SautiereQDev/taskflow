import app from '@adonisjs/core/services/app'
import { defineConfig, formatters, loaders } from '@adonisjs/i18n'

import { SUPPORTED_LOCALES } from '#constants/locales'

const i18nConfig = defineConfig({
  defaultLocale: 'fr',
  supportedLocales: SUPPORTED_LOCALES,
  formatter: formatters.icu(),

  loaders: [
    /**
     * The fs loader will read translations from the
     * "resources/lang" directory.
     *
     * Each subdirectory represents a locale. For example:
     *   - "resources/lang/en"
     *   - "resources/lang/fr"
     *   - "resources/lang/it"
     */
    loaders.fs({
      location: app.languageFilesPath(),
    }),
  ],
})

export default i18nConfig
