import type { ITaskDto, ITaskListItemDto } from '@application/dtos/TaskDto.js';
import type { IUserSummaryDto } from '@application/dtos/UserDto.js';
import type { TaskStatus } from '@domain/value-objects/TaskStatus.js';
import type { TaskPriority } from '@domain/value-objects/TaskPriority.js';

const STATUS_DISPLAY: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'À faire', color: 'badge-info' },
  IN_PROGRESS: { label: 'En cours', color: 'badge-warning' },
  DONE: { label: 'Terminée', color: 'badge-success' },
  CANCELLED: { label: 'Annulée', color: 'badge-error' },
};

const PRIORITY_DISPLAY: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: 'Basse', color: 'badge-ghost' },
  MEDIUM: { label: 'Moyenne', color: 'badge-info' },
  HIGH: { label: 'Haute', color: 'badge-warning' },
  URGENT: { label: 'Urgente', color: 'badge-error' },
};

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

function formatRelativeDate(date: Date | null): string | null {
  if (!date) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "à l'instant";
  if (diffMinutes < 60) return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
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

function isToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isOverdue(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function isTomorrow(date: Date | null): boolean {
  if (!date) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === tomorrow.getTime();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + (parts.at(-1)?.charAt(0) ?? '')).toUpperCase();
}

export interface ICurrentUserContext {
  id: string;
  role: string;
}

export interface ITaskListItemViewModel {
  id: string;
  title: string;
  creatorId: string;
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
    relative: string | null;
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
  canEdit: boolean;
  canDelete: boolean;
  canComplete: boolean;
}

export interface ITaskDetailViewModel extends ITaskListItemViewModel {
  description: string | null;
  creator: {
    id: string;
    name: string;
    email: string;
    initials: string;
  };
  assignee: ITaskListItemViewModel['assignee'];
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

function hasManagementRights(user?: ICurrentUserContext | null): boolean {
  if (!user) return false;
  return ['ADMIN', 'MANAGER'].includes(user.role);
}

export function toTaskListItemViewModel(
  task: ITaskListItemDto,
  currentUser?: ICurrentUserContext | null
): ITaskListItemViewModel {
  const assignee = task.assignee
    ? {
        id: task.assignee.id,
        name: task.assignee.name,
        email: task.assignee.email,
        initials: getInitials(task.assignee.name),
      }
    : null;

  const status = {
    value: task.status,
    ...STATUS_DISPLAY[task.status],
  };

  const priority = {
    value: task.priority,
    ...PRIORITY_DISPLAY[task.priority],
  };

  const dueDate = {
    raw: task.dueDate,
    formatted: formatDate(task.dueDate),
    relative: formatRelativeDate(task.dueDate),
    isOverdue: isOverdue(task.dueDate),
    isToday: isToday(task.dueDate),
    isTomorrow: isTomorrow(task.dueDate),
  };

  const canManage = hasManagementRights(currentUser);
  const isCreator = currentUser?.id === task.creatorId;
  const canEdit = Boolean(currentUser) && (canManage || isCreator);

  return {
    id: task.id,
    title: task.title,
    creatorId: task.creatorId,
    status,
    priority,
    dueDate,
    assignee,
    canEdit,
    canDelete: canEdit,
    canComplete: canEdit,
  };
}

export function toTaskDetailViewModel(
  task: ITaskDto,
  currentUser?: ICurrentUserContext | null
): ITaskDetailViewModel {
  const base = toTaskListItemViewModel(
    {
      id: task.id,
      title: task.title,
      creatorId: task.creator.id,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
    },
    currentUser
  );

  const creator = mapUser(task.creator);
  const assignee = task.assignee ? mapUser(task.assignee) : null;

  return {
    ...base,
    description: task.description,
    creator,
    assignee,
    createdAt: {
      raw: task.createdAt,
      formatted: formatDate(task.createdAt) ?? '',
      relative: formatRelativeDate(task.createdAt) ?? '',
    },
    updatedAt: {
      raw: task.updatedAt,
      formatted: formatDate(task.updatedAt) ?? '',
      relative: formatRelativeDate(task.updatedAt) ?? '',
    },
  };
}

function mapUser(user: IUserSummaryDto) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: getInitials(user.name),
  };
}
