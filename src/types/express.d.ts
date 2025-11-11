// src/types/express.d.ts
/**
 * Express Type Extensions
 *
 * Extends Express.Request and Express.Response with custom properties
 * and type-safe methods for the application.
 */
import type { TFunction } from 'i18next';
import type { UserViewModel } from '@view-models/UserViewModel.js';
import type { IBaseViewData } from '@shared-types/index.js';

declare global {
  namespace Express {
    /**
     * Extended Express Request with application-specific properties
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Request {
      /** HTMX request detection */
      isHtmx: boolean;
      /** Authenticated user (if logged in) */
      user?: UserViewModel;
      /** i18next translation function (namespaced) */
      t: TFunction;
      /** i18next translation function (global) */
      __: TFunction;
      /** Current language code */
      language: string;
      /** Available languages */
      languages: string[];
    }

    /**
     * Extended Express Response with type-safe render method
     *
     * @example
     * ```typescript
     * // Type-safe render with ITaskDetailViewModel
     * res.render<ITaskDetailViewModel>('pages/tasks/detail', {
     *   task: detailView,
     *   user: req.user,
     *   title: 'Task Details'
     * });
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Response {
      /**
       * Render an EJS template with type-safe view data
       *
       * @template T - View data type (should extend IBaseViewData)
       * @param view - Template path (e.g., 'pages/tasks/detail')
       * @param data - View data object matching type T
       * @param callback - Optional callback
       * @returns Response instance (for chaining)
       */
      render<T extends IBaseViewData = IBaseViewData>(
        view: string,
        data?: Partial<T>,
        callback?: (err: Error, html?: string) => void
      ): this;
    }
  }
}
