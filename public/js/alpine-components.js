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
        this.title = options.title || 'Confirmation';
        this.message = options.message || '\xCAtes-vous s\xFBr ?';
        this.confirmText = options.confirmText || 'Confirmer';
        this.cancelText = options.cancelText || 'Annuler';
        this.onConfirm = options.onConfirm || null;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2Zyb250ZW5kL2NvbXBvbmVudHMvYWxwaW5lLWNvbXBvbmVudHMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQWxwaW5lLmpzIENvbXBvbmVudHMgZm9yIFRhc2tGbG93XG4gKiBSZWFjdGl2ZSBVSSBjb21wb25lbnRzIHVzaW5nIEFscGluZS5qcyBmcmFtZXdvcmtcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIElDb25maXJtRGlhbG9nRGF0YSxcbiAgSUNvbmZpcm1EaWFsb2dPcHRpb25zLFxuICBJRHJvcGRvd25EYXRhLFxuICBJRmlsdGVyc1BhbmVsRGF0YSxcbiAgSUZvcm1WYWxpZGF0aW9uRGF0YSxcbiAgSUh4VHJpZ2dlckRhdGEsXG4gIElJbmxpbmVFZGl0RGF0YSxcbiAgSU1vZGFsRGF0YSxcbiAgSVNob3dGbGFzaEV2ZW50RGV0YWlsLFxuICBJVGFza1NlYXJjaERhdGEsXG4gIElUaGVtZVN3aXRjaERhdGEsXG4gIElUb2FzdCxcbiAgSVRvYXN0TWFuYWdlckRhdGEsXG4gIElWYWxpZGF0aW9uUnVsZXMsXG4gIFRvYXN0VHlwZSxcbn0gZnJvbSAnLi4vdHlwZXMvYWxwaW5lLmQudHMnO1xuXG4vKipcbiAqIEluaXRpYWxpemUgQWxwaW5lLmpzIGNvbXBvbmVudHMgb24gYWxwaW5lOmluaXQgZXZlbnRcbiAqL1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYWxwaW5lOmluaXQnLCAoKSA9PiB7XG4gIC8qKlxuICAgKiBUaGVtZSBTd2l0Y2ggQ29tcG9uZW50XG4gICAqIE1hbmFnZXMgZGFyay9saWdodCB0aGVtZSB0b2dnbGUgd2l0aCBsb2NhbFN0b3JhZ2UgcGVyc2lzdGVuY2VcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAndGhlbWVTd2l0Y2gnLFxuICAgICgpOiBJVGhlbWVTd2l0Y2hEYXRhID0+ICh7XG4gICAgICBpc0Rhcms6IGZhbHNlLFxuXG4gICAgICBpbml0KCkge1xuICAgICAgICAvLyBHZXQgc2F2ZWQgdGhlbWUgb3Igc3lzdGVtIHByZWZlcmVuY2VcbiAgICAgICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpO1xuICAgICAgICBpZiAoc2F2ZWRUaGVtZSkge1xuICAgICAgICAgIHRoaXMuaXNEYXJrID0gc2F2ZWRUaGVtZSA9PT0gJ2RhcmsnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaXNEYXJrID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKS5tYXRjaGVzO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy50aGVtZVV0aWxzLmFwcGx5VGhlbWUodGhpcy5pc0RhcmspO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3Igc3RvcmFnZSBldmVudHMgKHN5bmMgYWNyb3NzIHRhYnMpXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgKGU6IFN0b3JhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleSA9PT0gJ3RoZW1lJyAmJiBlLm5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGFyayA9IGUubmV3VmFsdWUgPT09ICdkYXJrJztcbiAgICAgICAgICAgIHdpbmRvdy50aGVtZVV0aWxzLmFwcGx5VGhlbWUodGhpcy5pc0RhcmspO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICB0b2dnbGUoKSB7XG4gICAgICAgIHRoaXMuaXNEYXJrID0gIXRoaXMuaXNEYXJrO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCB0aGlzLmlzRGFyayA/ICdkYXJrJyA6ICdsaWdodCcpO1xuICAgICAgICB3aW5kb3cudGhlbWVVdGlscy5hcHBseVRoZW1lKHRoaXMuaXNEYXJrKTtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogTW9kYWwgQ29tcG9uZW50XG4gICAqIE1hbmFnZXMgbW9kYWwgZGlhbG9ncyB3aXRoIGZvY3VzIHRyYXAgYW5kIGtleWJvYXJkIG5hdmlnYXRpb25cbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnbW9kYWwnLFxuICAgICgpOiBJTW9kYWxEYXRhID0+ICh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIGZvY3VzVHJhcDogbnVsbCxcblxuICAgICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICAgIC8vIEZvY3VzIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50XG4gICAgICAgICh0aGlzIGFzIGFueSkuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBmb2N1c2FibGUgPSAodGhpcyBhcyBhbnkpLiRlbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJ2J1dHRvbiwgW2hyZWZdLCBpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKGZvY3VzYWJsZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBmb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNUcmFwID0gZm9jdXNhYmxlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgfSxcblxuICAgICAgaGFuZGxlS2V5ZG93bihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KVxuICApO1xuXG4gIC8qKlxuICAgKiBEcm9wZG93biBDb21wb25lbnRcbiAgICogSGFuZGxlcyBkcm9wZG93biBtZW51cyB3aXRoIGNsaWNrLW91dHNpZGUgZGV0ZWN0aW9uXG4gICAqL1xuICB3aW5kb3cuQWxwaW5lLmRhdGEoXG4gICAgJ2Ryb3Bkb3duJyxcbiAgICAoKTogSURyb3Bkb3duRGF0YSA9PiAoe1xuICAgICAgb3BlbjogZmFsc2UsXG5cbiAgICAgIHRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gIXRoaXMub3BlbjtcbiAgICAgIH0sXG5cbiAgICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogRm9ybSBWYWxpZGF0aW9uIENvbXBvbmVudFxuICAgKiBDbGllbnQtc2lkZSBmb3JtIHZhbGlkYXRpb24gd2l0aCByZWFsLXRpbWUgZmVlZGJhY2tcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnZm9ybVZhbGlkYXRpb24nLFxuICAgICgpOiBJRm9ybVZhbGlkYXRpb25EYXRhID0+ICh7XG4gICAgICBlcnJvcnM6IHt9LFxuICAgICAgdG91Y2hlZDoge30sXG5cbiAgICAgIHZhbGlkYXRlKGZpZWxkOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHJ1bGVzOiBJVmFsaWRhdGlvblJ1bGVzKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBpZiAocnVsZXMucmVxdWlyZWQgPT09IHRydWUgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goJ0NlIGNoYW1wIGVzdCByZXF1aXMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChydWxlcy5taW5MZW5ndGggIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS5sZW5ndGggPCBydWxlcy5taW5MZW5ndGgpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChgTWluaW11bSAke3J1bGVzLm1pbkxlbmd0aH0gY2FyYWN0XHUwMEU4cmVzYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocnVsZXMubWF4TGVuZ3RoICE9PSB1bmRlZmluZWQgJiYgdmFsdWUubGVuZ3RoID4gcnVsZXMubWF4TGVuZ3RoKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goYE1heGltdW0gJHtydWxlcy5tYXhMZW5ndGh9IGNhcmFjdFx1MDBFOHJlc2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJ1bGVzLmVtYWlsID09PSB0cnVlICYmIHZhbHVlICYmICEvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKCdFbWFpbCBpbnZhbGlkZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lcnJvcnNbZmllbGRdID0gZXJyb3JzO1xuICAgICAgICByZXR1cm4gZXJyb3JzLmxlbmd0aCA9PT0gMDtcbiAgICAgIH0sXG5cbiAgICAgIHRvdWNoKGZpZWxkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy50b3VjaGVkW2ZpZWxkXSA9IHRydWU7XG4gICAgICB9LFxuXG4gICAgICBoYXNFcnJvcihmaWVsZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgdGhpcy50b3VjaGVkW2ZpZWxkXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgIHRoaXMuZXJyb3JzW2ZpZWxkXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgdGhpcy5lcnJvcnNbZmllbGRdLmxlbmd0aCA+IDBcbiAgICAgICAgKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldEVycm9yKGZpZWxkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNFcnJvcihmaWVsZCkgPyB0aGlzLmVycm9yc1tmaWVsZF1bMF0gOiAnJztcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogRmlsdGVycyBQYW5lbCBDb21wb25lbnRcbiAgICogTWFuYWdlcyBjb2xsYXBzaWJsZSBmaWx0ZXIgc2lkZWJhciB3aXRoIHBlcnNpc3RlbmNlXG4gICAqL1xuICB3aW5kb3cuQWxwaW5lLmRhdGEoXG4gICAgJ2ZpbHRlcnNQYW5lbCcsXG4gICAgKCk6IElGaWx0ZXJzUGFuZWxEYXRhID0+ICh7XG4gICAgICBvcGVuOiB3aW5kb3cuQWxwaW5lLiRwZXJzaXN0KHRydWUpLmFzKCdmaWx0ZXJzUGFuZWxfb3BlbicpLFxuICAgICAgZmlsdGVyczogd2luZG93LkFscGluZS4kcGVyc2lzdCh7fSkuYXMoJ3Rhc2tGaWx0ZXJzJyksXG5cbiAgICAgIHRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gIXRoaXMub3BlbjtcbiAgICAgIH0sXG5cbiAgICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLmZpbHRlcnMgPSB7fTtcbiAgICAgICAgLy8gVHJpZ2dlciBIVE1YIHRvIHJlbG9hZCB3aXRoIG5vIGZpbHRlcnNcbiAgICAgICAgd2luZG93Lmh0bXguYWpheCgnR0VUJywgJy90YXNrcycsIHtcbiAgICAgICAgICB0YXJnZXQ6ICcjdGFzay1saXN0LWNvbnRhaW5lcicsXG4gICAgICAgICAgc3dhcDogJ2lubmVySFRNTCcsXG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgYXBwbHkoKSB7XG4gICAgICAgIC8vIFRyaWdnZXIgSFRNWCByZXF1ZXN0IHdpdGggZmlsdGVycyBhcyBxdWVyeSBwYXJhbXNcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhcbiAgICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLmZpbHRlcnMpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBba2V5LCBTdHJpbmcodmFsdWUpXSlcbiAgICAgICAgKTtcbiAgICAgICAgd2luZG93Lmh0bXguYWpheCgnR0VUJywgYC90YXNrcz8ke3BhcmFtcy50b1N0cmluZygpfWAsIHtcbiAgICAgICAgICB0YXJnZXQ6ICcjdGFzay1saXN0LWNvbnRhaW5lcicsXG4gICAgICAgICAgc3dhcDogJ2lubmVySFRNTCcsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9KVxuICApO1xuXG4gIC8qKlxuICAgKiBUb2FzdCBOb3RpZmljYXRpb24gQ29tcG9uZW50XG4gICAqIERpc3BsYXlzIHRlbXBvcmFyeSB0b2FzdCBub3RpZmljYXRpb25zIHdpdGggYXV0by1kaXNtaXNzXG4gICAqL1xuICB3aW5kb3cuQWxwaW5lLmRhdGEoXG4gICAgJ3RvYXN0TWFuYWdlcicsXG4gICAgKCk6IElUb2FzdE1hbmFnZXJEYXRhID0+ICh7XG4gICAgICB0b2FzdHM6IFtdLFxuICAgICAgbmV4dElkOiAxLFxuXG4gICAgICBpbml0KCkge1xuICAgICAgICAvLyBMaXN0ZW4gZm9yIGN1c3RvbSBmbGFzaCBldmVudHNcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Nob3ctZmxhc2gnLCAoZXZlbnQ6IEN1c3RvbUV2ZW50PElTaG93Rmxhc2hFdmVudERldGFpbD4pID0+IHtcbiAgICAgICAgICB0aGlzLnNob3coZXZlbnQuZGV0YWlsLnRleHQsIGV2ZW50LmRldGFpbC50eXBlIHx8ICdpbmZvJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgSFRNWCBzdWNjZXNzL2Vycm9yIGV2ZW50c1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2h0bXg6YWZ0ZXJTd2FwJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGh0bXhFdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50O1xuICAgICAgICAgIGNvbnN0IHRyaWdnZXIgPSBodG14RXZlbnQuZGV0YWlsPy54aHI/LmdldFJlc3BvbnNlSGVhZGVyKCdIWC1UcmlnZ2VyJyk7XG4gICAgICAgICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHRyaWdnZXIpIGFzIElIeFRyaWdnZXJEYXRhO1xuICAgICAgICAgICAgICBpZiAoZGF0YS5zaG93U3VjY2VzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KGRhdGEuc2hvd1N1Y2Nlc3MsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvd0Vycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZGF0YS5zaG93RXJyb3IsICdlcnJvcicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGFyc2UgSFgtVHJpZ2dlcjonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIHNob3cobWVzc2FnZTogc3RyaW5nLCB0eXBlOiBUb2FzdFR5cGUgPSAnaW5mbycsIGR1cmF0aW9uID0gNDAwMCkge1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMubmV4dElkKys7XG4gICAgICAgIGNvbnN0IHRvYXN0OiBJVG9hc3QgPSB7IGlkLCBtZXNzYWdlLCB0eXBlLCB2aXNpYmxlOiB0cnVlIH07XG4gICAgICAgIHRoaXMudG9hc3RzLnB1c2godG9hc3QpO1xuXG4gICAgICAgIC8vIEF1dG8tZGlzbWlzcyBhZnRlciBkdXJhdGlvblxuICAgICAgICBpZiAoZHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRpc21pc3MoaWQpO1xuICAgICAgICAgIH0sIGR1cmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgZGlzbWlzcyhpZDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy50b2FzdHMuZmluZEluZGV4KCh0KSA9PiB0LmlkID09PSBpZCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnRvYXN0c1tpbmRleF0udmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50b2FzdHMgPSB0aGlzLnRvYXN0cy5maWx0ZXIoKHQpID0+IHQuaWQgIT09IGlkKTtcbiAgICAgICAgICB9LCAzMDApOyAvLyBXYWl0IGZvciBhbmltYXRpb25cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgZ2V0QWxlcnRDbGFzcyh0eXBlOiBUb2FzdFR5cGUpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjbGFzc2VzOiBSZWNvcmQ8VG9hc3RUeXBlLCBzdHJpbmc+ID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6ICdhbGVydC1zdWNjZXNzJyxcbiAgICAgICAgICBlcnJvcjogJ2FsZXJ0LWVycm9yJyxcbiAgICAgICAgICB3YXJuaW5nOiAnYWxlcnQtd2FybmluZycsXG4gICAgICAgICAgaW5mbzogJ2FsZXJ0LWluZm8nLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY2xhc3Nlc1t0eXBlXSB8fCAnYWxlcnQtaW5mbyc7XG4gICAgICB9LFxuXG4gICAgICBnZXRJY29uKHR5cGU6IFRvYXN0VHlwZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGljb25zOiBSZWNvcmQ8VG9hc3RUeXBlLCBzdHJpbmc+ID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6ICdcdTI3MTMnLFxuICAgICAgICAgIGVycm9yOiAnXHUyNzE1JyxcbiAgICAgICAgICB3YXJuaW5nOiAnXHUyNkEwJyxcbiAgICAgICAgICBpbmZvOiAnXHUyMTM5JyxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGljb25zW3R5cGVdIHx8ICdcdTIxMzknO1xuICAgICAgfSxcbiAgICB9KVxuICApO1xuXG4gIC8qKlxuICAgKiBJbmxpbmUgRWRpdCBDb21wb25lbnRcbiAgICogRW5hYmxlcyBpbmxpbmUgZWRpdGluZyBvZiB0ZXh0IGZpZWxkcyB3aXRoIFBBVENIIEFQSVxuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdpbmxpbmVFZGl0JyxcbiAgICAoaW5pdGlhbFZhbHVlID0gJycsIGVuZHBvaW50ID0gJycsIGZpZWxkID0gJycpOiBJSW5saW5lRWRpdERhdGEgPT4gKHtcbiAgICAgIGVkaXRpbmc6IGZhbHNlLFxuICAgICAgdmFsdWU6IGluaXRpYWxWYWx1ZSxcbiAgICAgIG9yaWdpbmFsVmFsdWU6IGluaXRpYWxWYWx1ZSxcbiAgICAgIHNhdmluZzogZmFsc2UsXG4gICAgICBlcnJvcjogbnVsbCxcblxuICAgICAgc3RhcnRFZGl0KCkge1xuICAgICAgICB0aGlzLmVkaXRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLm9yaWdpbmFsVmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAodGhpcyBhcyBhbnkpLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSAodGhpcyBhcyBhbnkpLiRlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCwgdGV4dGFyZWEnKTtcbiAgICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgfHwgaW5wdXQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB7XG4gICAgICAgICAgICAgIGlucHV0LnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBhc3luYyBzYXZlKCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gdGhpcy5vcmlnaW5hbFZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBbZmllbGRdOiB0aGlzLnZhbHVlIH0pLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gc2F2ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuZWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMub3JpZ2luYWxWYWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICAgICAgICAvLyBTaG93IHN1Y2Nlc3MgdG9hc3RcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxJU2hvd0ZsYXNoRXZlbnREZXRhaWw+KCdzaG93LWZsYXNoJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IHsgdHlwZTogJ3N1Y2Nlc3MnLCB0ZXh0OiAnTW9kaWZpY2F0aW9ucyBlbnJlZ2lzdHJcdTAwRTllcycgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmVycm9yID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcic7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8SVNob3dGbGFzaEV2ZW50RGV0YWlsPignc2hvdy1mbGFzaCcsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdFcnJldXIgbG9ycyBkZSBsYSBzYXV2ZWdhcmRlJyB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMuc2F2aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMub3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgdGhpcy5lZGl0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgfSxcblxuICAgICAgaGFuZGxlS2V5ZG93bihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyAmJiAhZS5zaGlmdEtleSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB2b2lkIHRoaXMuc2F2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogVGFzayBTZWFyY2ggQ29tcG9uZW50XG4gICAqIENsaWVudC1zaWRlIHRhc2sgc2VhcmNoIHdpdGggZGVib3VuY2luZ1xuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICd0YXNrU2VhcmNoJyxcbiAgICAoKTogSVRhc2tTZWFyY2hEYXRhID0+ICh7XG4gICAgICBxdWVyeTogJycsXG4gICAgICBzZWFyY2hpbmc6IGZhbHNlLFxuICAgICAgZGVib3VuY2VUaW1lcjogbnVsbCxcblxuICAgICAgc2VhcmNoKCkge1xuICAgICAgICBpZiAodGhpcy5kZWJvdW5jZVRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZGVib3VuY2VUaW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWFyY2hpbmcgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuZGVib3VuY2VUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAvLyBUcmlnZ2VyIEhUTVggc2VhcmNoIHJlcXVlc3RcbiAgICAgICAgICB3aW5kb3cuaHRteC5hamF4KCdHRVQnLCBgL3Rhc2tzP3NlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLnF1ZXJ5KX1gLCB7XG4gICAgICAgICAgICB0YXJnZXQ6ICcjdGFzay1saXN0LWNvbnRhaW5lcicsXG4gICAgICAgICAgICBzd2FwOiAnaW5uZXJIVE1MJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICB9LCAzMDApO1xuICAgICAgfSxcblxuICAgICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICAgICAgdGhpcy5zZWFyY2goKTtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogQ29uZmlybWF0aW9uIERpYWxvZyBDb21wb25lbnRcbiAgICogQ29uZmlybXMgZGVzdHJ1Y3RpdmUgYWN0aW9uc1xuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdjb25maXJtRGlhbG9nJyxcbiAgICAoKTogSUNvbmZpcm1EaWFsb2dEYXRhID0+ICh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIG1lc3NhZ2U6ICcnLFxuICAgICAgY29uZmlybVRleHQ6ICdDb25maXJtZXInLFxuICAgICAgY2FuY2VsVGV4dDogJ0FubnVsZXInLFxuICAgICAgb25Db25maXJtOiBudWxsLFxuXG4gICAgICBzaG93KG9wdGlvbnM6IElDb25maXJtRGlhbG9nT3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8ICdDb25maXJtYXRpb24nO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2UgfHwgJ1x1MDBDQXRlcy12b3VzIHNcdTAwRkJyID8nO1xuICAgICAgICB0aGlzLmNvbmZpcm1UZXh0ID0gb3B0aW9ucy5jb25maXJtVGV4dCB8fCAnQ29uZmlybWVyJztcbiAgICAgICAgdGhpcy5jYW5jZWxUZXh0ID0gb3B0aW9ucy5jYW5jZWxUZXh0IHx8ICdBbm51bGVyJztcbiAgICAgICAgdGhpcy5vbkNvbmZpcm0gPSBvcHRpb25zLm9uQ29uZmlybSB8fCBudWxsO1xuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgfSxcblxuICAgICAgY29uZmlybSgpIHtcbiAgICAgICAgaWYgKHRoaXMub25Db25maXJtICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9LFxuXG4gICAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Db25maXJtID0gbnVsbDtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcbn0pO1xuXG4vKipcbiAqIEhUTVggRXZlbnQgTGlzdGVuZXJzXG4gKiBHbG9iYWwgSFRNWCBjb25maWd1cmF0aW9uIGFuZCBldmVudCBoYW5kbGVyc1xuICovXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAvLyBTaG93IGxvYWRpbmcgaW5kaWNhdG9yIG9uIEhUTVggcmVxdWVzdHNcbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OmJlZm9yZVJlcXVlc3QnLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdodG14LWxvYWRpbmcnKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OmFmdGVyUmVxdWVzdCcsICgpID0+IHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2h0bXgtbG9hZGluZycpO1xuICB9KTtcblxuICAvLyBIYW5kbGUgZXJyb3JzIGZyb20gSFgtVHJpZ2dlciBoZWFkZXJcbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OnJlc3BvbnNlRXJyb3InLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgaHRteEV2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ7XG4gICAgY29uc3QgdHJpZ2dlckhlYWRlciA9IGh0bXhFdmVudC5kZXRhaWw/Lnhocj8uZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLVRyaWdnZXInKTtcbiAgICBpZiAodHJpZ2dlckhlYWRlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UodHJpZ2dlckhlYWRlcikgYXMgSUh4VHJpZ2dlckRhdGE7XG4gICAgICAgIGlmIChkYXRhLnNob3dFcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggY3VzdG9tIGV2ZW50IGZvciBmbGFzaCBtZXNzYWdlIHN5c3RlbVxuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PElTaG93Rmxhc2hFdmVudERldGFpbD4oJ3Nob3ctZmxhc2gnLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiBkYXRhLnNob3dFcnJvciB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGFyc2UgSFgtVHJpZ2dlciBoZWFkZXI6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gSGFuZGxlIHN1Y2Nlc3NmdWwgbXV0YXRpb25zXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDphZnRlclN3YXAnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgaHRteEV2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ7XG4gICAgY29uc3QgdHJpZ2dlckhlYWRlciA9IGh0bXhFdmVudC5kZXRhaWw/Lnhocj8uZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLVRyaWdnZXInKTtcbiAgICBpZiAodHJpZ2dlckhlYWRlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UodHJpZ2dlckhlYWRlcikgYXMgSUh4VHJpZ2dlckRhdGE7XG4gICAgICAgIGlmIChkYXRhLnNob3dTdWNjZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxJU2hvd0ZsYXNoRXZlbnREZXRhaWw+KCdzaG93LWZsYXNoJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IHsgdHlwZTogJ3N1Y2Nlc3MnLCB0ZXh0OiBkYXRhLnNob3dTdWNjZXNzIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSBIWC1UcmlnZ2VyIGhlYWRlcjonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBMEJBLFdBQVMsaUJBQWlCLGVBQWUsTUFBTTtBQUs3QyxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUF5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
