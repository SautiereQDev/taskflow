/**
 * Alpine.js CSP Build - Content Security Policy compliant
 *
 * This build doesn't require 'unsafe-eval' in CSP headers.
 * Uses @alpinejs/csp which compiles expressions at build time.
 *
 * Plugins loaded:
 * - @alpinejs/persist - localStorage persistence
 * - @alpinejs/intersect - Intersection Observer API
 * - @alpinejs/focus - Focus management utilities
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Alpine.js packages don't have proper TypeScript definitions
import Alpine from '@alpinejs/csp';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import persist from '@alpinejs/persist';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import intersect from '@alpinejs/intersect';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import focus from '@alpinejs/focus';

// Register plugins BEFORE Alpine.start()
Alpine.plugin(persist);
Alpine.plugin(intersect);
Alpine.plugin(focus);

// Expose Alpine globally for components and inline scripts
globalThis.Alpine = Alpine;

// Start Alpine.js
Alpine.start();

console.info('✅ Alpine.js CSP build loaded with plugins: persist, intersect, focus');
