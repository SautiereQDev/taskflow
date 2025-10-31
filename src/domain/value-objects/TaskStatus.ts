/**
 * Task Status Enum
 *
 * Represents the lifecycle of a task
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

/**
 * Check if a string is a valid TaskStatus
 */
export function isValidTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

/**
 * Parse string to TaskStatus
 *
 * @throws Error if value is not a valid status
 */
export function parseTaskStatus(value: string): TaskStatus {
  if (!isValidTaskStatus(value)) {
    throw new Error(`Invalid task status: ${value}`);
  }
  return value;
}

/**
 * Get human-readable label for status
 */
export function getTaskStatusLabel(status: TaskStatus, locale = 'en'): string {
  const labels: Record<TaskStatus, Record<string, string>> = {
    [TaskStatus.TODO]: { en: 'To Do', fr: 'À faire' },
    [TaskStatus.IN_PROGRESS]: { en: 'In Progress', fr: 'En cours' },
    [TaskStatus.DONE]: { en: 'Done', fr: 'Terminé' },
    [TaskStatus.CANCELLED]: { en: 'Cancelled', fr: 'Annulé' },
  };

  return labels[status][locale] || labels[status].en;
}

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
  // Define allowed transitions
  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE, TaskStatus.TODO, TaskStatus.CANCELLED],
    [TaskStatus.DONE]: [TaskStatus.TODO], // Can reopen
    [TaskStatus.CANCELLED]: [TaskStatus.TODO], // Can reopen
  };

  return allowedTransitions[from]?.includes(to) ?? false;
}
