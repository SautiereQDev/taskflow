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
   * Manages collapsible filter sidebar
   */
  Alpine.data('filtersPanel', () => ({
    open: true,
    filters: {},

    toggle() {
      this.open = !this.open;
    },

    reset() {
      this.filters = {};
    },

    apply() {
      // Trigger HTMX request with filters as query params
      const params = new URLSearchParams(this.filters);
      htmx.ajax('GET', `/tasks?${params.toString()}`, {
        target: '#task-list',
        swap: 'outerHTML',
      });
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
