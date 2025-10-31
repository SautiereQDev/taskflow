import { injectable } from 'tsyringe';
import type { IDomainEventHandler } from '../IDomainEventHandler.js';
import { TaskCreatedEvent } from '@domain/events/TaskEvents.js';
import { logger } from '@utils/logger.util.js';

/**
 * TaskCreatedEventHandler
 *
 * Handles TaskCreated domain events.
 * Example use cases:
 * - Send email notification to creator
 * - Log task creation for analytics
 * - Trigger webhook for integrations
 * - Update read model cache
 */
@injectable()
export class TaskCreatedEventHandler implements IDomainEventHandler<TaskCreatedEvent> {
  /**
   * Handle TaskCreated event
   *
   * @param event - The TaskCreated domain event
   */
  handle(event: TaskCreatedEvent): Promise<void> {
    logger.info('Handling TaskCreated event', {
      taskId: event.aggregateId,
      title: event.title,
      creatorId: event.creatorId,
      priority: event.priority,
      occurredAt: event.occurredAt,
    });

    // Side effects will be implemented in Phase 3 (e.g., email notifications)
    // For now, just log the event
    return Promise.resolve();
  }

  /**
   * Get the event types this handler subscribes to
   */
  getEventTypes(): string[] {
    return ['TaskCreated'];
  }
}
