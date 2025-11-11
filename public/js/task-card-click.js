/**
 * Task Card Click Handler
 *
 * Makes entire task cards clickable while preserving action button functionality.
 * CSP-compliant implementation using event delegation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Use event delegation on the document to handle dynamically loaded cards (HTMX)
  document.addEventListener('click', (event) => {
    // Find the closest task card
    const taskCard = event.target.closest('.task-card');

    if (!taskCard) return;

    // Ignore clicks on action buttons and their children
    const isActionClick =
      event.target.closest('.task-card-action') ||
      event.target.closest('.dropdown-content') ||
      event.target.closest('button[hx-post]') ||
      event.target.closest('button[hx-delete]');

    if (isActionClick) return;

    // Navigate to the task detail page
    const taskUrl = taskCard.dataset.taskUrl;
    if (taskUrl) {
      globalThis.location.href = taskUrl;
    }
  });
});
