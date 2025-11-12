/**
 * Alpine.js Components for TaskFlow
 * Reactive UI components using Alpine.js framework
 */

import type {
  IConfirmDialogData,
  IConfirmDialogOptions,
  IDropdownData,
  IFiltersPanelData,
  IFormValidationData,
  IHxTriggerData,
  IInlineEditData,
  IModalData,
  IShowFlashEventDetail,
  ITaskSearchData,
  IThemeSwitchData,
  IToast,
  IToastManagerData,
  IValidationRules,
  ToastType,
} from '../types/alpine.d.ts';

/**
 * Initialize Alpine.js components on alpine:init event
 */
document.addEventListener('alpine:init', () => {
  /**
   * Theme Switch Component
   * Manages dark/light theme toggle with localStorage persistence
   */
  window.Alpine.data(
    'themeSwitch',
    (): IThemeSwitchData => ({
      isDark: false,

      init() {
        // Get saved theme from themeUtils (uses 'taskflow-theme' key)
        const savedTheme = window.themeUtils.getSavedTheme();
        this.isDark = savedTheme === window.themeUtils.THEME_DARK;
        window.themeUtils.applyTheme(this.isDark);

        // Listen for storage events (sync across tabs)
        window.addEventListener('storage', (e: StorageEvent) => {
          if (e.key === window.themeUtils.STORAGE_KEY && e.newValue) {
            this.isDark = e.newValue === window.themeUtils.THEME_DARK;
            window.themeUtils.applyTheme(this.isDark);
          }
        });
      },

      toggle() {
        this.isDark = !this.isDark;
        const theme = this.isDark ? window.themeUtils.THEME_DARK : window.themeUtils.THEME_LIGHT;
        localStorage.setItem(window.themeUtils.STORAGE_KEY, theme);
        window.themeUtils.applyTheme(this.isDark);
      },
    })
  );

  /**
   * Modal Component
   * Manages modal dialogs with focus trap and keyboard navigation
   */
  window.Alpine.data(
    'modal',
    (): IModalData => ({
      open: false,
      focusTrap: null,

      show() {
        this.open = true;
        document.body.style.overflow = 'hidden';

        // Focus first focusable element
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).$nextTick(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const focusable = (this as any).$el.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable instanceof HTMLElement) {
            focusable.focus();
            this.focusTrap = focusable;
          }
        });
      },

      hide() {
        this.open = false;
        document.body.style.overflow = '';
      },

      handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
          this.hide();
        }
      },
    })
  );

  /**
   * Dropdown Component
   * Handles dropdown menus with click-outside detection
   */
  window.Alpine.data(
    'dropdown',
    (): IDropdownData => ({
      open: false,

      toggle() {
        this.open = !this.open;
      },

      close() {
        this.open = false;
      },
    })
  );

  /**
   * Form Validation Component
   * Client-side form validation with real-time feedback
   */
  window.Alpine.data(
    'formValidation',
    (): IFormValidationData => ({
      errors: {},
      touched: {},

      validate(field: string, value: string, rules: IValidationRules): boolean {
        const errors: string[] = [];

        if (rules.required === true && !value) {
          errors.push('Ce champ est requis');
        }

        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push(`Minimum ${rules.minLength} caractères`);
        }

        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push(`Maximum ${rules.maxLength} caractères`);
        }

        if (rules.email === true && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push('Email invalide');
        }

        this.errors[field] = errors;
        return errors.length === 0;
      },

      touch(field: string) {
        this.touched[field] = true;
      },

      hasError(field: string): boolean {
        return (
          this.touched[field] === true &&
          this.errors[field] !== undefined &&
          this.errors[field].length > 0
        );
      },

      getError(field: string): string {
        return this.hasError(field) ? this.errors[field][0] : '';
      },
    })
  );

  /**
   * Filters Panel Component
   * Manages collapsible filter sidebar with persistence
   */
  window.Alpine.data(
    'filtersPanel',
    (): IFiltersPanelData => ({
      open: window.Alpine.$persist(true).as('filtersPanel_open'),
      filters: window.Alpine.$persist({}).as('taskFilters'),

      toggle() {
        this.open = !this.open;
      },

      reset() {
        this.filters = {};
        // Trigger HTMX to reload with no filters
        window.htmx.ajax('GET', '/tasks', {
          target: '#task-list-container',
          swap: 'innerHTML',
        });
      },

      apply() {
        // Trigger HTMX request with filters as query params
        const params = new URLSearchParams(
          Object.entries(this.filters).map(([key, value]) => [key, String(value)])
        );
        window.htmx.ajax('GET', `/tasks?${params.toString()}`, {
          target: '#task-list-container',
          swap: 'innerHTML',
        });
      },
    })
  );

  /**
   * Toast Notification Component
   * Displays temporary toast notifications with auto-dismiss
   */
  window.Alpine.data(
    'toastManager',
    (): IToastManagerData => ({
      toasts: [],
      nextId: 1,

      init() {
        // Listen for custom flash events
        window.addEventListener('show-flash', (event: CustomEvent<IShowFlashEventDetail>) => {
          this.show(event.detail.text, event.detail.type || 'info');
        });

        // Listen for HTMX success/error events
        document.body.addEventListener('htmx:afterSwap', (event: Event) => {
          const htmxEvent = event as CustomEvent;
          const trigger = htmxEvent.detail?.xhr?.getResponseHeader('HX-Trigger');
          if (trigger) {
            try {
              const data = JSON.parse(trigger) as IHxTriggerData;
              if (data.showSuccess !== undefined) {
                this.show(data.showSuccess, 'success');
              }
              if (data.showError !== undefined) {
                this.show(data.showError, 'error');
              }
            } catch (error) {
              console.error('Failed to parse HX-Trigger:', error);
            }
          }
        });
      },

      show(message: string, type: ToastType = 'info', duration = 4000) {
        const id = this.nextId++;
        const toast: IToast = { id, message, type, visible: true };
        this.toasts.push(toast);

        // Auto-dismiss after duration
        if (duration > 0) {
          setTimeout(() => {
            this.dismiss(id);
          }, duration);
        }
      },

      dismiss(id: number) {
        const index = this.toasts.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.toasts[index].visible = false;
          setTimeout(() => {
            this.toasts = this.toasts.filter((t) => t.id !== id);
          }, 300); // Wait for animation
        }
      },

      getAlertClass(type: ToastType): string {
        const classes: Record<ToastType, string> = {
          success: 'alert-success',
          error: 'alert-error',
          warning: 'alert-warning',
          info: 'alert-info',
        };
        return classes[type] || 'alert-info';
      },

      getIcon(type: ToastType): string {
        const icons: Record<ToastType, string> = {
          success: '✓',
          error: '✕',
          warning: '⚠',
          info: 'ℹ',
        };
        return icons[type] || 'ℹ';
      },
    })
  );

  /**
   * Inline Edit Component
   * Enables inline editing of text fields with PATCH API
   */
  window.Alpine.data(
    'inlineEdit',
    (initialValue = '', endpoint = '', field = ''): IInlineEditData => ({
      editing: false,
      value: initialValue,
      originalValue: initialValue,
      saving: false,
      error: null,

      startEdit() {
        this.editing = true;
        this.originalValue = this.value;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).$nextTick(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const input = (this as any).$el.querySelector('input, textarea');
          if (input instanceof HTMLElement) {
            input.focus();
            if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
              input.select();
            }
          }
        });
      },

      async save() {
        if (this.value === this.originalValue) {
          this.cancel();
          return;
        }

        this.saving = true;
        this.error = null;

        try {
          const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ [field]: this.value }),
          });

          if (!response.ok) {
            throw new Error('Failed to save');
          }

          this.editing = false;
          this.originalValue = this.value;

          // Show success toast
          window.dispatchEvent(
            new CustomEvent<IShowFlashEventDetail>('show-flash', {
              detail: { type: 'success', text: 'Modifications enregistrées' },
            })
          );
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Unknown error';
          window.dispatchEvent(
            new CustomEvent<IShowFlashEventDetail>('show-flash', {
              detail: { type: 'error', text: 'Erreur lors de la sauvegarde' },
            })
          );
        } finally {
          this.saving = false;
        }
      },

      cancel() {
        this.value = this.originalValue;
        this.editing = false;
        this.error = null;
      },

      handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          void this.save();
        } else if (e.key === 'Escape') {
          this.cancel();
        }
      },
    })
  );

  /**
   * Task Search Component
   * Client-side task search with debouncing
   */
  window.Alpine.data(
    'taskSearch',
    (): ITaskSearchData => ({
      query: '',
      searching: false,
      debounceTimer: null,

      search() {
        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
        }
        this.searching = true;

        this.debounceTimer = window.setTimeout(() => {
          // Trigger HTMX search request
          window.htmx.ajax('GET', `/tasks?search=${encodeURIComponent(this.query)}`, {
            target: '#task-list-container',
            swap: 'innerHTML',
          });
          this.searching = false;
        }, 300);
      },

      clear() {
        this.query = '';
        this.search();
      },
    })
  );

  /**
   * Confirmation Dialog Component
   * Confirms destructive actions
   */
  window.Alpine.data(
    'confirmDialog',
    (): IConfirmDialogData => ({
      open: false,
      title: '',
      message: '',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      onConfirm: null,

      show(options: IConfirmDialogOptions = {}) {
        this.title = options.title ?? 'Confirmation';
        this.message = options.message ?? 'Êtes-vous sûr ?';
        this.confirmText = options.confirmText ?? 'Confirmer';
        this.cancelText = options.cancelText ?? 'Annuler';
        this.onConfirm = options.onConfirm ?? null;
        this.open = true;
      },

      confirm() {
        if (this.onConfirm !== null) {
          this.onConfirm();
        }
        this.close();
      },

      close() {
        this.open = false;
        this.onConfirm = null;
      },
    })
  );
});

