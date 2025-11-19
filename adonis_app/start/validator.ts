import vine, { VineString } from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'
import { Database } from '@adonisjs/lucid/database'

type UniqueCallback = (db: Database, value: string, field: FieldContext) => Promise<boolean>

const uniqueRule = vine.createRule(async (value: unknown, callback: UniqueCallback, field: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const isUnique = await callback(db, value, field)

  if (!isUnique) {
    field.report(
      'The {{ field }} has already been taken',
      'unique',
      field
    )
  }
})

VineString.macro('unique', function (this: VineString, callback: UniqueCallback) {
  return this.use(uniqueRule(callback))
})

declare module '@vinejs/vine' {
  interface VineString {
    unique(callback: UniqueCallback): this
  }
}
