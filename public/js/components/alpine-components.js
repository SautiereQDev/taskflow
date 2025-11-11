'use strict';
(() => {
  // src/frontend/components/alpine-components.ts
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('themeSwitch', () => ({
      isDark: false,
      init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          this.isDark = savedTheme === 'dark';
        } else {
          this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        window.themeUtils.applyTheme(this.isDark);
        window.addEventListener('storage', (e) => {
          if (e.key === 'theme' && e.newValue) {
            this.isDark = e.newValue === 'dark';
            window.themeUtils.applyTheme(this.isDark);
          }
        });
      },
      toggle() {
        this.isDark = !this.isDark;
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
        window.themeUtils.applyTheme(this.isDark);
      },
    }));
    window.Alpine.data('modal', () => ({
      open: false,
      focusTrap: null,
      show() {
        this.open = true;
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          const focusable = this.$el.querySelector(
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
      handleKeydown(e) {
        if (e.key === 'Escape') {
          this.hide();
        }
      },
    }));
    window.Alpine.data('dropdown', () => ({
      open: false,
      toggle() {
        this.open = !this.open;
      },
      close() {
        this.open = false;
      },
    }));
    window.Alpine.data('formValidation', () => ({
      errors: {},
      touched: {},
      validate(field, value, rules) {
        const errors = [];
        if (rules.required === true && !value) {
          errors.push('Ce champ est requis');
        }
        if (rules.minLength !== void 0 && value.length < rules.minLength) {
          errors.push(`Minimum ${rules.minLength} caract\xE8res`);
        }
        if (rules.maxLength !== void 0 && value.length > rules.maxLength) {
          errors.push(`Maximum ${rules.maxLength} caract\xE8res`);
        }
        if (rules.email === true && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push('Email invalide');
        }
        this.errors[field] = errors;
        return errors.length === 0;
      },
      touch(field) {
        this.touched[field] = true;
      },
      hasError(field) {
        return (
          this.touched[field] === true &&
          this.errors[field] !== void 0 &&
          this.errors[field].length > 0
        );
      },
      getError(field) {
        return this.hasError(field) ? this.errors[field][0] : '';
      },
    }));
    window.Alpine.data('filtersPanel', () => ({
      open: window.Alpine.$persist(true).as('filtersPanel_open'),
      filters: window.Alpine.$persist({}).as('taskFilters'),
      toggle() {
        this.open = !this.open;
      },
      reset() {
        this.filters = {};
        window.htmx.ajax('GET', '/tasks', {
          target: '#task-list-container',
          swap: 'innerHTML',
        });
      },
      apply() {
        const params = new URLSearchParams(
          Object.entries(this.filters).map(([key, value]) => [key, String(value)])
        );
        window.htmx.ajax('GET', `/tasks?${params.toString()}`, {
          target: '#task-list-container',
          swap: 'innerHTML',
        });
      },
    }));
    window.Alpine.data('toastManager', () => ({
      toasts: [],
      nextId: 1,
      init() {
        window.addEventListener('show-flash', (event) => {
          this.show(event.detail.text, event.detail.type || 'info');
        });
        document.body.addEventListener('htmx:afterSwap', (event) => {
          const htmxEvent = event;
          const trigger = htmxEvent.detail?.xhr?.getResponseHeader('HX-Trigger');
          if (trigger) {
            try {
              const data = JSON.parse(trigger);
              if (data.showSuccess !== void 0) {
                this.show(data.showSuccess, 'success');
              }
              if (data.showError !== void 0) {
                this.show(data.showError, 'error');
              }
            } catch (error) {
              console.error('Failed to parse HX-Trigger:', error);
            }
          }
        });
      },
      show(message, type = 'info', duration = 4e3) {
        const id = this.nextId++;
        const toast = { id, message, type, visible: true };
        this.toasts.push(toast);
        if (duration > 0) {
          setTimeout(() => {
            this.dismiss(id);
          }, duration);
        }
      },
      dismiss(id) {
        const index = this.toasts.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.toasts[index].visible = false;
          setTimeout(() => {
            this.toasts = this.toasts.filter((t) => t.id !== id);
          }, 300);
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
          success: '\u2713',
          error: '\u2715',
          warning: '\u26A0',
          info: '\u2139',
        };
        return icons[type] || '\u2139';
      },
    }));
    window.Alpine.data('inlineEdit', (initialValue = '', endpoint = '', field = '') => ({
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
          window.dispatchEvent(
            new CustomEvent('show-flash', {
              detail: { type: 'success', text: 'Modifications enregistr\xE9es' },
            })
          );
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Unknown error';
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
          void this.save();
        } else if (e.key === 'Escape') {
          this.cancel();
        }
      },
    }));
    window.Alpine.data('taskSearch', () => ({
      query: '',
      searching: false,
      debounceTimer: null,
      search() {
        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
        }
        this.searching = true;
        this.debounceTimer = window.setTimeout(() => {
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
    }));
    window.Alpine.data('confirmDialog', () => ({
      open: false,
      title: '',
      message: '',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      onConfirm: null,
      show(options = {}) {
        this.title = options.title ?? 'Confirmation';
        this.message = options.message ?? '\xCAtes-vous s\xFBr ?';
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
    }));
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('htmx:beforeRequest', () => {
      document.body.classList.add('htmx-loading');
    });
    document.body.addEventListener('htmx:afterRequest', () => {
      document.body.classList.remove('htmx-loading');
    });
    document.body.addEventListener('htmx:responseError', (event) => {
      const htmxEvent = event;
      const triggerHeader = htmxEvent.detail?.xhr?.getResponseHeader('HX-Trigger');
      if (triggerHeader) {
        try {
          const data = JSON.parse(triggerHeader);
          if (data.showError !== void 0) {
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
    document.body.addEventListener('htmx:afterSwap', (event) => {
      const htmxEvent = event;
      const triggerHeader = htmxEvent.detail?.xhr?.getResponseHeader('HX-Trigger');
      if (triggerHeader) {
        try {
          const data = JSON.parse(triggerHeader);
          if (data.showSuccess !== void 0) {
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
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2Zyb250ZW5kL2NvbXBvbmVudHMvYWxwaW5lLWNvbXBvbmVudHMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQWxwaW5lLmpzIENvbXBvbmVudHMgZm9yIFRhc2tGbG93XG4gKiBSZWFjdGl2ZSBVSSBjb21wb25lbnRzIHVzaW5nIEFscGluZS5qcyBmcmFtZXdvcmtcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIElDb25maXJtRGlhbG9nRGF0YSxcbiAgSUNvbmZpcm1EaWFsb2dPcHRpb25zLFxuICBJRHJvcGRvd25EYXRhLFxuICBJRmlsdGVyc1BhbmVsRGF0YSxcbiAgSUZvcm1WYWxpZGF0aW9uRGF0YSxcbiAgSUh4VHJpZ2dlckRhdGEsXG4gIElJbmxpbmVFZGl0RGF0YSxcbiAgSU1vZGFsRGF0YSxcbiAgSVNob3dGbGFzaEV2ZW50RGV0YWlsLFxuICBJVGFza1NlYXJjaERhdGEsXG4gIElUaGVtZVN3aXRjaERhdGEsXG4gIElUb2FzdCxcbiAgSVRvYXN0TWFuYWdlckRhdGEsXG4gIElWYWxpZGF0aW9uUnVsZXMsXG4gIFRvYXN0VHlwZSxcbn0gZnJvbSAnLi4vdHlwZXMvYWxwaW5lLmQudHMnO1xuXG4vKipcbiAqIEluaXRpYWxpemUgQWxwaW5lLmpzIGNvbXBvbmVudHMgb24gYWxwaW5lOmluaXQgZXZlbnRcbiAqL1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYWxwaW5lOmluaXQnLCAoKSA9PiB7XG4gIC8qKlxuICAgKiBUaGVtZSBTd2l0Y2ggQ29tcG9uZW50XG4gICAqIE1hbmFnZXMgZGFyay9saWdodCB0aGVtZSB0b2dnbGUgd2l0aCBsb2NhbFN0b3JhZ2UgcGVyc2lzdGVuY2VcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAndGhlbWVTd2l0Y2gnLFxuICAgICgpOiBJVGhlbWVTd2l0Y2hEYXRhID0+ICh7XG4gICAgICBpc0Rhcms6IGZhbHNlLFxuXG4gICAgICBpbml0KCkge1xuICAgICAgICAvLyBHZXQgc2F2ZWQgdGhlbWUgb3Igc3lzdGVtIHByZWZlcmVuY2VcbiAgICAgICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpO1xuICAgICAgICBpZiAoc2F2ZWRUaGVtZSkge1xuICAgICAgICAgIHRoaXMuaXNEYXJrID0gc2F2ZWRUaGVtZSA9PT0gJ2RhcmsnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaXNEYXJrID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKS5tYXRjaGVzO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy50aGVtZVV0aWxzLmFwcGx5VGhlbWUodGhpcy5pc0RhcmspO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3Igc3RvcmFnZSBldmVudHMgKHN5bmMgYWNyb3NzIHRhYnMpXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgKGU6IFN0b3JhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleSA9PT0gJ3RoZW1lJyAmJiBlLm5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGFyayA9IGUubmV3VmFsdWUgPT09ICdkYXJrJztcbiAgICAgICAgICAgIHdpbmRvdy50aGVtZVV0aWxzLmFwcGx5VGhlbWUodGhpcy5pc0RhcmspO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICB0b2dnbGUoKSB7XG4gICAgICAgIHRoaXMuaXNEYXJrID0gIXRoaXMuaXNEYXJrO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCB0aGlzLmlzRGFyayA/ICdkYXJrJyA6ICdsaWdodCcpO1xuICAgICAgICB3aW5kb3cudGhlbWVVdGlscy5hcHBseVRoZW1lKHRoaXMuaXNEYXJrKTtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogTW9kYWwgQ29tcG9uZW50XG4gICAqIE1hbmFnZXMgbW9kYWwgZGlhbG9ncyB3aXRoIGZvY3VzIHRyYXAgYW5kIGtleWJvYXJkIG5hdmlnYXRpb25cbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnbW9kYWwnLFxuICAgICgpOiBJTW9kYWxEYXRhID0+ICh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIGZvY3VzVHJhcDogbnVsbCxcblxuICAgICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICAgIC8vIEZvY3VzIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICh0aGlzIGFzIGFueSkuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgIGNvbnN0IGZvY3VzYWJsZSA9ICh0aGlzIGFzIGFueSkuJGVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnYnV0dG9uLCBbaHJlZl0sIGlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZm9jdXNhYmxlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5mb2N1c1RyYXAgPSBmb2N1c2FibGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICB9LFxuXG4gICAgICBoYW5kbGVLZXlkb3duKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIERyb3Bkb3duIENvbXBvbmVudFxuICAgKiBIYW5kbGVzIGRyb3Bkb3duIG1lbnVzIHdpdGggY2xpY2stb3V0c2lkZSBkZXRlY3Rpb25cbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnZHJvcGRvd24nLFxuICAgICgpOiBJRHJvcGRvd25EYXRhID0+ICh7XG4gICAgICBvcGVuOiBmYWxzZSxcblxuICAgICAgdG9nZ2xlKCkge1xuICAgICAgICB0aGlzLm9wZW4gPSAhdGhpcy5vcGVuO1xuICAgICAgfSxcblxuICAgICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgfSxcbiAgICB9KVxuICApO1xuXG4gIC8qKlxuICAgKiBGb3JtIFZhbGlkYXRpb24gQ29tcG9uZW50XG4gICAqIENsaWVudC1zaWRlIGZvcm0gdmFsaWRhdGlvbiB3aXRoIHJlYWwtdGltZSBmZWVkYmFja1xuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdmb3JtVmFsaWRhdGlvbicsXG4gICAgKCk6IElGb3JtVmFsaWRhdGlvbkRhdGEgPT4gKHtcbiAgICAgIGVycm9yczoge30sXG4gICAgICB0b3VjaGVkOiB7fSxcblxuICAgICAgdmFsaWRhdGUoZmllbGQ6IHN0cmluZywgdmFsdWU6IHN0cmluZywgcnVsZXM6IElWYWxpZGF0aW9uUnVsZXMpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGlmIChydWxlcy5yZXF1aXJlZCA9PT0gdHJ1ZSAmJiAhdmFsdWUpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaCgnQ2UgY2hhbXAgZXN0IHJlcXVpcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJ1bGVzLm1pbkxlbmd0aCAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLmxlbmd0aCA8IHJ1bGVzLm1pbkxlbmd0aCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGBNaW5pbXVtICR7cnVsZXMubWluTGVuZ3RofSBjYXJhY3RcdTAwRThyZXNgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChydWxlcy5tYXhMZW5ndGggIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS5sZW5ndGggPiBydWxlcy5tYXhMZW5ndGgpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChgTWF4aW11bSAke3J1bGVzLm1heExlbmd0aH0gY2FyYWN0XHUwMEU4cmVzYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocnVsZXMuZW1haWwgPT09IHRydWUgJiYgdmFsdWUgJiYgIS9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0VtYWlsIGludmFsaWRlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVycm9yc1tmaWVsZF0gPSBlcnJvcnM7XG4gICAgICAgIHJldHVybiBlcnJvcnMubGVuZ3RoID09PSAwO1xuICAgICAgfSxcblxuICAgICAgdG91Y2goZmllbGQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnRvdWNoZWRbZmllbGRdID0gdHJ1ZTtcbiAgICAgIH0sXG5cbiAgICAgIGhhc0Vycm9yKGZpZWxkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICB0aGlzLnRvdWNoZWRbZmllbGRdID09PSB0cnVlICYmXG4gICAgICAgICAgdGhpcy5lcnJvcnNbZmllbGRdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICB0aGlzLmVycm9yc1tmaWVsZF0ubGVuZ3RoID4gMFxuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgZ2V0RXJyb3IoZmllbGQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0Vycm9yKGZpZWxkKSA/IHRoaXMuZXJyb3JzW2ZpZWxkXVswXSA6ICcnO1xuICAgICAgfSxcbiAgICB9KVxuICApO1xuXG4gIC8qKlxuICAgKiBGaWx0ZXJzIFBhbmVsIENvbXBvbmVudFxuICAgKiBNYW5hZ2VzIGNvbGxhcHNpYmxlIGZpbHRlciBzaWRlYmFyIHdpdGggcGVyc2lzdGVuY2VcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnZmlsdGVyc1BhbmVsJyxcbiAgICAoKTogSUZpbHRlcnNQYW5lbERhdGEgPT4gKHtcbiAgICAgIG9wZW46IHdpbmRvdy5BbHBpbmUuJHBlcnNpc3QodHJ1ZSkuYXMoJ2ZpbHRlcnNQYW5lbF9vcGVuJyksXG4gICAgICBmaWx0ZXJzOiB3aW5kb3cuQWxwaW5lLiRwZXJzaXN0KHt9KS5hcygndGFza0ZpbHRlcnMnKSxcblxuICAgICAgdG9nZ2xlKCkge1xuICAgICAgICB0aGlzLm9wZW4gPSAhdGhpcy5vcGVuO1xuICAgICAgfSxcblxuICAgICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuZmlsdGVycyA9IHt9O1xuICAgICAgICAvLyBUcmlnZ2VyIEhUTVggdG8gcmVsb2FkIHdpdGggbm8gZmlsdGVyc1xuICAgICAgICB3aW5kb3cuaHRteC5hamF4KCdHRVQnLCAnL3Rhc2tzJywge1xuICAgICAgICAgIHRhcmdldDogJyN0YXNrLWxpc3QtY29udGFpbmVyJyxcbiAgICAgICAgICBzd2FwOiAnaW5uZXJIVE1MJyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBhcHBseSgpIHtcbiAgICAgICAgLy8gVHJpZ2dlciBIVE1YIHJlcXVlc3Qgd2l0aCBmaWx0ZXJzIGFzIHF1ZXJ5IHBhcmFtc1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKFxuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuZmlsdGVycykubWFwKChba2V5LCB2YWx1ZV0pID0+IFtrZXksIFN0cmluZyh2YWx1ZSldKVxuICAgICAgICApO1xuICAgICAgICB3aW5kb3cuaHRteC5hamF4KCdHRVQnLCBgL3Rhc2tzPyR7cGFyYW1zLnRvU3RyaW5nKCl9YCwge1xuICAgICAgICAgIHRhcmdldDogJyN0YXNrLWxpc3QtY29udGFpbmVyJyxcbiAgICAgICAgICBzd2FwOiAnaW5uZXJIVE1MJyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIFRvYXN0IE5vdGlmaWNhdGlvbiBDb21wb25lbnRcbiAgICogRGlzcGxheXMgdGVtcG9yYXJ5IHRvYXN0IG5vdGlmaWNhdGlvbnMgd2l0aCBhdXRvLWRpc21pc3NcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAndG9hc3RNYW5hZ2VyJyxcbiAgICAoKTogSVRvYXN0TWFuYWdlckRhdGEgPT4gKHtcbiAgICAgIHRvYXN0czogW10sXG4gICAgICBuZXh0SWQ6IDEsXG5cbiAgICAgIGluaXQoKSB7XG4gICAgICAgIC8vIExpc3RlbiBmb3IgY3VzdG9tIGZsYXNoIGV2ZW50c1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2hvdy1mbGFzaCcsIChldmVudDogQ3VzdG9tRXZlbnQ8SVNob3dGbGFzaEV2ZW50RGV0YWlsPikgPT4ge1xuICAgICAgICAgIHRoaXMuc2hvdyhldmVudC5kZXRhaWwudGV4dCwgZXZlbnQuZGV0YWlsLnR5cGUgfHwgJ2luZm8nKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBIVE1YIHN1Y2Nlc3MvZXJyb3IgZXZlbnRzXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDphZnRlclN3YXAnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgaHRteEV2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ7XG4gICAgICAgICAgY29uc3QgdHJpZ2dlciA9IGh0bXhFdmVudC5kZXRhaWw/Lnhocj8uZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLVRyaWdnZXInKTtcbiAgICAgICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UodHJpZ2dlcikgYXMgSUh4VHJpZ2dlckRhdGE7XG4gICAgICAgICAgICAgIGlmIChkYXRhLnNob3dTdWNjZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZGF0YS5zaG93U3VjY2VzcywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93RXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdyhkYXRhLnNob3dFcnJvciwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSBIWC1UcmlnZ2VyOicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgc2hvdyhtZXNzYWdlOiBzdHJpbmcsIHR5cGU6IFRvYXN0VHlwZSA9ICdpbmZvJywgZHVyYXRpb24gPSA0MDAwKSB7XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5uZXh0SWQrKztcbiAgICAgICAgY29uc3QgdG9hc3Q6IElUb2FzdCA9IHsgaWQsIG1lc3NhZ2UsIHR5cGUsIHZpc2libGU6IHRydWUgfTtcbiAgICAgICAgdGhpcy50b2FzdHMucHVzaCh0b2FzdCk7XG5cbiAgICAgICAgLy8gQXV0by1kaXNtaXNzIGFmdGVyIGR1cmF0aW9uXG4gICAgICAgIGlmIChkdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzcyhpZCk7XG4gICAgICAgICAgfSwgZHVyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBkaXNtaXNzKGlkOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnRvYXN0cy5maW5kSW5kZXgoKHQpID0+IHQuaWQgPT09IGlkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMudG9hc3RzW2luZGV4XS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRvYXN0cyA9IHRoaXMudG9hc3RzLmZpbHRlcigodCkgPT4gdC5pZCAhPT0gaWQpO1xuICAgICAgICAgIH0sIDMwMCk7IC8vIFdhaXQgZm9yIGFuaW1hdGlvblxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBnZXRBbGVydENsYXNzKHR5cGU6IFRvYXN0VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXM6IFJlY29yZDxUb2FzdFR5cGUsIHN0cmluZz4gPSB7XG4gICAgICAgICAgc3VjY2VzczogJ2FsZXJ0LXN1Y2Nlc3MnLFxuICAgICAgICAgIGVycm9yOiAnYWxlcnQtZXJyb3InLFxuICAgICAgICAgIHdhcm5pbmc6ICdhbGVydC13YXJuaW5nJyxcbiAgICAgICAgICBpbmZvOiAnYWxlcnQtaW5mbycsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjbGFzc2VzW3R5cGVdIHx8ICdhbGVydC1pbmZvJztcbiAgICAgIH0sXG5cbiAgICAgIGdldEljb24odHlwZTogVG9hc3RUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaWNvbnM6IFJlY29yZDxUb2FzdFR5cGUsIHN0cmluZz4gPSB7XG4gICAgICAgICAgc3VjY2VzczogJ1x1MjcxMycsXG4gICAgICAgICAgZXJyb3I6ICdcdTI3MTUnLFxuICAgICAgICAgIHdhcm5pbmc6ICdcdTI2QTAnLFxuICAgICAgICAgIGluZm86ICdcdTIxMzknLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gaWNvbnNbdHlwZV0gfHwgJ1x1MjEzOSc7XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIElubGluZSBFZGl0IENvbXBvbmVudFxuICAgKiBFbmFibGVzIGlubGluZSBlZGl0aW5nIG9mIHRleHQgZmllbGRzIHdpdGggUEFUQ0ggQVBJXG4gICAqL1xuICB3aW5kb3cuQWxwaW5lLmRhdGEoXG4gICAgJ2lubGluZUVkaXQnLFxuICAgIChpbml0aWFsVmFsdWUgPSAnJywgZW5kcG9pbnQgPSAnJywgZmllbGQgPSAnJyk6IElJbmxpbmVFZGl0RGF0YSA9PiAoe1xuICAgICAgZWRpdGluZzogZmFsc2UsXG4gICAgICB2YWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgb3JpZ2luYWxWYWx1ZTogaW5pdGlhbFZhbHVlLFxuICAgICAgc2F2aW5nOiBmYWxzZSxcbiAgICAgIGVycm9yOiBudWxsLFxuXG4gICAgICBzdGFydEVkaXQoKSB7XG4gICAgICAgIHRoaXMuZWRpdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMub3JpZ2luYWxWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICh0aGlzIGFzIGFueSkuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgIGNvbnN0IGlucHV0ID0gKHRoaXMgYXMgYW55KS4kZWwucXVlcnlTZWxlY3RvcignaW5wdXQsIHRleHRhcmVhJyk7XG4gICAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8IGlucHV0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkge1xuICAgICAgICAgICAgICBpbnB1dC5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgYXN5bmMgc2F2ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IHRoaXMub3JpZ2luYWxWYWx1ZSkge1xuICAgICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZW5kcG9pbnQsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgW2ZpZWxkXTogdGhpcy52YWx1ZSB9KSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHNhdmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmVkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLm9yaWdpbmFsVmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgICAgICAgLy8gU2hvdyBzdWNjZXNzIHRvYXN0XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8SVNob3dGbGFzaEV2ZW50RGV0YWlsPignc2hvdy1mbGFzaCcsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogJ01vZGlmaWNhdGlvbnMgZW5yZWdpc3RyXHUwMEU5ZXMnIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PElTaG93Rmxhc2hFdmVudERldGFpbD4oJ3Nob3ctZmxhc2gnLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnRXJyZXVyIGxvcnMgZGUgbGEgc2F1dmVnYXJkZScgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLnNhdmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm9yaWdpbmFsVmFsdWU7XG4gICAgICAgIHRoaXMuZWRpdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgIH0sXG5cbiAgICAgIGhhbmRsZUtleWRvd24oZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdm9pZCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIFRhc2sgU2VhcmNoIENvbXBvbmVudFxuICAgKiBDbGllbnQtc2lkZSB0YXNrIHNlYXJjaCB3aXRoIGRlYm91bmNpbmdcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAndGFza1NlYXJjaCcsXG4gICAgKCk6IElUYXNrU2VhcmNoRGF0YSA9PiAoe1xuICAgICAgcXVlcnk6ICcnLFxuICAgICAgc2VhcmNoaW5nOiBmYWxzZSxcbiAgICAgIGRlYm91bmNlVGltZXI6IG51bGwsXG5cbiAgICAgIHNlYXJjaCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGVib3VuY2VUaW1lciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmRlYm91bmNlVGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VhcmNoaW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmRlYm91bmNlVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgLy8gVHJpZ2dlciBIVE1YIHNlYXJjaCByZXF1ZXN0XG4gICAgICAgICAgd2luZG93Lmh0bXguYWpheCgnR0VUJywgYC90YXNrcz9zZWFyY2g9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5xdWVyeSl9YCwge1xuICAgICAgICAgICAgdGFyZ2V0OiAnI3Rhc2stbGlzdC1jb250YWluZXInLFxuICAgICAgICAgICAgc3dhcDogJ2lubmVySFRNTCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgICAgfSwgMzAwKTtcbiAgICAgIH0sXG5cbiAgICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLnF1ZXJ5ID0gJyc7XG4gICAgICAgIHRoaXMuc2VhcmNoKCk7XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIENvbmZpcm1hdGlvbiBEaWFsb2cgQ29tcG9uZW50XG4gICAqIENvbmZpcm1zIGRlc3RydWN0aXZlIGFjdGlvbnNcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnY29uZmlybURpYWxvZycsXG4gICAgKCk6IElDb25maXJtRGlhbG9nRGF0YSA9PiAoe1xuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICB0aXRsZTogJycsXG4gICAgICBtZXNzYWdlOiAnJyxcbiAgICAgIGNvbmZpcm1UZXh0OiAnQ29uZmlybWVyJyxcbiAgICAgIGNhbmNlbFRleHQ6ICdBbm51bGVyJyxcbiAgICAgIG9uQ29uZmlybTogbnVsbCxcblxuICAgICAgc2hvdyhvcHRpb25zOiBJQ29uZmlybURpYWxvZ09wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZSA/PyAnQ29uZmlybWF0aW9uJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlID8/ICdcdTAwQ0F0ZXMtdm91cyBzXHUwMEZCciA/JztcbiAgICAgICAgdGhpcy5jb25maXJtVGV4dCA9IG9wdGlvbnMuY29uZmlybVRleHQgPz8gJ0NvbmZpcm1lcic7XG4gICAgICAgIHRoaXMuY2FuY2VsVGV4dCA9IG9wdGlvbnMuY2FuY2VsVGV4dCA/PyAnQW5udWxlcic7XG4gICAgICAgIHRoaXMub25Db25maXJtID0gb3B0aW9ucy5vbkNvbmZpcm0gPz8gbnVsbDtcbiAgICAgICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICAgIH0sXG5cbiAgICAgIGNvbmZpcm0oKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQ29uZmlybSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25Db25maXJtKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfSxcblxuICAgICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uQ29uZmlybSA9IG51bGw7XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG59KTtcblxuLyoqXG4gKiBIVE1YIEV2ZW50IExpc3RlbmVyc1xuICogR2xvYmFsIEhUTVggY29uZmlndXJhdGlvbiBhbmQgZXZlbnQgaGFuZGxlcnNcbiAqL1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgLy8gU2hvdyBsb2FkaW5nIGluZGljYXRvciBvbiBIVE1YIHJlcXVlc3RzXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDpiZWZvcmVSZXF1ZXN0JywgKCkgPT4ge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnaHRteC1sb2FkaW5nJyk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDphZnRlclJlcXVlc3QnLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdodG14LWxvYWRpbmcnKTtcbiAgfSk7XG5cbiAgLy8gSGFuZGxlIGVycm9ycyBmcm9tIEhYLVRyaWdnZXIgaGVhZGVyXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDpyZXNwb25zZUVycm9yJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IGh0bXhFdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50O1xuICAgIGNvbnN0IHRyaWdnZXJIZWFkZXIgPSBodG14RXZlbnQuZGV0YWlsPy54aHI/LmdldFJlc3BvbnNlSGVhZGVyKCdIWC1UcmlnZ2VyJyk7XG4gICAgaWYgKHRyaWdnZXJIZWFkZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHRyaWdnZXJIZWFkZXIpIGFzIElIeFRyaWdnZXJEYXRhO1xuICAgICAgICBpZiAoZGF0YS5zaG93RXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIERpc3BhdGNoIGN1c3RvbSBldmVudCBmb3IgZmxhc2ggbWVzc2FnZSBzeXN0ZW1cbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxJU2hvd0ZsYXNoRXZlbnREZXRhaWw+KCdzaG93LWZsYXNoJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IHsgdHlwZTogJ2Vycm9yJywgdGV4dDogZGF0YS5zaG93RXJyb3IgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIEhYLVRyaWdnZXIgaGVhZGVyOicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIEhhbmRsZSBzdWNjZXNzZnVsIG11dGF0aW9uc1xuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2h0bXg6YWZ0ZXJTd2FwJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IGh0bXhFdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50O1xuICAgIGNvbnN0IHRyaWdnZXJIZWFkZXIgPSBodG14RXZlbnQuZGV0YWlsPy54aHI/LmdldFJlc3BvbnNlSGVhZGVyKCdIWC1UcmlnZ2VyJyk7XG4gICAgaWYgKHRyaWdnZXJIZWFkZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHRyaWdnZXJIZWFkZXIpIGFzIElIeFRyaWdnZXJEYXRhO1xuICAgICAgICBpZiAoZGF0YS5zaG93U3VjY2VzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8SVNob3dGbGFzaEV2ZW50RGV0YWlsPignc2hvdy1mbGFzaCcsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogZGF0YS5zaG93U3VjY2VzcyB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGFyc2UgSFgtVHJpZ2dlciBoZWFkZXI6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQTBCQSxXQUFTLGlCQUFpQixlQUFlLE1BQU07QUFLN0MsV0FBTyxPQUFPO0FBQUEsTUFDWjtBQUFBLE1BQ0EsT0FBeUI7QUFBQSxRQUN2QixRQUFRO0FBQUEsUUFFUixPQUFPO0FBRUwsZ0JBQU0sYUFBYSxhQUFhLFFBQVEsT0FBTztBQUMvQyxjQUFJLFlBQVk7QUFDZCxpQkFBSyxTQUFTLGVBQWU7QUFBQSxVQUMvQixPQUFPO0FBQ0wsaUJBQUssU0FBUyxPQUFPLFdBQVcsOEJBQThCLEVBQUU7QUFBQSxVQUNsRTtBQUNBLGlCQUFPLFdBQVcsV0FBVyxLQUFLLE1BQU07QUFHeEMsaUJBQU8saUJBQWlCLFdBQVcsQ0FBQyxNQUFvQjtBQUN0RCxnQkFBSSxFQUFFLFFBQVEsV0FBVyxFQUFFLFVBQVU7QUFDbkMsbUJBQUssU0FBUyxFQUFFLGFBQWE7QUFDN0IscUJBQU8sV0FBVyxXQUFXLEtBQUssTUFBTTtBQUFBLFlBQzFDO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUFBLFFBRUEsU0FBUztBQUNQLGVBQUssU0FBUyxDQUFDLEtBQUs7QUFDcEIsdUJBQWEsUUFBUSxTQUFTLEtBQUssU0FBUyxTQUFTLE9BQU87QUFDNUQsaUJBQU8sV0FBVyxXQUFXLEtBQUssTUFBTTtBQUFBLFFBQzFDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFNQSxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUFtQjtBQUFBLFFBQ2pCLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxRQUVYLE9BQU87QUFDTCxlQUFL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
