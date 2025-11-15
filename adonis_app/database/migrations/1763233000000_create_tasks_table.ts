import { BaseSchema } from '@adonisjs/lucid/schema'

const tableName = 'tasks'
const taskStatuses = ['todo', 'in_progress', 'done', 'cancelled'] as const
const taskPriorities = ['low', 'medium', 'high', 'urgent'] as const

export default class CreateTasksTable extends BaseSchema {
  protected tableName = tableName

  async up() {
    const tableLookup = await this.raw(
      `select to_regclass('public.${this.tableName}') as table_name`
    )
    const alreadyExists = Boolean(tableLookup.rows?.[0]?.table_name)
    if (alreadyExists) {
      return
    }

    await this.raw(`
      DO $$
      BEGIN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `)

    await this.raw(`
      DO $$
      BEGIN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 25).primary()
      table.string('title', 200).notNullable()
      table.text('description').nullable()
      table
        .enum('status', taskStatuses, {
          useNative: true,
          enumName: 'task_status',
          existingType: true,
        })
        .notNullable()
        .defaultTo('todo')
      table
        .enum('priority', taskPriorities, {
          useNative: true,
          enumName: 'task_priority',
          existingType: true,
        })
        .notNullable()
        .defaultTo('medium')
      table.timestamp('due_date', { useTz: true }).nullable()
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.string('creator_id', 25).notNullable()
      table.string('assignee_id', 25).nullable()

      table.foreign('creator_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('assignee_id').references('id').inTable('users').onDelete('SET NULL')

      table.index(['status'], 'tasks_status_idx')
      table.index(['priority'], 'tasks_priority_idx')
      table.index(['creator_id'], 'tasks_creator_idx')
      table.index(['assignee_id'], 'tasks_assignee_idx')
      table.index(['due_date'], 'tasks_due_date_idx')
      table.index(['completed_at'], 'tasks_completed_at_idx')
      table.index(['created_at'], 'tasks_created_at_idx')
      table.index(['status', 'priority'], 'tasks_status_priority_idx')
      table.index(['assignee_id', 'status'], 'tasks_assignee_status_idx')
    })

    this.schema.raw('CREATE INDEX tasks_title_trgm_idx ON tasks USING GIN (title gin_trgm_ops)')
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS tasks_title_trgm_idx')
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS task_status')
    this.schema.raw('DROP TYPE IF EXISTS task_priority')
  }
}
