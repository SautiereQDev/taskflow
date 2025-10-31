import type { IQuery } from '../IQuery.js';

/**
 * Query to retrieve paginated list of users with optional filters
 */
export class GetAllUsersQuery implements IQuery {
  constructor(
    public readonly page = 1,
    public readonly limit = 20,
    public readonly role?: string,
    public readonly isActive?: boolean,
    public readonly search?: string
  ) {}
}