/**
 * HTMX Event Listeners
 * Global HTMX configuration and event handlers
 */
document.addEventListener('DOMContentLoaded', () => {
  // Show loading indicator on HTMX requests
  document.body.addEventListener('htmx:beforeRequest', () => {
    document.body.classList.add('htmx-loading');
  });

  document.body.addEventListener('htmx:afterRequest', () => {
    document.body.classList.remove('htmx-loading');
  });

  // Handle errors from HX-Trigger header
  document.body.addEventListener('htmx:responseError', (event: Event) => {
    const htmxEvent = event as CustomEvent;
    const triggerHeader = htmxEvent.detail?.xhr?.getResponseHeader('HX-Trigger');
    if (triggerHeader) {
      try {
        const data = JSON.parse(triggerHeader) as IHxTriggerData;
        if (data.showError !== undefined) {
          // Dispatch custom event for flash message system
          window.dispatchEvent(
            new CustomEvent<IShowFlashEventDetail>('show-flash', {
              detail: { type: 'error', text: data.showError },
            })
          );
        }
      } catch (error) {
        console.error('Failed to parse HX-Trigger header:', error);
      }
    }
  });

  // Handle successful mutations
  document.body.addEventListener('htmx:afterSwap', (event: Event) => {
    const htmxEvent = event as CustomEvent;
    const triggerHeader = htmxEvent.detail?.xhr?.getResponseHeader('HX-Trigger');
    if (triggerHeader) {
      try {
        const data = JSON.parse(triggerHeader) as IHxTriggerData;
        if (data.showSuccess !== undefined) {
          window.dispatchEvent(
            new CustomEvent<IShowFlashEventDetail>('show-flash', {
              detail: { type: 'success', text: data.showSuccess },
            })
          );
        }
      } catch (error) {
        console.error('Failed to parse HX-Trigger header:', error);
      }
    }
  });
});
