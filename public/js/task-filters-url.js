/**
 * Task Filters URL Update
 *
 * Manually updates browser URL when HTMX filter responses arrive.
 * This ensures URL stays in sync with filter state.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Task Filters] URL update script loaded');

  // Listen for HTMX after swap events on the task list container
  document.body.addEventListener('htmx:afterSwap', (event) => {
    console.log('[Task Filters] htmx:afterSwap event', event.detail);

    // Check if this is a filter update (target is task list container)
    if (event.detail.target && event.detail.target.id === 'task-list-container') {
      console.log('[Task Filters] Updating URL after filter change');

      // Get the form element
      const form = document.getElementById('filters-form');
      if (!form) {
        console.warn('[Task Filters] Form not found');
        return;
      }

      // Serialize form data to URL search params
      const formData = new FormData(form);
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        if (value && value !== '') {
          params.append(key, value);
        }
      }

      // Build new URL
      const newUrl = params.toString() ? `/tasks?${params.toString()}` : '/tasks';

      console.log('[Task Filters] New URL:', newUrl);

      // Update browser history without reload
      window.history.pushState({}, '', newUrl);
    }
  });
});
