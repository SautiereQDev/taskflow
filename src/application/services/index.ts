// Service exports
export { PasswordHashingService } from './PasswordHashingService.js';
export { AuthenticationService, IAuthenticationResult } from './AuthenticationService.js';
export { TaskAssignmentService } from './TaskAssignmentService.js';
export {
  DashboardMetricsService,
  IDashboardMetrics,
  IUserProductivityMetrics,
} from './DashboardMetricsService.js';

// Interface exports
export { IPasswordHasher } from '../interfaces/IPasswordHasher.js';
