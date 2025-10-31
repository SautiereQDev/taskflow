import { Task, TaskStatus, TaskPriority } from '@prisma/client';

/**
 * ViewModel for Task entity with formatted display data
 * Transforms raw Prisma Task data into presentation-friendly format
 */
export interface ITaskViewModel {
  id: string;
  title: string;
  description: string | null;
  status: {
    value: TaskStatus;
    label: string;
    color: string;
  };
  priority: {
    value: TaskPriority;
    label: string;
    color: string;
  };
  dueDate: {
    raw: Date | null;
    formatted: string | null;
    isOverdue: boolean;
    isToday: boolean;
    isTomorrow: boolean;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
    initials: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
    initials: string;
  } | null;
  createdAt: {
    raw: Date;
    formatted: string;
    relative: string;
  };
  updatedAt: {
    raw: Date;
    formatted: string;
    relative: string;
  };
}

/**
 * Status display configuration
 */
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'À faire', color: 'badge-info' },
  IN_PROGRESS: { label: 'En cours', color: 'badge-warning' },
  DONE: { label: 'Terminé', color: 'badge-success' },
  CANCELLED: { label: 'Annulé', color: 'badge-error' },
};

/**
 * Priority display configuration
 */
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: 'Basse', color: 'badge-ghost' },
  MEDIUM: { label: 'Moyenne', color: 'badge-info' },
  HIGH: { label: 'Haute', color: 'badge-warning' },
  URGENT: { label: 'Urgente', color: 'badge-error' },
};

/**
 * Formats a date to French locale string (dd/MM/yyyy HH:mm)
 */
function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats a date to relative time (il y a X jours, dans X heures, etc.)
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `il y a ${months} mois`;
  }
  const years = Math.floor(diffDays / 365);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

/**
 * Checks if a date is today
 */
function isToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is tomorrow
 */
function isTomorrow(date: Date | null): boolean {
  if (!date) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Checks if a date is overdue (past and not today)
 */
function isOverdue(date: Date | null): boolean {
  if (!date) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return due < now;
}

/**
 * Extracts initials from a name (first letter of first and last name)
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + (parts.at(-1)?.charAt(0) ?? '')).toUpperCase();
}

/**
 * Transforms a Prisma Task entity into a ViewModel for display
 *
 * @param task - Raw Prisma Task with relations (assignee, creator)
 * @returns Formatted task data ready for EJS templates
 *
 * @example
 * ```typescript
 * const task = await taskRepo.findById(id);
 * const viewModel = TaskViewModel.fromEntity(task);
 * res.render('pages/tasks/detail', { task: viewModel });
 * ```
 */
export class TaskViewModel {
  static fromEntity(
    task: Task & {
      assignee?: { id: string; name: string; email: string } | null;
      creator?: { id: string; name: string; email: string } | null;
    }
  ): ITaskViewModel {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: {
        value: task.status,
        ...STATUS_CONFIG[task.status],
      },
      priority: {
        value: task.priority,
        ...PRIORITY_CONFIG[task.priority],
      },
      dueDate: {
        raw: task.dueDate,
        formatted: formatDate(task.dueDate),
        isOverdue: isOverdue(task.dueDate),
        isToday: isToday(task.dueDate),
        isTomorrow: isTomorrow(task.dueDate),
      },
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
            initials: getInitials(task.assignee.name),
          }
        : null,
      creator: task.creator
        ? {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
            initials: getInitials(task.creator.name),
          }
        : null,
      createdAt: {
        raw: task.createdAt,
        formatted: formatDate(task.createdAt) ?? '',
        relative: formatRelativeDate(task.createdAt),
      },
      updatedAt: {
        raw: task.updatedAt,
        formatted: formatDate(task.updatedAt) ?? '',
        relative: formatRelativeDate(task.updatedAt),
      },
    };
  }

  /**
   * Transforms an array of Tasks into ViewModels
   */
  static fromEntityArray(
    tasks: (Task & {
      assignee?: { id: string; name: string; email: string } | null;
      creator?: { id: string; name: string; email: string } | null;
    })[]
  ): ITaskViewModel[] {
    return tasks.map((task) => this.fromEntity(task));
  }
}
