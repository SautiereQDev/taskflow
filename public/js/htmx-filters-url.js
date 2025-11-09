/**
 * HTMX 2.0 - Task Filters Enhancement
 *
 * Pattern: JavaScript listens to form input changes and triggers HTMX request
 * Form has hx-get="/tasks" hx-trigger="submit" - HTMX handles submit events
 * We manually trigger the submit event when filters change
 *
 * CRITICAL: We also intercept htmx:configRequest to remove empty parameters
 */

document.addEventListener('DOMContentLoaded', () => {
  const filtersForm = document.getElementById('filters-form');

  if (!filtersForm) return;

  let debounceTimer = null;

  // Function to trigger HTMX request via submit event
  const triggerFilterUpdate = () => {
    // Clear any pending debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce: wait 300ms after last change before triggering
    debounceTimer = setTimeout(() => {
      console.log('[Filter] Triggering HTMX request');

      // Use HTMX's API to trigger the request
      // This ensures HTMX adds the hx-request header and processes the response correctly
      htmx.trigger(filtersForm, 'submit');
    }, 300);
  };

  // Listen to changes on all filter inputs
  const filterInputs = filtersForm.querySelectorAll(
    'input[type="checkbox"], input[type="radio"], input[type="text"], input[type="search"], select'
  );

  console.log(`[Filter] Found ${filterInputs.length} filter inputs`);

  for (const input of filterInputs) {
    // For checkboxes and radios, trigger on change
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.addEventListener('change', (e) => {
        console.log(`[Filter] ${input.type} changed:`, input.name, input.value, input.checked);
        triggerFilterUpdate();
      });
    }

    // For text inputs, trigger on input (typing)
    if (input.type === 'text' || input.type === 'search') {
      input.addEventListener('input', () => {
        console.log(`[Filter] Text input changed:`, input.name, input.value);
        triggerFilterUpdate();
      });
    }

    // For select, trigger on change
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => {
        console.log(`[Filter] Select changed:`, input.name, input.value);
        triggerFilterUpdate();
      });
    }
  }

  // CRITICAL: Intercept HTMX request configuration to filter empty parameters
  // This prevents sending ?search=&assigneeId=&dueDateFilter= in the URL
  document.body.addEventListener('htmx:configRequest', (event) => {
    // Only process events from our filters form
    if (event.detail.elt !== filtersForm && !filtersForm.contains(event.detail.elt)) {
      return;
    }

    console.log('[Filter] Intercepting HTMX configRequest');

    // In HTMX 2.0, parameters can be FormData or plain object
    // We need to handle both cases
    const params = event.detail.parameters;

    // Convert to plain object, handling multiple values with same key
    let paramsObj = {};
    if (params instanceof FormData) {
      // Use getAll() to handle multiple checkboxes with same name
      const keys = new Set();
      for (const key of params.keys()) {
        keys.add(key);
      }

      for (const key of keys) {
        const values = params.getAll(key);
        // If multiple values, keep as array; if single value, keep as string
        paramsObj[key] = values.length > 1 ? values : values[0];
      }
    } else {
      paramsObj = { ...params };
    }

    console.log('[Filter] Original parameters:', paramsObj);

    // Filter out empty parameters
    const filteredParams = {};
    for (const key in paramsObj) {
      const value = paramsObj[key];

      // Handle arrays (multiple checkboxes)
      if (Array.isArray(value)) {
        const nonEmpty = value.filter((v) => v && v.trim() !== '');
        if (nonEmpty.length > 0) {
          filteredParams[key] = nonEmpty;
        }
      }
      // Handle strings
      else if (value && typeof value === 'string' && value.trim() !== '') {
        filteredParams[key] = value;
      }
    }

    // Replace parameters with filtered version (as plain object)
    event.detail.parameters = filteredParams;
    console.log('[Filter] Filtered parameters:', filteredParams);
  });

  // Handle form submit button (no debounce, immediate trigger)
  filtersForm.addEventListener('submit', (e) => {
    console.log('[Filter] Form submitted');
    // Clear debounce timer if exists
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    // Let HTMX handle the submit naturally (don't prevent default)
  });

  // Handle reset button
  const resetButton = document.getElementById('reset-filters-btn');
  if (resetButton) {
    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[Filter] Reset button clicked');

      // Reset the form
      filtersForm.reset();

      // Trigger HTMX to reload with clean form (no filters)
      htmx.trigger(filtersForm, 'submit');
    });
  }

  console.log('[Filter] Initialization complete');
});
