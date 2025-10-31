import type { IQuery } from '../IQuery.js';

/**
 * Query to retrieve dashboard statistics
 * Optionally filtered by user ID to show user-specific stats
 */
export class GetDashboardStatsQuery implements IQuery {
  constructor(public readonly userId?: string) {}
}
