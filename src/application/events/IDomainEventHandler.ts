import type { DomainEvent } from '@domain/events/DomainEvent.js';

/**
 * Domain Event Handler Interface
 *
 * Handlers implement this interface to process specific domain events
 */
export interface IDomainEventHandler<TEvent extends DomainEvent = DomainEvent> {
  /**
   * Handle the domain event
   *
   * @param event - The domain event to handle
   * @returns Promise that resolves when handling is complete
   * @throws Error if handling fails
   */
  handle(event: TEvent): Promise<void>;

  /**
   * Get the event type(s) this handler subscribes to
   *
   * @returns Array of event type names
   */
  getEventTypes(): string[];
}
