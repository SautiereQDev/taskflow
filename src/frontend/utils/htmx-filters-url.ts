/**
 * HTMX 2.0 - Task Filters Enhancement
 *
 * Pattern: JavaScript listens to form input changes and triggers HTMX request
 * Form has hx-get="/tasks" hx-trigger="submit" - HTMX handles submit events
 * We manually trigger the submit event when filters change
 *
 * CRITICAL: We also intercept htmx:configRequest to remove empty parameters
 */

interface IHtmxConfigRequestDetail {
  elt: HTMLElement;
  parameters: FormData | Record<string, unknown>;
  [key: string]: unknown;
}

interface IHtmx {
  trigger: (elt: HTMLElement, eventName: string) => void;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    htmx: IHtmx;
  }
}

/**
 * Convert FormData or object to plain object
 */
function convertFormDataToObject(
  params: FormData | Record<string, unknown>
): Record<string, string | string[]> {
  if (params instanceof FormData) {
    const result: Record<string, string | string[]> = {};
    const keys = new Set<string>();
    for (const key of params.keys()) {
      keys.add(key);
    }
    for (const key of keys) {
      const values = params.getAll(key).map((v) => (typeof v === 'string' ? v : v.name));
      result[key] = values.length > 1 ? values : values[0];
    }
    return result;
  }
  return { ...(params as Record<string, string>) };
}

/**
 * Filter out empty values from parameters
 */
function filterEmptyValues(
  paramsObj: Record<string, string | string[]>
): Record<string, string | string[]> {
  const filtered: Record<string, string | string[]> = {};
  for (const key in paramsObj) {
    const value = paramsObj[key];
    if (Array.isArray(value)) {
      const nonEmpty = value.filter((v) => v !== null && v.trim() !== '');
      if (nonEmpty.length > 0) {
        filtered[key] = nonEmpty;
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      filtered[key] = value;
    }
  }
  return filtered;
}

/**
 * Convert and filter empty parameters
 */
function filterEmptyParameters(
  params: FormData | Record<string, unknown>
): Record<string, string | string[]> {
  const paramsObj = convertFormDataToObject(params);
  console.info('[Filter] Original parameters:', paramsObj);
  return filterEmptyValues(paramsObj);
}

document.addEventListener('DOMContentLoaded', () => {
  const filtersForm = document.getElementById('filters-form') as HTMLFormElement | null;

  if (filtersForm === null) return;

  let debounceTimer: number | null = null;

  // Function to trigger HTMX request via submit event
  const triggerFilterUpdate = (): void => {
    // Clear any pending debounce
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }

    // Debounce: wait 300ms after last change before triggering
    debounceTimer = globalThis.setTimeout(() => {
      console.info('[Filter] Triggering HTMX request');

      // Use HTMX's API to trigger the request
      const htmx = globalThis.htmx as IHtmx | undefined;
      if (htmx?.trigger) {
        htmx.trigger(filtersForm, 'submit');
      }
    }, 300);
  };

  // Listen to changes on all filter inputs
  const filterInputs = filtersForm.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    'input[type="checkbox"], input[type="radio"], input[type="text"], input[type="search"], select'
  );

  console.info(`[Filter] Found ${filterInputs.length} filter inputs`);

  for (const input of filterInputs) {
    // For checkboxes and radios, trigger on change
    if (
      input instanceof HTMLInputElement &&
      (input.type === 'checkbox' || input.type === 'radio')
    ) {
      input.addEventListener('change', () => {
        console.info(`[Filter] ${input.type} changed:`, input.name, input.value, input.checked);
        triggerFilterUpdate();
      });
    }

    // For text inputs, trigger on input (typing)
    if (input instanceof HTMLInputElement && (input.type === 'text' || input.type === 'search')) {
      input.addEventListener('input', () => {
        console.info(`[Filter] Text input changed:`, input.name, input.value);
        triggerFilterUpdate();
      });
    }

    // For select, trigger on change
    if (input instanceof HTMLSelectElement) {
      input.addEventListener('change', () => {
        console.info(`[Filter] Select changed:`, input.name, input.value);
        triggerFilterUpdate();
      });
    }
  }

  // CRITICAL: Intercept HTMX request configuration to filter empty parameters
  // This prevents sending ?search=&assigneeId=&dueDateFilter= in the URL
  document.body.addEventListener('htmx:configRequest', (event: Event) => {
    const customEvent = event as CustomEvent<IHtmxConfigRequestDetail>;

    // Only process events from our filters form
    if (customEvent.detail.elt !== filtersForm && !filtersForm.contains(customEvent.detail.elt)) {
      return;
    }

    console.info('[Filter] Intercepting HTMX configRequest');
    customEvent.detail.parameters = filterEmptyParameters(customEvent.detail.parameters);
    console.info('[Filter] Filtered parameters:', customEvent.detail.parameters);
  });

  // Handle form submit button (no debounce, immediate trigger)
  filtersForm.addEventListener('submit', () => {
    console.info('[Filter] Form submitted');
    // Clear debounce timer if exists
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    // Let HTMX handle the submit naturally (don't prevent default)
  });

  // Handle reset button
  const resetButton = document.getElementById('reset-filters-btn');
  if (resetButton !== null) {
    resetButton.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      console.info('[Filter] Reset button clicked');

      // Reset the form
      filtersForm.reset();

      // Trigger HTMX to reload with clean form (no filters)
      const htmx = globalThis.htmx as IHtmx | undefined;
      if (htmx?.trigger) {
        htmx.trigger(filtersForm, 'submit');
      }
    });
  }

  console.info('[Filter] Initialization complete');
});
