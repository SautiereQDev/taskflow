# Event System (Phase 2.4)

## Overview

The Event System implements an in-memory EventBus that dispatches domain events to registered handlers following Clean Architecture and DDD principles.

## Architecture

Based on web research (Milan Jovanović's Domain Events pattern):

- **EventBus**: Strongly-typed event dispatcher with error isolation
- **IDomainEventHandler**: Interface for event handlers with `getEventTypes()` subscription
- **Deferred Execution**: Events published after transaction commit (future enhancement)
- **Error Handling**: One handler failure doesn't stop others (Promise.allSettled)

## Components

### EventBus (`EventBus.ts`)

Central event dispatcher that:

- Registers handlers for specific event types
- Publishes events to all registered handlers
- Provides error isolation (failed handlers don't block others)
- Logs event publishing with structured logging

### IDomainEventHandler (`IDomainEventHandler.ts`)

Interface for event handlers:

```typescript
interface IDomainEventHandler<TEvent extends DomainEvent> {
  handle(event: TEvent): Promise<void>;
  getEventTypes(): string[];
}
```

### Event Handlers (`handlers/`)

Example implementations:

- **TaskCreatedEventHandler**: Handles task creation events
- **TaskAssignedEventHandler**: Handles task assignment events
- **UserRegisteredEventHandler**: Handles user registration events

## Usage

### Publishing Events from Commands

```typescript
import { container } from 'tsyringe';
import { EventBus } from '@application/events/EventBus.js';
import { TaskCreatedEvent } from '@domain/events/TaskEvents.js';

// In a command handler
const eventBus = container.resolve(EventBus);
const event = new TaskCreatedEvent(task.id, task.title, task.creatorId, task.priority);
await eventBus.publish(event);
```

### Publishing Multiple Events

```typescript
await eventBus.publishAll([
  new TaskCreatedEvent(...),
  new TaskAssignedEvent(...)
]);
```

### Creating Custom Event Handlers

```typescript
import { injectable } from 'tsyringe';
import { IDomainEventHandler } from '@application/events/IDomainEventHandler.js';
import { TaskCompletedEvent } from '@domain/events/TaskEvents.js';

@injectable()
export class TaskCompletedEventHandler implements IDomainEventHandler<TaskCompletedEvent> {
  handle(event: TaskCompletedEvent): Promise<void> {
    // Send completion notification
    // Update analytics
    // Trigger webhooks
    return Promise.resolve();
  }

  getEventTypes(): string[] {
    return ['TaskCompleted'];
  }
}
```

### Registering New Handlers

In `src/config/di-container.ts`:

```typescript
import { TaskCompletedEventHandler } from '../application/events/handlers/TaskCompletedEventHandler.js';

container.registerSingleton(TaskCompletedEventHandler);

const eventBus = container.resolve(EventBus);
eventBus.register(container.resolve(TaskCompletedEventHandler));
```

## Event Types

Available domain events from Phase 1.1:

### Task Events

- `TaskCreated`
- `TaskUpdated`
- `TaskStatusChanged`
- `TaskPriorityChanged`
- `TaskAssigned`
- `TaskUnassigned`
- `TaskCompleted`
- `TaskCancelled`
- `TaskDueDateSet`
- `TaskDueDateCleared`

### User Events

- `UserRegistered`
- `UserEmailUpdated`
- `UserPasswordChanged`
- `UserRoleUpdated`
- `UserActivated`
- `UserDeactivated`

## Benefits

1. **Loose Coupling**: Handlers are decoupled from business logic
2. **Single Responsibility**: Each handler focuses on one side effect
3. **Testability**: Handlers can be tested in isolation
4. **Extensibility**: Add new handlers without modifying existing code
5. **Error Isolation**: One handler failure doesn't stop others
6. **Observability**: All events and handlers logged

## Future Enhancements

1. **Persistent Event Store**: Store events in database for audit/replay
2. **Async Event Processing**: Queue events for background processing
3. **Event Sourcing**: Rebuild state from event history
4. **External Events**: Publish to message brokers (RabbitMQ, Kafka)
5. **Retry Policies**: Automatic retry for failed handlers
6. **Dead Letter Queue**: Handle permanently failed events

## Testing

```typescript
import { EventBus } from '@application/events/EventBus.js';
import { TaskCreatedEvent } from '@domain/events/TaskEvents.js';

describe('EventBus', () => {
  it('should publish events to registered handlers', async () => {
    const eventBus = new EventBus();
    const handler = new TaskCreatedEventHandler();
    eventBus.register(handler);

    const event = new TaskCreatedEvent('123', 'Test', 'user-1', 'HIGH');
    await eventBus.publish(event);

    // Assert handler was called
  });
});
```

## References

- Milan Jovanović's Domain Events Pattern (2025)
- Clean Architecture Event Handling (Robert C. Martin)
- CQRS with Event Sourcing (Greg Young)
