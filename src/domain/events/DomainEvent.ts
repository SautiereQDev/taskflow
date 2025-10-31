/**
 * Base Domain Event
 *
 * Base class for all domain events
 */
export abstract class DomainEvent {
  public readonly occurredAt: Date;

  protected constructor(
    public readonly aggregateId: string,
    public readonly eventType: string
  ) {
    this.occurredAt = new Date();
  }

  /**
   * Convert event to plain object
   */
  toPlainObject(): Record<string, unknown> {
    return {
      aggregateId: this.aggregateId,
      eventType: this.eventType,
      occurredAt: this.occurredAt,
    };
  }
}
