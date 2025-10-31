import { DomainEvent } from './DomainEvent.js';
import type { UserRole } from '../entities/User.js';

/**
 * User Registered Event
 *
 * Emitted when a new user registers in the system
 */
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole
  ) {
    super(aggregateId, 'UserRegistered');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      email: this.email,
      name: this.name,
      role: this.role,
    };
  }
}

/**
 * User Email Updated Event
 *
 * Emitted when a user updates their email address
 */
export class UserEmailUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly oldEmail: string,
    public readonly newEmail: string
  ) {
    super(aggregateId, 'UserEmailUpdated');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      oldEmail: this.oldEmail,
      newEmail: this.newEmail,
    };
  }
}

/**
 * User Password Changed Event
 *
 * Emitted when a user changes their password
 */
export class UserPasswordChangedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'UserPasswordChanged');
  }
}

/**
 * User Role Updated Event
 *
 * Emitted when a user's role is updated
 */
export class UserRoleUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly oldRole: UserRole,
    public readonly newRole: UserRole
  ) {
    super(aggregateId, 'UserRoleUpdated');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      oldRole: this.oldRole,
      newRole: this.newRole,
    };
  }
}

/**
 * User Activated Event
 *
 * Emitted when a user is activated
 */
export class UserActivatedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'UserActivated');
  }
}

/**
 * User Deactivated Event
 *
 * Emitted when a user is deactivated
 */
export class UserDeactivatedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'UserDeactivated');
  }
}
