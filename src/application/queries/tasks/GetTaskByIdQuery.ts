import type { IQuery } from '../IQuery.js';

/**
 * Query to retrieve a single task by ID
 */
export class GetTaskByIdQuery implements IQuery {
  constructor(public readonly taskId: string) {}
}
