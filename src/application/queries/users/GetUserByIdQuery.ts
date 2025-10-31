import type { IQuery } from '../IQuery.js';

/**
 * Query to retrieve a single user by ID
 */
export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
