// Query Infrastructure
export { IQuery } from './IQuery.js';
export { IQueryHandler } from './IQueryHandler.js';
export { QueryBus } from './QueryBus.js';

// User Queries
export { GetUserByIdQuery } from './users/GetUserByIdQuery.js';
export { GetUserByIdHandler } from './users/GetUserByIdHandler.js';
export { GetAllUsersQuery } from './users/GetAllUsersQuery.js';
export { GetAllUsersHandler, IPaginatedUsersDto } from './users/GetAllUsersHandler.js';

// Task Queries
export { GetAllTasksQuery } from './tasks/GetAllTasksQuery.js';
export { GetAllTasksHandler } from './tasks/GetAllTasksHandler.js';
export { GetTaskByIdQuery } from './tasks/GetTaskByIdQuery.js';
export { GetTaskByIdHandler } from './tasks/GetTaskByIdHandler.js';

// Dashboard Queries
export { GetDashboardStatsQuery } from './dashboard/GetDashboardStatsQuery.js';
export { GetDashboardStatsHandler } from './dashboard/GetDashboardStatsHandler.js';
