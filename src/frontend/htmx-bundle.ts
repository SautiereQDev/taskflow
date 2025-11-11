/**
 * HTMX Bundle - Phase 5.4-HTMX
 *
 * Bundles HTMX 2.0.7 with loading-states extension for local deployment.
 * This eliminates the last CDN dependency (unpkg.com) and hardens CSP.
 *
 * @see https://htmx.org/docs/
 * @see https://htmx.org/extensions/loading-states/
 */

// Import HTMX 2.0.7 ESM module
// @ts-expect-error - htmx.org package doesn't ship with TypeScript definitions
import htmx from 'htmx.org/dist/htmx.esm.js';

// Import loading-states extension
// @ts-expect-error - htmx-ext-loading-states doesn't ship with TypeScript definitions
import 'htmx-ext-loading-states';

// Expose HTMX globally for compatibility with inline scripts
// Use globalThis instead of window for better compatibility
globalThis.htmx = htmx;

// Verify HTMX is loaded
if (globalThis.htmx === undefined) {
  console.error('[HTMX Bundle] Failed to load HTMX');
} else {
  console.info('[HTMX Bundle] HTMX 2.0.7 loaded successfully');
}
