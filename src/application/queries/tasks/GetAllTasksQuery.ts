import type { IQuery } from '../IQuery.js';

/**
 * Query to retrieve paginated task list with optional filters
 */
export class GetAllTasksQuery implements IQuery {
  constructor(
    public readonly page = 1,
    public readonly limit = 20,
    public readonly status?: string,
    public readonly priority?: string,
    public readonly assigneeId?: string,
    public readonly creatorId?: string,
    public readonly search?: string
  ) {}
}
