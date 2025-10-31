/**
 * Dashboard Controller
 *
 * Handles HTTP requests for dashboard views.
 * Displays statistics and overview information.
 *
 * @module presentation/controllers/dashboard.controller
 */

import type { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { QueryBus } from '@application/queries/QueryBus.js';
import { GetDashboardStatsQuery } from '@application/queries/dashboard/GetDashboardStatsQuery.js';
import { renderOrPartial } from '@presentation/utils/response.helpers.js';
import type { IAuthenticatedRequest } from './auth.controller.js';

/**
 * DashboardController
 *
 * Thin HTTP handler for dashboard views.
 * Retrieves statistics and renders dashboard pages.
 */
@injectable()
export class DashboardController {
  constructor(@inject(QueryBus) private readonly queryBus: QueryBus) {}

  /**
   * GET /dashboard - Render main dashboard with statistics
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   */
  async index(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    // Get dashboard statistics
    const query = new GetDashboardStatsQuery(userId);
    const stats = await this.queryBus.execute(GetDashboardStatsQuery, query);

    // Render dashboard
    renderOrPartial(req, res, 'pages/dashboard/index', 'partials/dashboard/stats', {
      stats,
      user: req.user,
    });
  }
}
