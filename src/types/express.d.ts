// src/types/express.d.ts
import { TFunction } from 'i18next';
import { UserViewModel } from '@view-models/UserViewModel.js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Request {
      isHtmx: boolean;
      user?: UserViewModel;
      t: TFunction;
      __: TFunction;
      language: string;
      languages: string[];
    }
  }
}
