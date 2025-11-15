import { BaseSchema } from '@adonisjs/lucid/schema'

const tableName = 'users'
const userRoles = ['admin', 'manager', 'member'] as const

export default class CreateUsersTable extends BaseSchema {
  protected tableName = tableName

  async up() {
    const tableLookup = await this.raw(
      `select to_regclass('public.${this.tableName}') as table_name`
    )
    const alreadyExists = Boolean(tableLookup.rows?.[0]?.table_name)
    if (alreadyExists) {
      return
    }
    await this.raw('CREATE EXTENSION IF NOT EXISTS "citext"')
    await this.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')
    await this.raw(`
      DO $$
      BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 25).primary()
      table.string('name', 100).notNullable()
      table.specificType('email', 'citext').notNullable().unique()
      table.string('password', 255).notNullable()
      table
        .enum('role', userRoles, {
          useNative: true,
          enumName: 'user_role',
          existingType: true,
        })
        .notNullable()
        .defaultTo('member')
      table.string('locale', 5).notNullable().defaultTo('fr')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['email'], 'users_email_idx')
      table.index(['role'], 'users_role_idx')
      table.index(['created_at'], 'users_created_at_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS user_role')
  }
}
