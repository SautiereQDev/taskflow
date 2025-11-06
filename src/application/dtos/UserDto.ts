/**
 * User DTO (Data Transfer Object)
 *
 * Complete user representation for API responses.
 * Excludes sensitive data like password hash.
 */
export interface IUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Summary DTO
 *
 * Minimal user data for references in other entities.
 * Used in task assignee/creator fields to avoid over-fetching.
 */
export interface IUserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar: string | null;
  locale: string | null;
}
