/**
 * Type declarations for Alpine.js CSP build and plugins
 */

declare module '@alpinejs/csp' {
  export interface IAlpine {
    plugin: (plugin: IAlpinePluginFunction) => void;
    start: () => void;
    data: (name: string, callback: () => Record<string, unknown>) => void;
    $persist: (value: unknown) => {
      as: (key: string) => unknown;
    };
  }

  export type IAlpinePluginFunction = (alpine: IAlpine) => void;

  const Alpine: IAlpine;
  export default Alpine;
}

declare module '@alpinejs/persist' {
  import type { IAlpinePluginFunction } from '@alpinejs/csp';
  const persist: IAlpinePluginFunction;
  export default persist;
}

declare module '@alpinejs/intersect' {
  import type { IAlpinePluginFunction } from '@alpinejs/csp';
  const intersect: IAlpinePluginFunction;
  export default intersect;
}

declare module '@alpinejs/focus' {
  import type { IAlpinePluginFunction } from '@alpinejs/csp';
  const focus: IAlpinePluginFunction;
  export default focus;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    Alpine: import('@alpinejs/csp').IAlpine;
  }
}
