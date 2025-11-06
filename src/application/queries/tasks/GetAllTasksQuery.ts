import type { IQuery } from '../IQuery.js';

/**
 * Parameters accepted by GetAllTasksQuery
 */
export interface IGetAllTasksQueryParams {
  page?: number;
  limit?: number;
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  creatorId?: string;
  dueDateFilter?: 'overdue' | 'today' | 'week';
  search?: string;
}

/**
 * Query to retrieve paginated task list with optional filters
 */
export class GetAllTasksQuery implements IQuery {
  public readonly page: number;
  public readonly limit: number;
  public readonly status?: string[];
  public readonly priority?: string[];
  public readonly assigneeId?: string;
  public readonly creatorId?: string;
  public readonly dueDateFilter?: 'overdue' | 'today' | 'week';
  public readonly search?: string;

  constructor(params: IGetAllTasksQueryParams = {}) {
    this.page = params.page ?? 1;
    this.limit = params.limit ?? 20;
    this.status = params.status;
    this.priority = params.priority;
    this.assigneeId = params.assigneeId;
    this.creatorId = params.creatorId;
    this.dueDateFilter = params.dueDateFilter;
    this.search = params.search;
  }
}
