import { DomainEvent } from './DomainEvent.js';
import { TaskStatus } from '../value-objects/TaskStatus.js';
import { TaskPriority } from '../value-objects/TaskPriority.js';

/**
 * Task Created Event
 *
 * Emitted when a new task is created
 */
export class TaskCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly title: string,
    public readonly creatorId: string,
    public readonly priority: TaskPriority
  ) {
    super(aggregateId, 'TaskCreated');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      title: this.title,
      creatorId: this.creatorId,
      priority: this.priority,
    };
  }
}

/**
 * Task Updated Event
 *
 * Emitted when a task is updated (title or description)
 */
export class TaskUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly changes: {
      title?: string;
      description?: string | null;
    }
  ) {
    super(aggregateId, 'TaskUpdated');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      changes: this.changes,
    };
  }
}

/**
 * Task Status Changed Event
 *
 * Emitted when a task's status changes
 */
export class TaskStatusChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus
  ) {
    super(aggregateId, 'TaskStatusChanged');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
    };
  }
}

/**
 * Task Priority Changed Event
 *
 * Emitted when a task's priority changes
 */
export class TaskPriorityChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly oldPriority: TaskPriority,
    public readonly newPriority: TaskPriority
  ) {
    super(aggregateId, 'TaskPriorityChanged');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      oldPriority: this.oldPriority,
      newPriority: this.newPriority,
    };
  }
}

/**
 * Task Assigned Event
 *
 * Emitted when a task is assigned to a user
 */
export class TaskAssignedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly assigneeId: string
  ) {
    super(aggregateId, 'TaskAssigned');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      assigneeId: this.assigneeId,
    };
  }
}

/**
 * Task Unassigned Event
 *
 * Emitted when a task is unassigned
 */
export class TaskUnassignedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly previousAssigneeId: string
  ) {
    super(aggregateId, 'TaskUnassigned');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      previousAssigneeId: this.previousAssigneeId,
    };
  }
}

/**
 * Task Completed Event
 *
 * Emitted when a task is marked as completed
 */
export class TaskCompletedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'TaskCompleted');
  }
}

/**
 * Task Cancelled Event
 *
 * Emitted when a task is cancelled
 */
export class TaskCancelledEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'TaskCancelled');
  }
}

/**
 * Task Due Date Set Event
 *
 * Emitted when a task's due date is set or changed
 */
export class TaskDueDateSetEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly dueDate: Date
  ) {
    super(aggregateId, 'TaskDueDateSet');
  }

  toPlainObject(): Record<string, unknown> {
    return {
      ...super.toPlainObject(),
      dueDate: this.dueDate,
    };
  }
}

/**
 * Task Due Date Cleared Event
 *
 * Emitted when a task's due date is cleared
 */
export class TaskDueDateClearedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'TaskDueDateCleared');
  }
}
