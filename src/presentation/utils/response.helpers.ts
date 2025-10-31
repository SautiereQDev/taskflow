/**
 * Response Helpers - HTMX-aware response utilities
 *
 * @module presentation/utils/response.helpers
 */

import type { Request, Response } from 'express';

/**
 * Renders a full page or partial based on HTMX request header
 *
 * @param req - Express request with HTMX detection
 * @param res - Express response
 * @param fullView - Full page view path (e.g., 'pages/tasks/list')
 * @param partialView - Partial view path (e.g., 'partials/task-list')
 * @param data - Data to pass to the view
 *
 * @example
 * ```typescript
 * renderOrPartial(
 *   req,
 *   res,
 *   'pages/tasks/list',
 *   'partials/task-list',
 *   { tasks, pagination }
 * );
 * ```
 */
export function renderOrPartial(
  req: Request,
  res: Response,
  fullView: string,
  partialView: string,
  data: Record<string, unknown> = {}
): void {
  const view = req.isHtmx ? partialView : fullView;
  res.render(view, data);
}

/**
 * Sends an HTMX redirect header for client-side navigation
 *
 * @param res - Express response
 * @param url - URL to redirect to
 *
 * @example
 * ```typescript
 * htmxRedirect(res, '/tasks');
 * ```
 */
export function htmxRedirect(res: Response, url: string): void {
  res.setHeader('HX-Redirect', url);
  res.status(200).end();
}

/**
 * Triggers a full page refresh on the client
 *
 * @param res - Express response
 *
 * @example
 * ```typescript
 * htmxRefresh(res);
 * ```
 */
export function htmxRefresh(res: Response): void {
  res.setHeader('HX-Refresh', 'true');
  res.status(200).end();
}

/**
 * Sends HTMX trigger events to the client
 *
 * @param res - Express response
 * @param events - Event name(s) or event object(s)
 *
 * @example
 * ```typescript
 * // Simple event
 * htmxTrigger(res, 'taskUpdated');
 *
 * // Multiple events
 * htmxTrigger(res, ['taskUpdated', 'refreshList']);
 *
 * // Event with detail
 * htmxTrigger(res, { taskUpdated: { id: '123', title: 'Task 1' } });
 * ```
 */
export function htmxTrigger(
  res: Response,
  events: string | string[] | Record<string, unknown>
): void {
  let triggerValue: string;

  if (typeof events === 'string') {
    triggerValue = events;
  } else if (Array.isArray(events)) {
    triggerValue = events.join(', ');
  } else {
    triggerValue = JSON.stringify(events);
  }

  res.setHeader('HX-Trigger', triggerValue);
}

/**
 * Sends a JSON response for API endpoints
 *
 * @param res - Express response
 * @param statusCode - HTTP status code
 * @param data - Response data
 *
 * @example
 * ```typescript
 * jsonResponse(res, 200, { success: true, task });
 * ```
 */
export function jsonResponse(
  res: Response,
  statusCode: number,
  data: Record<string, unknown>
): void {
  res.status(statusCode).json(data);
}

/**
 * Combines HTMX trigger with response body
 * Useful for updating UI after successful operations
 *
 * @param res - Express response
 * @param events - Event name(s) or event object(s)
 * @param body - HTML content to send
 *
 * @example
 * ```typescript
 * htmxTriggerWithBody(res, 'taskUpdated', '<div>Success!</div>');
 * ```
 */
export function htmxTriggerWithBody(
  res: Response,
  events: string | string[] | Record<string, unknown>,
  body: string
): void {
  htmxTrigger(res, events);
  res.status(200).send(body);
}
