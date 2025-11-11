/**
 * Task Filters URL Update
 *
 * Manually updates browser URL when HTMX filter responses arrive.
 * This ensures URL stays in sync with filter state.
 */

interface IHtmxAfterSwapDetail {
  target: HTMLElement;
  [key: string]: unknown;
}

document.addEventListener('DOMContentLoaded', () => {
  console.info('[Task Filters] URL update script loaded');

  // Listen for HTMX after swap events on the task list container
  document.body.addEventListener('htmx:afterSwap', (event: Event) => {
    const customEvent = event as CustomEvent<IHtmxAfterSwapDetail>;
    console.info('[Task Filters] htmx:afterSwap event', customEvent.detail);

    // Check if this is a filter update (target is task list container)
    if (customEvent.detail.target?.id === 'task-list-container') {
      console.info('[Task Filters] Updating URL after filter change');

      // Get the form element
      const form = document.getElementById('filters-form') as HTMLFormElement | null;
      if (form === null) {
        console.warn('[Task Filters] Form not found');
        return;
      }

      // Serialize form data to URL search params
      const formData = new FormData(form);
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        // FormData values are File or string
        const stringValue = typeof value === 'string' ? value : value.name;
        if (stringValue !== null && stringValue !== '') {
          params.append(key, stringValue);
        }
      }

      // Build new URL
      const newUrl = params.toString() === '' ? '/tasks' : `/tasks?${params.toString()}`;

      console.info('[Task Filters] New URL:', newUrl);

      // Update browser history without reload
      globalThis.history.pushState({}, '', newUrl);
    }
  });
});
