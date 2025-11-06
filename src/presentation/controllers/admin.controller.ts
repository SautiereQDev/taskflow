import { injectable, inject } from 'tsyringe';
import type { Request, Response } from 'express';
import { QueryBus } from '@application/queries/QueryBus.js';
import { GetAllUsersQuery } from '@application/queries/users/GetAllUsersQuery.js';
import type { IPaginatedUsersDto } from '@application/queries/users/GetAllUsersHandler.js';
import { renderOrPartial } from '@presentation/utils/response.helpers.js';

@injectable()
export class AdminController {
  constructor(@inject(QueryBus) private readonly queryBus: QueryBus) {}

  async listUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await this.queryBus.execute<IPaginatedUsersDto>(
      GetAllUsersQuery,
      new GetAllUsersQuery(page, limit)
    );

    renderOrPartial(req, res, 'pages/admin/users', 'partials/admin/user-list', {
      users: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      title: 'User Management',
    });
  }
}
