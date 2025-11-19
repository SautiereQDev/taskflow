export const SUPPORTED_LOCALES = ['fr', 'en'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function isSupportedLocale(candidate?: string | null): candidate is SupportedLocale {
  return !!candidate && SUPPORTED_LOCALES.includes(candidate as SupportedLocale)
}
