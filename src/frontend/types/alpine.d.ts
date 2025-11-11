/**
 * TypeScript type definitions for Alpine.js components
 * Used across the TaskFlow frontend
 */

/**
 * Alpine.js Component with Magic Properties
 */
export interface IAlpineComponent {
  $el: HTMLElement;
  $nextTick(callback: () => void): void;
}

/**
 * Theme Switcher Component
 * Manages dark/light theme toggle with localStorage persistence
 */
export interface IThemeSwitchData {
  isDark: boolean;
  init(): void;
  toggle(): void;
}

/**
 * Modal Dialog Component
 * Manages modal visibility, focus trap, and keyboard navigation
 */
export interface IModalData {
  open: boolean;
  focusTrap: HTMLElement | null;
  show(): void;
  hide(): void;
  handleKeydown(e: KeyboardEvent): void;
}

/**
 * Dropdown Menu Component
 * Handles dropdown toggle with click-outside detection
 */
export interface IDropdownData {
  open: boolean;
  toggle(): void;
  close(): void;
}

/**
 * Form Validation Component
 * Client-side validation with real-time feedback
 */
export interface IValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
}

export interface IFormValidationData {
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  validate(field: string, value: string, rules: IValidationRules): boolean;
  touch(field: string): void;
  hasError(field: string): boolean;
  getError(field: string): string;
}

/**
 * Filters Panel Component
 * Manages collapsible filter sidebar with persistence
 */
export interface IFiltersPanelData {
  open: boolean;
  filters: Record<string, string | number | boolean>;
  toggle(): void;
  reset(): void;
  apply(): void;
}

/**
 * Toast Notification Component
 * Displays temporary notifications with auto-dismiss
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface IToast {
  id: number;
  message: string;
  type: ToastType;
  visible: boolean;
}

export interface IToastManagerData {
  toasts: IToast[];
  nextId: number;
  init(): void;
  show(message: string, type?: ToastType, duration?: number): void;
  dismiss(id: number): void;
  getAlertClass(type: ToastType): string;
  getIcon(type: ToastType): string;
}

/**
 * Inline Edit Component
 * Enables inline editing of text fields with PATCH API
 */
export interface IInlineEditData {
  editing: boolean;
  value: string;
  originalValue: string;
  saving: boolean;
  error: string | null;
  startEdit(): void;
  save(): Promise<void>;
  cancel(): void;
  handleKeydown(e: KeyboardEvent): void;
}

/**
 * Task Search Component
 * Client-side task search with debouncing
 */
export interface ITaskSearchData {
  query: string;
  searching: boolean;
  debounceTimer: number | null;
  search(): void;
  clear(): void;
}

/**
 * Confirmation Dialog Component
 * Confirms destructive actions
 */
export interface IConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export interface IConfirmDialogData {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  show(options?: IConfirmDialogOptions): void;
  confirm(): void;
  close(): void;
}

/**
 * Custom Event Details
 */
export interface IShowFlashEventDetail {
  type: ToastType;
  text: string;
}

/**
 * HTMX Response Headers
 */
export interface IHxTriggerData {
  showSuccess?: string;
  showError?: string;
}

/**
 * Alpine.js Global Types
 */

/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Alpine: {
      data(name: string, callback: () => any): void;
      $persist<T>(value: T): { as(key: string): T };
    };
    htmx: {
      ajax(method: string, url: string, options: { target: string; swap: string }): void;
    };
    themeUtils: {
      applyTheme(isDark: boolean): void;
    };
  }

  interface GlobalEventHandlersEventMap {
    'show-flash': CustomEvent<IShowFlashEventDetail>;
  }
}
/* eslint-enable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */
