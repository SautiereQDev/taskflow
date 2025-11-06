import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../utils/logger.util.js';

/**
 * Error Response Interface
 *
 * Standardized error response structure sent to clients
 */
interface IErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    context?: Record<string, unknown>;
  };
}

/**
 * Check if request is from HTMX
 *
 * @param req - Express request object
 * @returns True if request is from HTMX
 */
function isHtmxRequest(req: Request): boolean {
  return req.headers['hx-request'] === 'true';
}

/**
 * Global Error Handling Middleware
 *
 * Catches all errors thrown in the application and sends appropriate responses.
 * Handles both operational errors (AppError) and unexpected programming errors.
 *
 * Features:
 * - Different responses for HTMX vs regular requests
 * - Detailed logging for debugging
 * - Safe error messages in production (no stack traces)
 * - Proper HTTP status codes
 *
 * @param error - The error that was thrown
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused but required for signature)
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Determine if this is an operational error (AppError) or programming error
  const isOperational = error instanceof AppError && error.isOperational;
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const context = error instanceof AppError ? error.context : undefined;

  // Log error with appropriate level
  const logContext = {
    message: error.message,
    statusCode,
    context,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  if (isOperational) {
    logger.warn('Operational error occurred', logContext);
  } else {
    logger.error('Unexpected error occurred', logContext);
  }

  // Prepare error response
  const errorResponse: IErrorResponse = {
    success: false,
    error: {
      message:
        process.env.NODE_ENV === 'production' && !isOperational
          ? 'Internal server error'
          : error.message,
      statusCode,
      ...(context && { context }),
    },
  };

  // Handle HTMX requests differently
  if (isHtmxRequest(req)) {
    // For HTMX, render an error partial or send HX-Trigger header
    res.status(statusCode);
    res.setHeader('HX-Trigger', JSON.stringify({ showError: error.message }));
    res.send(`<div class="alert alert-error">${error.message}</div>`);
    return;
  }

  // Send JSON error response for API requests
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found Handler
 *
 * Catches requests to undefined routes and renders a 404 page.
 * It ensures that all necessary variables are available for the layout,
 * even for unauthenticated requests.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  // Ignore requests for static assets to avoid false positives
  if (/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/.exec(req.path)) {
    return next();
  }

  const error = new AppError(`Route not found: ${req.method} ${req.path}`, 404, {
    method: req.method,
    path: req.path,
  });

  // For HTML requests, render the 404 page
  if (req.accepts('html')) {
    // Provide safe defaults for template variables that might be missing
    const user = req.user ?? null;
    const t = req.t ?? ((key: string) => key);
    const __ = req.__ ?? ((key: string) => key);
    const locale = req.language ?? 'fr';

    res.status(404).render('pages/error/404', {
      layout: 'layouts/main',
      title: t('errors.notFound'),
      error,
      t,
      __,
      locale,
      user,
      messages: { success: [], error: [], info: [] },
      activeRoute: 'error',
      metaDescription: 'Page not found',
      pageTitle: '404 Not Found',
    });
  } else {
    // For API requests, pass the error to the main error handler
    next(error);
  }
}
