/**
 * TypeScript declarations for HTMX 2.0.x
 *
 * These type declarations provide basic type safety for HTMX usage.
 * The htmx.org package doesn't ship with official TypeScript definitions.
 *
 * @see https://htmx.org/api/
 */

/**
 * HTMX module declaration for ESM imports
 */
declare module 'htmx.org/dist/htmx.esm.js' {
  const htmx: IHtmx;
  export default htmx;
}

/**
 * HTMX loading-states extension module
 */
declare module 'htmx-ext-loading-states' {
  // Extension registers itself with HTMX, no exports needed
}

/**
 * HTMX Core API Interface
 *
 * This is a subset of the full HTMX API, covering the most commonly used methods.
 * For complete API documentation, see https://htmx.org/api/
 */
export interface IHtmx {
  /**
   * HTMX configuration object
   */
  config: IHtmxConfig;

  /**
   * Process an element to activate HTMX behavior
   * @param elt Element to process
   */
  process: (elt: Element) => void;

  /**
   * Find an element matching a selector
   * @param selector CSS selector or element
   * @param context Optional context element
   */
  find: (selector: string | Element, context?: Element) => Element | null;

  /**
   * Find all elements matching a selector
   * @param selector CSS selector
   * @param context Optional context element
   */
  findAll: (selector: string, context?: Element) => NodeListOf<Element>;

  /**
   * Trigger a client-side event
   * @param target Target element or selector
   * @param name Event name
   * @param detail Event detail object
   */
  trigger: (target: string | Element, name: string, detail?: unknown) => boolean;

  /**
   * Add an event listener to HTMX
   * @param target Target element or selector
   * @param name Event name
   * @param listener Event listener function
   */
  on: (target: string | Element, name: string, listener: EventListener) => void;

  /**
   * Remove an event listener from HTMX
   * @param target Target element or selector
   * @param name Event name
   * @param listener Event listener function
   */
  off: (target: string | Element, name: string, listener: EventListener) => void;

  /**
   * Parse an HTML string into a document fragment
   * @param html HTML string
   */
  parseInterval: (interval: string) => number;

  /**
   * Get the closest element matching a selector
   * @param elt Starting element
   * @param selector CSS selector
   */
  closest: (elt: Element, selector: string) => Element | null;
}

/**
 * HTMX Configuration Interface
 *
 * @see https://htmx.org/docs/#config
 */
export interface IHtmxConfig {
  /**
   * The number of milliseconds a request can take before automatically being terminated
   */
  timeout: number;

  /**
   * The default swap style to use if hx-swap is omitted
   */
  defaultSwapStyle: string;

  /**
   * The default swap delay between requests
   */
  defaultSwapDelay: number;

  /**
   * The default settle delay between requests
   */
  defaultSettleDelay: number;

  /**
   * Include the X-HX-History-Restore-Request header
   */
  includeIndicatorStyles: boolean;

  /**
   * The class to place on indicators when a request is in flight
   */
  indicatorClass: string;

  /**
   * The class to place on triggering elements when a request is in flight
   */
  requestClass: string;

  /**
   * Whether to use history
   */
  historyCacheSize: number;

  /**
   * Scroll behavior
   */
  scrollBehavior: 'auto' | 'instant' | 'smooth';

  /**
   * Default focus scroll behavior
   */
  defaultFocusScroll: boolean;

  /**
   * Use experimental inline script evaluation
   */
  allowEval: boolean;

  /**
   * Allow scripts in responses
   */
  allowScriptTags: boolean;

  /**
   * Inline style behavior
   */
  inlineStyleNonce: string;

  /**
   * Inline script nonce for CSP
   */
  inlineScriptNonce: string;
}

/**
 * Global Window extension for HTMX
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    htmx: IHtmx;
  }

  var htmx: IHtmx;
}
