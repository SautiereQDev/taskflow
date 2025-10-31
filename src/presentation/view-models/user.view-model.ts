import { User, Role } from '@prisma/client';

/**
 * ViewModel for User entity with safe data for display
 * Excludes sensitive fields (password) and formats role for presentation
 */
export interface IUserViewModel {
  id: string;
  name: string;
  email: string;
  role: {
    value: Role;
    label: string;
    badge: string;
  };
  initials: string;
  createdAt: {
    raw: Date;
    formatted: string;
  };
  isAdmin: boolean;
}

/**
 * Role display configuration
 */
const ROLE_CONFIG: Record<Role, { label: string; badge: string }> = {
  ADMIN: { label: 'Administrateur', badge: 'badge-error' },
  MANAGER: { label: 'Manager', badge: 'badge-warning' },
  MEMBER: { label: 'Membre', badge: 'badge-info' },
};

/**
 * Formats a date to French locale string (dd/MM/yyyy)
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
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
 * Transforms a Prisma User entity into a safe ViewModel for display
 *
 * @param user - Raw Prisma User (password excluded at query level)
 * @returns Formatted user data ready for EJS templates
 *
 * @example
 * ```typescript
 * const user = await userRepo.findById(id);
 * const viewModel = UserViewModel.fromEntity(user);
 * res.render('pages/users/profile', { user: viewModel });
 * ```
 */
export class UserViewModel {
  static fromEntity(user: Omit<User, 'password'>): IUserViewModel {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        value: user.role,
        ...ROLE_CONFIG[user.role],
      },
      initials: getInitials(user.name),
      createdAt: {
        raw: user.createdAt,
        formatted: formatDate(user.createdAt),
      },
      isAdmin: user.role === 'ADMIN',
    };
  }

  /**
   * Transforms an array of Users into ViewModels
   */
  static fromEntityArray(users: Omit<User, 'password'>[]): IUserViewModel[] {
    return users.map((user) => this.fromEntity(user));
  }
}
