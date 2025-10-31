import { TaskStatus } from '../value-objects/TaskStatus.js';
import { TaskPriority } from '../value-objects/TaskPriority.js';

/**
 * Task Entity (Aggregate Root)
 *
 * Represents a task with title, description, status, priority, and assignments
 */
export class Task {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _description: string | null,
    private _status: TaskStatus,
    private _priority: TaskPriority,
    private readonly _creatorId: string,
    private _assigneeId: string | null,
    private _dueDate: Date | null,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  /**
   * Create a new Task instance
   *
   * @param props - Task properties
   * @returns Task instance
   */
  static create(props: {
    id: string;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    creatorId: string;
    assigneeId?: string | null;
    dueDate?: Date | null;
    completedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Task {
    if (!props.id?.trim()) {
      throw new TypeError('Task ID is required');
    }

    if (!props.title?.trim()) {
      throw new TypeError('Task title is required');
    }

    if (props.title.length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }

    if (props.title.length > 200) {
      throw new Error('Task title must not exceed 200 characters');
    }

    if (props.description && props.description.length > 2000) {
      throw new Error('Task description must not exceed 2000 characters');
    }

    if (!props.creatorId?.trim()) {
      throw new TypeError('Creator ID is required');
    }

    if (props.dueDate && Number.isNaN(props.dueDate.getTime())) {
      throw new TypeError('Invalid due date');
    }

    const now = new Date();
    return new Task(
      props.id.trim(),
      props.title.trim(),
      props.description?.trim() ?? null,
      props.status ?? TaskStatus.TODO,
      props.priority ?? TaskPriority.MEDIUM,
      props.creatorId.trim(),
      props.assigneeId?.trim() ?? null,
      props.dueDate ?? null,
      props.completedAt ?? null,
      props.createdAt ?? now,
      props.updatedAt ?? now
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get priority(): TaskPriority {
    return this._priority;
  }

  get creatorId(): string {
    return this._creatorId;
  }

  get assigneeId(): string | null {
    return this._assigneeId;
  }

  get dueDate(): Date | null {
    return this._dueDate ? new Date(this._dueDate) : null;
  }

  get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Update task title
   */
  updateTitle(title: string): void {
    if (!title?.trim()) {
      throw new TypeError('Task title is required');
    }

    if (title.length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }

    if (title.length > 200) {
      throw new Error('Task title must not exceed 200 characters');
    }

    this._title = title.trim();
    this._updatedAt = new Date();
  }

  /**
   * Update task description
   */
  updateDescription(description: string | null): void {
    if (description && description.length > 2000) {
      throw new Error('Task description must not exceed 2000 characters');
    }

    this._description = description?.trim() ?? null;
    this._updatedAt = new Date();
  }

  /**
   * Change task status
   */
  changeStatus(newStatus: TaskStatus): void {
    if (!TaskStatus[newStatus]) {
      throw new TypeError('Invalid task status');
    }

    // Validate status transition
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE, TaskStatus.TODO, TaskStatus.CANCELLED],
      [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.CANCELLED]: [TaskStatus.TODO],
    };

    const allowedStatuses = validTransitions[this._status];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Cannot transition from ${this._status} to ${newStatus}`);
    }

    this._status = newStatus;
    this._updatedAt = new Date();

    // Set completedAt when task is done
    if (newStatus === TaskStatus.DONE) {
      this._completedAt = new Date();
    } else if (this._completedAt) {
      // Clear completedAt if moving away from DONE
      this._completedAt = null;
    }
  }

  /**
   * Update task priority
   */
  updatePriority(priority: TaskPriority): void {
    if (!TaskPriority[priority]) {
      throw new TypeError('Invalid task priority');
    }

    this._priority = priority;
    this._updatedAt = new Date();
  }

  /**
   * Assign task to a user
   */
  assignTo(userId: string): void {
    if (!userId?.trim()) {
      throw new TypeError('User ID is required');
    }

    this._assigneeId = userId.trim();
    this._updatedAt = new Date();
  }

  /**
   * Unassign task
   */
  unassign(): void {
    this._assigneeId = null;
    this._updatedAt = new Date();
  }

  /**
   * Set task due date
   */
  setDueDate(dueDate: Date): void {
    if (Number.isNaN(dueDate.getTime())) {
      throw new TypeError('Invalid due date');
    }

    this._dueDate = dueDate;
    this._updatedAt = new Date();
  }

  /**
   * Clear task due date
   */
  clearDueDate(): void {
    this._dueDate = null;
    this._updatedAt = new Date();
  }

  /**
   * Mark task as complete
   */
  complete(): void {
    if (this._status === TaskStatus.DONE) {
      throw new Error('Task is already completed');
    }

    this.changeStatus(TaskStatus.DONE);
  }

  /**
   * Cancel task
   */
  cancel(): void {
    if (this._status === TaskStatus.CANCELLED) {
      throw new Error('Task is already cancelled');
    }

    this.changeStatus(TaskStatus.CANCELLED);
  }

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    if (!this._dueDate || this._status === TaskStatus.DONE) {
      return false;
    }

    return this._dueDate < new Date();
  }

  /**
   * Check if task is assigned
   */
  isAssigned(): boolean {
    return this._assigneeId !== null;
  }

  /**
   * Check if task is completed
   */
  isCompleted(): boolean {
    return this._status === TaskStatus.DONE;
  }

  /**
   * Convert to plain object for persistence
   */
  toPlainObject(): {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    creatorId: string;
    assigneeId: string | null;
    dueDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      status: this._status,
      priority: this._priority,
      creatorId: this._creatorId,
      assigneeId: this._assigneeId,
      dueDate: this._dueDate ? new Date(this._dueDate) : null,
      completedAt: this._completedAt ? new Date(this._completedAt) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
