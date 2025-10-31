import { injectable } from 'tsyringe';
import type { IDomainEventHandler } from '../IDomainEventHandler.js';
import { TaskAssignedEvent } from '@domain/events/TaskEvents.js';
import { logger } from '@utils/logger.util.js';

/**
 * TaskAssignedEventHandler
 *
 * Handles TaskAssigned domain events.
 * Example use cases:
 * - Notify assigned user via email
 * - Update user's workload metrics
 * - Log assignment for analytics
 * - Trigger Slack/Teams notification
 */
@injectable()
export class TaskAssignedEventHandler implements IDomainEventHandler<TaskAssignedEvent> {
  /**
   * Handle TaskAssigned event
   *
   * @param event - The TaskAssigned domain event
   */
  handle(event: TaskAssignedEvent): Promise<void> {
    logger.info('Handling TaskAssigned event', {
      taskId: event.aggregateId,
      assigneeId: event.assigneeId,
      occurredAt: event.occurredAt,
    });

    // Side effects will be implemented in Phase 3 (e.g., notification email)
    // For now, just log the event
    return Promise.resolve();
  }

  /**
   * Get the event types this handler subscribes to
   */
  getEventTypes(): string[] {
    return ['TaskAssigned'];
  }
}
