/**
 * Alpine.js Data Components
 * Register global Alpine.js components used across the application
 * This file must load AFTER Alpine CDN but BEFORE Alpine.start()
 */

document.addEventListener('alpine:init', () => {
  /**
   * Theme Switcher Component
   * Manages light/dark theme toggle with localStorage persistence
   */
  Alpine.data('themeSwitch', () => ({
    isDark: false,

    init() {
      // Initialize from saved theme
      const current = window.themeUtils.getSavedTheme();
      this.isDark = current === window.themeUtils.THEME_DARK;

      // Watch for external theme changes (e.g., from another tab)
      window.addEventListener('storage', (e) => {
        if (e.key === window.themeUtils.STORAGE_KEY) {
          this.isDark = e.newValue === window.themeUtils.THEME_DARK;
        }
      });
    },

    toggle() {
      this.isDark = !this.isDark;
      const newTheme = this.isDark ? window.themeUtils.THEME_DARK : window.themeUtils.THEME_LIGHT;

      // Apply theme
      window.themeUtils.applyTheme(newTheme);

      // Save to localStorage
      try {
        localStorage.setItem(window.themeUtils.STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    },
  }));

  /**
   * Modal Component
   * Manages modal dialogs with keyboard navigation and focus trapping
   */
  Alpine.data('modal', (initialOpen = false) => ({
    open: initialOpen,
    focusTrap: null,

    show() {
      this.open = true;
      document.body.style.overflow = 'hidden';
      this.$nextTick(() => {
        // Focus first focusable element
        const firstFocusable = this.$el.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) firstFocusable.focus();
      });
    },

    hide() {
      this.open = false;
      document.body.style.overflow = '';
    },

    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.hide();
      }
    },
  }));

  /**
   * Dropdown Component
   * Manages dropdown menus with click-outside detection
   */
  Alpine.data('dropdown', (initialOpen = false) => ({
    open: initialOpen,

    toggle() {
      this.open = !this.open;
    },

    close() {
      this.open = false;
    },

    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.close();
      }
    },
  }));

  /**
   * Form Validation Component
   * Client-side form validation with real-time feedback
   */
  Alpine.data('formValidation', () => ({
    errors: {},
    touched: {},

    validate(field, value, rules) {
      const errors = [];

      if (rules.required && !value) {
        errors.push('Ce champ est requis');
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Minimum ${rules.minLength} caractères`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Maximum ${rules.maxLength} caractères`);
      }

      if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('Email invalide');
      }

      this.errors[field] = errors;
      return errors.length === 0;
    },

    touch(field) {
      this.touched[field] = true;
    },

    hasError(field) {
      return this.touched[field] && this.errors[field] && this.errors[field].length > 0;
    },

    getError(field) {
      return this.hasError(field) ? this.errors[field][0] : '';
    },
  }));

  /**
   * Filters Panel Component
   * Manages collapsible filter sidebar with persistence
   */
  Alpine.data('filtersPanel', () => ({
    open: Alpine.$persist(true).as('filtersPanel_open'),
    filters: Alpine.$persist({}).as('taskFilters'),

    toggle() {
      this.open = !this.open;
    },

    reset() {
      this.filters = {};
      // Trigger HTMX to reload with no filters
      htmx.ajax('GET', '/tasks', {
        target: '#task-list-container',
        swap: 'innerHTML',
      });
    },

    apply() {
      // Trigger HTMX request with filters as query params
      const params = new URLSearchParams(this.filters);
      htmx.ajax('GET', `/tasks?${params.toString()}`, {
        target: '#task-list-container',
        swap: 'innerHTML',
      });
    },
  }));

  /**
   * Toast Notification Component
   * Displays temporary toast notifications with auto-dismiss
   */
  Alpine.data('toastManager', () => ({
    toasts: [],
    nextId: 1,

    init() {
      // Listen for custom flash events
      window.addEventListener('show-flash', (event) => {
        this.show(event.detail.text, event.detail.type || 'info');
      });

      // Listen for HTMX success/error events
      document.body.addEventListener('htmx:afterSwap', (event) => {
        const trigger = event.detail.xhr.getResponseHeader('HX-Trigger');
        if (trigger) {
          try {
            const data = JSON.parse(trigger);
            if (data.showSuccess) {
              this.show(data.showSuccess, 'success');
            }
            if (data.showError) {
              this.show(data.showError, 'error');
            }
          } catch (error) {
            console.error('Failed to parse HX-Trigger:', error);
          }
        }
      });
    },

    show(message, type = 'info', duration = 4000) {
      const id = this.nextId++;
      const toast = { id, message, type, visible: true };
      this.toasts.push(toast);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration);
      }
    },

    dismiss(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.toasts[index].visible = false;
        setTimeout(() => {
          this.toasts = this.toasts.filter((t) => t.id !== id);
        }, 300); // Wait for animation
      }
    },

    getAlertClass(type) {
      const classes = {
        success: 'alert-success',
        error: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info',
      };
      return classes[type] || 'alert-info';
    },

    getIcon(type) {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
      };
      return icons[type] || 'ℹ';
    },
  }));

  /**
   * Inline Edit Component
   * Enables inline editing of text fields
   */
  Alpine.data('inlineEdit', (initialValue = '', endpoint = '', field = '') => ({
    editing: false,
    value: initialValue,
    originalValue: initialValue,
    saving: false,
    error: null,

    startEdit() {
      this.editing = true;
      this.originalValue = this.value;
      this.$nextTick(() => {
        const input = this.$el.querySelector('input, textarea');
        if (input) {
          input.focus();
          input.select();
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
          new CustomEvent('show-flash', {
            detail: { type: 'success', text: 'Modifications enregistrées' },
          })
        );
      } catch (error) {
        this.error = error.message;
        window.dispatchEvent(
          new CustomEvent('show-flash', {
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

    handleKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.save();
      } else if (e.key === 'Escape') {
        this.cancel();
      }
    },
  }));

  /**
   * Task Search Component
   * Client-side task search with debouncing
   */
  Alpine.data('taskSearch', () => ({
    query: '',
    searching: false,
    debounceTimer: null,

    search() {
      clearTimeout(this.debounceTimer);
      this.searching = true;

      this.debounceTimer = setTimeout(() => {
        // Trigger HTMX search request
        htmx.ajax('GET', `/tasks?search=${encodeURIComponent(this.query)}`, {
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
  }));

  /**
   * Confirmation Dialog Component
   * Confirms destructive actions
   */
  Alpine.data('confirmDialog', () => ({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    onConfirm: null,

    show(options = {}) {
      this.title = options.title || 'Confirmation';
      this.message = options.message || 'Êtes-vous sûr ?';
      this.confirmText = options.confirmText || 'Confirmer';
      this.cancelText = options.cancelText || 'Annuler';
      this.onConfirm = options.onConfirm || null;
      this.open = true;
    },

    confirm() {
      if (this.onConfirm) {
        this.onConfirm();
      }
      this.close();
    },

    close() {
      this.open = false;
      this.onConfirm = null;
    },
  }));
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
  document.body.addEventListener('htmx:responseError', (event) => {
    const triggerHeader = event.detail.xhr.getResponseHeader('HX-Trigger');
    if (triggerHeader) {
      try {
        const data = JSON.parse(triggerHeader);
        if (data.showError) {
          // Dispatch custom event for flash message system
          window.dispatchEvent(
            new CustomEvent('show-flash', {
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
  document.body.addEventListener('htmx:afterSwap', (event) => {
    const triggerHeader = event.detail.xhr.getResponseHeader('HX-Trigger');
    if (triggerHeader) {
      try {
        const data = JSON.parse(triggerHeader);
        if (data.showSuccess) {
          window.dispatchEvent(
            new CustomEvent('show-flash', {
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
