import { Request } from 'express';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locale: string;
}

export type IAuthenticatedRequest = Request & {
  session: Request['session'] & {
    userId?: string;
    locale?: string;
    initialized?: boolean;
  };
  user?: IUser;
  isHtmx?: boolean;
  i18n?: {
    changeLanguage: (lang: string) => Promise<void>;
    language: string;
  };
  t?: (key: string) => string;
};
