/**
 * URL Building Utilities
 *
 * Helpers for constructing URLs with query parameters
 */

/**
 * Build a query string from an object of parameters
 * Filters out empty values and handles arrays
 *
 * @example
 * buildQueryString({ status: ['TODO', 'DONE'], search: 'test' })
 * // Returns: "status=TODO&status=DONE&search=test"
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      // Handle arrays (e.g., multiple checkboxes)
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, String(item));
        }
      }
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * Build a full URL path with query parameters
 *
 * @example
 * buildUrlWithQuery('/tasks', { status: 'TODO', page: 1 })
 * // Returns: "/tasks?status=TODO&page=1"
 */
export function buildUrlWithQuery(basePath: string, params: Record<string, unknown>): string {
  const queryString = buildQueryString(params);
  return queryString ? `${basePath}?${queryString}` : basePath;
}
