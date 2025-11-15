export const userRoles = ['admin', 'manager', 'member'] as const
export type UserRole = (typeof userRoles)[number]

export const taskStatuses = ['todo', 'in_progress', 'done', 'cancelled'] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const taskPriorities = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof taskPriorities)[number]
