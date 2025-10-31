// Value Objects
export { Email } from './value-objects/Email.js';
export { Password } from './value-objects/Password.js';
export { TaskStatus } from './value-objects/TaskStatus.js';
export { TaskPriority } from './value-objects/TaskPriority.js';
export { DateRange } from './value-objects/DateRange.js';

// Entities
export { User, UserRole } from './entities/User.js';
export { Task } from './entities/Task.js';

// Domain Events
export { DomainEvent } from './events/DomainEvent.js';
export {
  UserRegisteredEvent,
  UserEmailUpdatedEvent,
  UserPasswordChangedEvent,
  UserRoleUpdatedEvent,
  UserActivatedEvent,
  UserDeactivatedEvent,
} from './events/UserEvents.js';
export {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskStatusChangedEvent,
  TaskPriorityChangedEvent,
  TaskAssignedEvent,
  TaskUnassignedEvent,
  TaskCompletedEvent,
  TaskCancelledEvent,
  TaskDueDateSetEvent,
  TaskDueDateClearedEvent,
} from './events/TaskEvents.js';

// Repository Interfaces
export type { IUserRepository } from './repositories/IUserRepository.js';
export type {
  ITaskRepository,
  ITaskFilters,
  IPaginatedTasks,
} from './repositories/ITaskRepository.js';
