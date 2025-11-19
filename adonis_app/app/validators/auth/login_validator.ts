import vine from '@vinejs/vine'
import type { I18n } from '@adonisjs/i18n'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8).maxLength(64),
    remember: vine.literal('on').optional(),
  })
)

export function buildLoginMessages(i18n: I18n) {
  return {
    'email.required': i18n.formatMessage('auth.errors.emailRequired'),
    'email.email': i18n.formatMessage('auth.errors.emailInvalid'),
    'password.required': i18n.formatMessage('auth.errors.passwordRequired'),
    'password.minLength': i18n.formatMessage('auth.errors.passwordLength'),
  }
}
