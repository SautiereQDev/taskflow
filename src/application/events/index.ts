// Event infrastructure
export { EventBus } from './EventBus.js';
export type { IDomainEventHandler } from './IDomainEventHandler.js';

// Event handlers
export { TaskCreatedEventHandler } from './handlers/TaskCreatedEventHandler.js';
export { TaskAssignedEventHandler } from './handlers/TaskAssignedEventHandler.js';
export { UserRegisteredEventHandler } from './handlers/UserRegisteredEventHandler.js';
