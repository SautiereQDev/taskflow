import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8).maxLength(64),
    remember: vine.literal('on').optional(),
  })
)

export const loginMessages = {
  'email.required': 'Veuillez saisir votre adresse email.',
  'email.email': 'Adresse email invalide.',
  'password.required': 'Veuillez indiquer votre mot de passe.',
  'password.minLength': 'Votre mot de passe doit contenir au moins 8 caractères.',
}
