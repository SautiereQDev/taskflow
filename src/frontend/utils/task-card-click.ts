/**
 * Task Card Click Handler
 *
 * Makes entire task cards clickable while preserving action button functionality.
 * CSP-compliant implementation using event delegation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Use event delegation on the document to handle dynamically loaded cards (HTMX)
  document.addEventListener('click', (event: MouseEvent) => {
    // Find the closest task card
    const target = event.target as HTMLElement;
    const taskCard = target.closest<HTMLElement>('.task-card');

    if (taskCard === null) return;

    // Ignore clicks on action buttons and their children
    const isActionClick =
      target.closest('.task-card-action') !== null ||
      target.closest('.dropdown-content') !== null ||
      target.closest('button[hx-post]') !== null ||
      target.closest('button[hx-delete]') !== null;

    if (isActionClick) return;

    // Navigate to the task detail page
    const taskUrl = taskCard.dataset.taskUrl;
    if (taskUrl !== undefined) {
      globalThis.location.href = taskUrl;
    }
  });
});
