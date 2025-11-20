import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => console.info(`[INFO] ${msg}`, meta ?? ''),
  error: (msg: string, meta?: unknown) => console.error(`[ERROR] ${msg}`, meta ?? ''),
  debug: (msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DEBUG] ${msg}`, meta ?? '');
    }
  },
};

export const passwordUtils = {
  hash: async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  },
  compare: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },
};

export const renderOrPartial = (
  req: Request,
  res: Response,
  view: string,
  partial: string,
  data: Record<string, unknown>
) => {
  if (req.get('HX-Request')) {
    res.render(partial, { ...data, layout: false });
  } else {
    res.render(view, data);
  }
};

export const htmxRedirect = (res: Response, path: string) => {
  res.setHeader('HX-Redirect', path);
  res.status(200).send();
};
