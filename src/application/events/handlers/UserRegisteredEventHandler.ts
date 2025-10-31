import { injectable } from 'tsyringe';
import type { IDomainEventHandler } from '../IDomainEventHandler.js';
import { UserRegisteredEvent } from '@domain/events/UserEvents.js';
import { logger } from '@utils/logger.util.js';

/**
 * UserRegisteredEventHandler
 *
 * Handles UserRegistered domain events.
 * Example use cases:
 * - Send welcome email
 * - Initialize user preferences
 * - Create default workspace
 * - Track user acquisition metrics
 */
@injectable()
export class UserRegisteredEventHandler implements IDomainEventHandler<UserRegisteredEvent> {
  /**
   * Handle UserRegistered event
   *
   * @param event - The UserRegistered domain event
   */
  handle(event: UserRegisteredEvent): Promise<void> {
    logger.info('Handling UserRegistered event', {
      userId: event.aggregateId,
      email: event.email,
      name: event.name,
      role: event.role,
      occurredAt: event.occurredAt,
    });

    // Side effects will be implemented in Phase 3 (e.g., welcome email)
    // For now, just log the event
    return Promise.resolve();
  }

  /**
   * Get the event types this handler subscribes to
   */
  getEventTypes(): string[] {
    return ['UserRegistered'];
  }
}
