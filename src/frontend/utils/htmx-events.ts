/**
 * HTMX Custom Events Handler
 * Handles custom HTMX events like task count updates
 * Adds CSRF token to all HTMX requests
 */

interface IHtmxConfigRequestDetail {
  headers: Record<string, string>;
  [key: string]: unknown;
}

interface ITaskCountDetail {
  total: number;
  [key: string]: unknown;
}

document.addEventListener('DOMContentLoaded', () => {
  // Add CSRF token to all HTMX requests
  document.body.addEventListener('htmx:configRequest', (event: Event) => {
    const customEvent = event as CustomEvent<IHtmxConfigRequestDetail>;

    // Get CSRF token from meta tag or form input
    const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    const csrfInput = document.querySelector<HTMLInputElement>('input[name="_csrf"]');
    const csrfToken = csrfMeta?.getAttribute('content') ?? csrfInput?.value;

    if (csrfToken !== undefined) {
      // Add CSRF token as header for AJAX requests
      customEvent.detail.headers['X-CSRF-Token'] = csrfToken;
    }
  });

  // Listen for task count updates
  document.body.addEventListener('updateTaskCount', (event: Event) => {
    const customEvent = event as CustomEvent<ITaskCountDetail>;
    const detail = customEvent.detail;

    if (detail !== null && typeof detail.total === 'number') {
      const taskCountElement = document.getElementById('task-count');
      if (taskCountElement !== null) {
        taskCountElement.textContent = `${detail.total} tâche(s) au total`;
      }
    }
  });

  // Listen for task creation events
  document.body.addEventListener('taskCreated', () => {
    // Could show a toast notification or refresh the task list
    console.info('Task created successfully');
  });

  // Listen for task update events
  document.body.addEventListener('taskUpdated', () => {
    console.info('Task updated successfully');
  });

  // Listen for task deletion events
  document.body.addEventListener('taskDeleted', () => {
    console.info('Task deleted successfully');
  });
});
