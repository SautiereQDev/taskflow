/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-namespace */
import { Request } from 'express';
import 'express-session';

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

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    theme?: 'light' | 'dark';
    locale?: string;
    initialized?: boolean;
  }
}

declare global {
  namespace Express {
    interface Request {
      isHtmx?: boolean;
      user?: IUser;
      t?: (key: string) => string;
      __?: (key: string) => string;
      i18n?: {
        changeLanguage: (lang: string) => Promise<void>;
        language: string;
      };
    }
  }
}

export type IAuthenticatedRequest = Request;
