import type { Request, Response, NextFunction } from 'express';

/**
 * HTMX Request Detection Interface
 *
 * Extends Express Request with HTMX-specific properties
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Request {
      /**
       * True if request is from HTMX
       */
      isHtmx: boolean;

      /**
       * True if request is a boosted navigation
       */
      isBoosted: boolean;

      /**
       * ID of the target element (from hx-target)
       */
      htmxTarget?: string;

      /**
       * Current URL in browser (from hx-current-url)
       */
      htmxCurrentUrl?: string;

      /**
       * Name of triggered element (from hx-trigger-name)
       */
      htmxTriggerName?: string;
    }
  }
}

/**
 * HTMX Detection Middleware
 *
 * Detects HTMX requests and adds helper properties to the request object.
 * This allows controllers to differentiate between full page loads and partial updates.
 *
 * HTMX headers:
 * - HX-Request: Always "true" for HTMX requests
 * - HX-Boosted: "true" for boosted navigation
 * - HX-Target: ID of the target element
 * - HX-Current-URL: Current URL in the browser
 * - HX-Trigger-Name: Name of the element that triggered the request
 *
 * Usage in controllers:
 * ```typescript
 * if (req.isHtmx) {
 *   // Render partial HTML
 *   return res.render('partials/task-list', { tasks });
 * }
 * // Render full page
 * return res.render('pages/tasks/index', { tasks });
 * ```
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 */
export function htmxMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Detect HTMX request
  req.isHtmx = req.headers['hx-request'] === 'true';

  // Detect boosted navigation
  req.isBoosted = req.headers['hx-boosted'] === 'true';

  // Extract HTMX-specific headers
  req.htmxTarget = req.headers['hx-target'] as string | undefined;
  req.htmxCurrentUrl = req.headers['hx-current-url'] as string | undefined;
  req.htmxTriggerName = req.headers['hx-trigger-name'] as string | undefined;

  next();
}
