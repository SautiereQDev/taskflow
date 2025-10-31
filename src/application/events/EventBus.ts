import { injectable } from 'tsyringe';
import type { DomainEvent } from '@domain/events/DomainEvent.js';
import type { IDomainEventHandler } from './IDomainEventHandler.js';
import { logger } from '@utils/logger.util.js';

/**
 * EventBus
 *
 * In-memory event dispatcher that publishes domain events to registered handlers.
 * Uses strongly-typed handlers and deferred execution (events published after transaction commit).
 *
 * Based on Clean Architecture pattern:
 * - Handlers are registered via DI container
 * - Events are dispatched synchronously but can be made async
 * - Supports multiple handlers per event type
 * - Provides error isolation (one handler failure doesn't stop others)
 */
@injectable()
export class EventBus {
  private readonly handlers = new Map<string, IDomainEventHandler[]>();

  /**
   * Register an event handler for specific event types
   *
   * @param handler - The event handler to register
   */
  register(handler: IDomainEventHandler): void {
    const eventTypes = handler.getEventTypes();

    for (const eventType of eventTypes) {
      const existingHandlers = this.handlers.get(eventType) ?? [];
      existingHandlers.push(handler);
      this.handlers.set(eventType, existingHandlers);

      logger.debug('Registered event handler', {
        eventType,
        handlerName: handler.constructor.name,
      });
    }
  }

  /**
   * Publish a single domain event to all registered handlers
   *
   * @param event - The domain event to publish
   * @returns Promise that resolves when all handlers complete
   * @throws Error if critical handler fails (configurable)
   */
  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.eventType;
    const handlers = this.handlers.get(eventType) ?? [];

    if (handlers.length === 0) {
      logger.warn('No handlers registered for event', {
        eventType,
        aggregateId: event.aggregateId,
      });
      return;
    }

    logger.info('Publishing domain event', {
      eventType,
      aggregateId: event.aggregateId,
      handlerCount: handlers.length,
    });

    // Execute all handlers (error isolation: one failure doesn't stop others)
    const results = await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler.handle(event);
          logger.debug('Event handler completed successfully', {
            eventType,
            handlerName: handler.constructor.name,
          });
        } catch (error) {
          logger.error('Event handler failed', {
            eventType,
            handlerName: handler.constructor.name,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      })
    );

    // Log failures but don't throw (non-critical failures)
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      logger.warn('Some event handlers failed', {
        eventType,
        failureCount: failures.length,
        totalHandlers: handlers.length,
      });
    }
  }

  /**
   * Publish multiple domain events in sequence
   *
   * @param events - Array of domain events to publish
   * @returns Promise that resolves when all events are published
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    logger.info('Publishing multiple domain events', {
      eventCount: events.length,
    });

    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Get the number of registered handlers for an event type
   *
   * @param eventType - The event type name
   * @returns Number of registered handlers
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length ?? 0;
  }

  /**
   * Clear all registered handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
    logger.debug('All event handlers cleared');
  }
}
