/**
 * Task Priority Enum
 *
 * Represents the urgency/importance of a task
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Check if a string is a valid TaskPriority
 */
export function isValidTaskPriority(value: string): value is TaskPriority {
  return Object.values(TaskPriority).includes(value as TaskPriority);
}

/**
 * Parse string to TaskPriority
 *
 * @throws Error if value is not a valid priority
 */
export function parseTaskPriority(value: string): TaskPriority {
  if (!isValidTaskPriority(value)) {
    throw new Error(`Invalid task priority: ${value}`);
  }
  return value;
}

/**
 * Get human-readable label for priority
 */
export function getTaskPriorityLabel(priority: TaskPriority, locale = 'en'): string {
  const labels: Record<TaskPriority, Record<string, string>> = {
    [TaskPriority.LOW]: { en: 'Low', fr: 'Basse' },
    [TaskPriority.MEDIUM]: { en: 'Medium', fr: 'Moyenne' },
    [TaskPriority.HIGH]: { en: 'High', fr: 'Haute' },
    [TaskPriority.URGENT]: { en: 'Urgent', fr: 'Urgent' },
  };

  return labels[priority][locale] || labels[priority].en;
}

/**
 * Get numeric value for priority (for sorting)
 */
export function getTaskPriorityValue(priority: TaskPriority): number {
  const values: Record<TaskPriority, number> = {
    [TaskPriority.LOW]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.URGENT]: 4,
  };

  return values[priority];
}

/**
 * Get color class for priority (Tailwind/DaisyUI)
 */
export function getTaskPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'badge-info',
    [TaskPriority.MEDIUM]: 'badge-success',
    [TaskPriority.HIGH]: 'badge-warning',
    [TaskPriority.URGENT]: 'badge-error',
  };

  return colors[priority];
}
