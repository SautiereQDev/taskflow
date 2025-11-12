'use strict';
(() => {
  // src/frontend/components/alpine-components.ts
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('themeSwitch', () => ({
      isDark: false,
      init() {
        const savedTheme = window.themeUtils.getSavedTheme();
        this.isDark = savedTheme === window.themeUtils.THEME_DARK;
        window.themeUtils.applyTheme(this.isDark);
        window.addEventListener('storage', (e) => {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2Zyb250ZW5kL2NvbXBvbmVudHMvYWxwaW5lLWNvbXBvbmVudHMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQWxwaW5lLmpzIENvbXBvbmVudHMgZm9yIFRhc2tGbG93XG4gKiBSZWFjdGl2ZSBVSSBjb21wb25lbnRzIHVzaW5nIEFscGluZS5qcyBmcmFtZXdvcmtcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIElDb25maXJtRGlhbG9nRGF0YSxcbiAgSUNvbmZpcm1EaWFsb2dPcHRpb25zLFxuICBJRHJvcGRvd25EYXRhLFxuICBJRmlsdGVyc1BhbmVsRGF0YSxcbiAgSUZvcm1WYWxpZGF0aW9uRGF0YSxcbiAgSUh4VHJpZ2dlckRhdGEsXG4gIElJbmxpbmVFZGl0RGF0YSxcbiAgSU1vZGFsRGF0YSxcbiAgSVNob3dGbGFzaEV2ZW50RGV0YWlsLFxuICBJVGFza1NlYXJjaERhdGEsXG4gIElUaGVtZVN3aXRjaERhdGEsXG4gIElUb2FzdCxcbiAgSVRvYXN0TWFuYWdlckRhdGEsXG4gIElWYWxpZGF0aW9uUnVsZXMsXG4gIFRvYXN0VHlwZSxcbn0gZnJvbSAnLi4vdHlwZXMvYWxwaW5lLmQudHMnO1xuXG4vKipcbiAqIEluaXRpYWxpemUgQWxwaW5lLmpzIGNvbXBvbmVudHMgb24gYWxwaW5lOmluaXQgZXZlbnRcbiAqL1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYWxwaW5lOmluaXQnLCAoKSA9PiB7XG4gIC8qKlxuICAgKiBUaGVtZSBTd2l0Y2ggQ29tcG9uZW50XG4gICAqIE1hbmFnZXMgZGFyay9saWdodCB0aGVtZSB0b2dnbGUgd2l0aCBsb2NhbFN0b3JhZ2UgcGVyc2lzdGVuY2VcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAndGhlbWVTd2l0Y2gnLFxuICAgICgpOiBJVGhlbWVTd2l0Y2hEYXRhID0+ICh7XG4gICAgICBpc0Rhcms6IGZhbHNlLFxuXG4gICAgICBpbml0KCkge1xuICAgICAgICAvLyBHZXQgc2F2ZWQgdGhlbWUgZnJvbSB0aGVtZVV0aWxzICh1c2VzICd0YXNrZmxvdy10aGVtZScga2V5KVxuICAgICAgICBjb25zdCBzYXZlZFRoZW1lID0gd2luZG93LnRoZW1lVXRpbHMuZ2V0U2F2ZWRUaGVtZSgpO1xuICAgICAgICB0aGlzLmlzRGFyayA9IHNhdmVkVGhlbWUgPT09IHdpbmRvdy50aGVtZVV0aWxzLlRIRU1FX0RBUks7XG4gICAgICAgIHdpbmRvdy50aGVtZVV0aWxzLmFwcGx5VGhlbWUodGhpcy5pc0RhcmspO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3Igc3RvcmFnZSBldmVudHMgKHN5bmMgYWNyb3NzIHRhYnMpXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgKGU6IFN0b3JhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleSA9PT0gd2luZG93LnRoZW1lVXRpbHMuU1RPUkFHRV9LRVkgJiYgZS5uZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pc0RhcmsgPSBlLm5ld1ZhbHVlID09PSB3aW5kb3cudGhlbWVVdGlscy5USEVNRV9EQVJLO1xuICAgICAgICAgICAgd2luZG93LnRoZW1lVXRpbHMuYXBwbHlUaGVtZSh0aGlzLmlzRGFyayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIHRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5pc0RhcmsgPSAhdGhpcy5pc0Rhcms7XG4gICAgICAgIGNvbnN0IHRoZW1lID0gdGhpcy5pc0RhcmsgPyB3aW5kb3cudGhlbWVVdGlscy5USEVNRV9EQVJLIDogd2luZG93LnRoZW1lVXRpbHMuVEhFTUVfTElHSFQ7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHdpbmRvdy50aGVtZVV0aWxzLlNUT1JBR0VfS0VZLCB0aGVtZSk7XG4gICAgICAgIHdpbmRvdy50aGVtZVV0aWxzLmFwcGx5VGhlbWUodGhpcy5pc0RhcmspO1xuICAgICAgfSxcbiAgICB9KVxuICApO1xuXG4gIC8qKlxuICAgKiBNb2RhbCBDb21wb25lbnRcbiAgICogTWFuYWdlcyBtb2RhbCBkaWFsb2dzIHdpdGggZm9jdXMgdHJhcCBhbmQga2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdtb2RhbCcsXG4gICAgKCk6IElNb2RhbERhdGEgPT4gKHtcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgZm9jdXNUcmFwOiBudWxsLFxuXG4gICAgICBzaG93KCkge1xuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cbiAgICAgICAgLy8gRm9jdXMgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnRcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgKHRoaXMgYXMgYW55KS4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgY29uc3QgZm9jdXNhYmxlID0gKHRoaXMgYXMgYW55KS4kZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICdidXR0b24sIFtocmVmXSwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChmb2N1c2FibGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICAgICAgICB0aGlzLmZvY3VzVHJhcCA9IGZvY3VzYWJsZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgIH0sXG5cbiAgICAgIGhhbmRsZUtleWRvd24oZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogRHJvcGRvd24gQ29tcG9uZW50XG4gICAqIEhhbmRsZXMgZHJvcGRvd24gbWVudXMgd2l0aCBjbGljay1vdXRzaWRlIGRldGVjdGlvblxuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdkcm9wZG93bicsXG4gICAgKCk6IElEcm9wZG93bkRhdGEgPT4gKHtcbiAgICAgIG9wZW46IGZhbHNlLFxuXG4gICAgICB0b2dnbGUoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9ICF0aGlzLm9wZW47XG4gICAgICB9LFxuXG4gICAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIEZvcm0gVmFsaWRhdGlvbiBDb21wb25lbnRcbiAgICogQ2xpZW50LXNpZGUgZm9ybSB2YWxpZGF0aW9uIHdpdGggcmVhbC10aW1lIGZlZWRiYWNrXG4gICAqL1xuICB3aW5kb3cuQWxwaW5lLmRhdGEoXG4gICAgJ2Zvcm1WYWxpZGF0aW9uJyxcbiAgICAoKTogSUZvcm1WYWxpZGF0aW9uRGF0YSA9PiAoe1xuICAgICAgZXJyb3JzOiB7fSxcbiAgICAgIHRvdWNoZWQ6IHt9LFxuXG4gICAgICB2YWxpZGF0ZShmaWVsZDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBydWxlczogSVZhbGlkYXRpb25SdWxlcyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgaWYgKHJ1bGVzLnJlcXVpcmVkID09PSB0cnVlICYmICF2YWx1ZSkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKCdDZSBjaGFtcCBlc3QgcmVxdWlzJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocnVsZXMubWluTGVuZ3RoICE9PSB1bmRlZmluZWQgJiYgdmFsdWUubGVuZ3RoIDwgcnVsZXMubWluTGVuZ3RoKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goYE1pbmltdW0gJHtydWxlcy5taW5MZW5ndGh9IGNhcmFjdFx1MDBFOHJlc2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJ1bGVzLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLmxlbmd0aCA+IHJ1bGVzLm1heExlbmd0aCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGBNYXhpbXVtICR7cnVsZXMubWF4TGVuZ3RofSBjYXJhY3RcdTAwRThyZXNgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChydWxlcy5lbWFpbCA9PT0gdHJ1ZSAmJiB2YWx1ZSAmJiAhL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaCgnRW1haWwgaW52YWxpZGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXJyb3JzW2ZpZWxkXSA9IGVycm9ycztcbiAgICAgICAgcmV0dXJuIGVycm9ycy5sZW5ndGggPT09IDA7XG4gICAgICB9LFxuXG4gICAgICB0b3VjaChmaWVsZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudG91Y2hlZFtmaWVsZF0gPSB0cnVlO1xuICAgICAgfSxcblxuICAgICAgaGFzRXJyb3IoZmllbGQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIHRoaXMudG91Y2hlZFtmaWVsZF0gPT09IHRydWUgJiZcbiAgICAgICAgICB0aGlzLmVycm9yc1tmaWVsZF0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgIHRoaXMuZXJyb3JzW2ZpZWxkXS5sZW5ndGggPiAwXG4gICAgICAgICk7XG4gICAgICB9LFxuXG4gICAgICBnZXRFcnJvcihmaWVsZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzRXJyb3IoZmllbGQpID8gdGhpcy5lcnJvcnNbZmllbGRdWzBdIDogJyc7XG4gICAgICB9LFxuICAgIH0pXG4gICk7XG5cbiAgLyoqXG4gICAqIEZpbHRlcnMgUGFuZWwgQ29tcG9uZW50XG4gICAqIE1hbmFnZXMgY29sbGFwc2libGUgZmlsdGVyIHNpZGViYXIgd2l0aCBwZXJzaXN0ZW5jZVxuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdmaWx0ZXJzUGFuZWwnLFxuICAgICgpOiBJRmlsdGVyc1BhbmVsRGF0YSA9PiAoe1xuICAgICAgb3Blbjogd2luZG93LkFscGluZS4kcGVyc2lzdCh0cnVlKS5hcygnZmlsdGVyc1BhbmVsX29wZW4nKSxcbiAgICAgIGZpbHRlcnM6IHdpbmRvdy5BbHBpbmUuJHBlcnNpc3Qoe30pLmFzKCd0YXNrRmlsdGVycycpLFxuXG4gICAgICB0b2dnbGUoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9ICF0aGlzLm9wZW47XG4gICAgICB9LFxuXG4gICAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5maWx0ZXJzID0ge307XG4gICAgICAgIC8vIFRyaWdnZXIgSFRNWCB0byByZWxvYWQgd2l0aCBubyBmaWx0ZXJzXG4gICAgICAgIHdpbmRvdy5odG14LmFqYXgoJ0dFVCcsICcvdGFza3MnLCB7XG4gICAgICAgICAgdGFyZ2V0OiAnI3Rhc2stbGlzdC1jb250YWluZXInLFxuICAgICAgICAgIHN3YXA6ICdpbm5lckhUTUwnLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIGFwcGx5KCkge1xuICAgICAgICAvLyBUcmlnZ2VyIEhUTVggcmVxdWVzdCB3aXRoIGZpbHRlcnMgYXMgcXVlcnkgcGFyYW1zXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoXG4gICAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5maWx0ZXJzKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW2tleSwgU3RyaW5nKHZhbHVlKV0pXG4gICAgICAgICk7XG4gICAgICAgIHdpbmRvdy5odG14LmFqYXgoJ0dFVCcsIGAvdGFza3M/JHtwYXJhbXMudG9TdHJpbmcoKX1gLCB7XG4gICAgICAgICAgdGFyZ2V0OiAnI3Rhc2stbGlzdC1jb250YWluZXInLFxuICAgICAgICAgIHN3YXA6ICdpbm5lckhUTUwnLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogVG9hc3QgTm90aWZpY2F0aW9uIENvbXBvbmVudFxuICAgKiBEaXNwbGF5cyB0ZW1wb3JhcnkgdG9hc3Qgbm90aWZpY2F0aW9ucyB3aXRoIGF1dG8tZGlzbWlzc1xuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICd0b2FzdE1hbmFnZXInLFxuICAgICgpOiBJVG9hc3RNYW5hZ2VyRGF0YSA9PiAoe1xuICAgICAgdG9hc3RzOiBbXSxcbiAgICAgIG5leHRJZDogMSxcblxuICAgICAgaW5pdCgpIHtcbiAgICAgICAgLy8gTGlzdGVuIGZvciBjdXN0b20gZmxhc2ggZXZlbnRzXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzaG93LWZsYXNoJywgKGV2ZW50OiBDdXN0b21FdmVudDxJU2hvd0ZsYXNoRXZlbnREZXRhaWw+KSA9PiB7XG4gICAgICAgICAgdGhpcy5zaG93KGV2ZW50LmRldGFpbC50ZXh0LCBldmVudC5kZXRhaWwudHlwZSB8fCAnaW5mbycpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIEhUTVggc3VjY2Vzcy9lcnJvciBldmVudHNcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OmFmdGVyU3dhcCcsIChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBodG14RXZlbnQgPSBldmVudCBhcyBDdXN0b21FdmVudDtcbiAgICAgICAgICBjb25zdCB0cmlnZ2VyID0gaHRteEV2ZW50LmRldGFpbD8ueGhyPy5nZXRSZXNwb25zZUhlYWRlcignSFgtVHJpZ2dlcicpO1xuICAgICAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh0cmlnZ2VyKSBhcyBJSHhUcmlnZ2VyRGF0YTtcbiAgICAgICAgICAgICAgaWYgKGRhdGEuc2hvd1N1Y2Nlc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdyhkYXRhLnNob3dTdWNjZXNzLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChkYXRhLnNob3dFcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KGRhdGEuc2hvd0Vycm9yLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIEhYLVRyaWdnZXI6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBzaG93KG1lc3NhZ2U6IHN0cmluZywgdHlwZTogVG9hc3RUeXBlID0gJ2luZm8nLCBkdXJhdGlvbiA9IDQwMDApIHtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLm5leHRJZCsrO1xuICAgICAgICBjb25zdCB0b2FzdDogSVRvYXN0ID0geyBpZCwgbWVzc2FnZSwgdHlwZSwgdmlzaWJsZTogdHJ1ZSB9O1xuICAgICAgICB0aGlzLnRvYXN0cy5wdXNoKHRvYXN0KTtcblxuICAgICAgICAvLyBBdXRvLWRpc21pc3MgYWZ0ZXIgZHVyYXRpb25cbiAgICAgICAgaWYgKGR1cmF0aW9uID4gMCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNtaXNzKGlkKTtcbiAgICAgICAgICB9LCBkdXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGRpc21pc3MoaWQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMudG9hc3RzLmZpbmRJbmRleCgodCkgPT4gdC5pZCA9PT0gaWQpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy50b2FzdHNbaW5kZXhdLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudG9hc3RzID0gdGhpcy50b2FzdHMuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSBpZCk7XG4gICAgICAgICAgfSwgMzAwKTsgLy8gV2FpdCBmb3IgYW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGdldEFsZXJ0Q2xhc3ModHlwZTogVG9hc3RUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY2xhc3NlczogUmVjb3JkPFRvYXN0VHlwZSwgc3RyaW5nPiA9IHtcbiAgICAgICAgICBzdWNjZXNzOiAnYWxlcnQtc3VjY2VzcycsXG4gICAgICAgICAgZXJyb3I6ICdhbGVydC1lcnJvcicsXG4gICAgICAgICAgd2FybmluZzogJ2FsZXJ0LXdhcm5pbmcnLFxuICAgICAgICAgIGluZm86ICdhbGVydC1pbmZvJyxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNsYXNzZXNbdHlwZV0gfHwgJ2FsZXJ0LWluZm8nO1xuICAgICAgfSxcblxuICAgICAgZ2V0SWNvbih0eXBlOiBUb2FzdFR5cGUpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBpY29uczogUmVjb3JkPFRvYXN0VHlwZSwgc3RyaW5nPiA9IHtcbiAgICAgICAgICBzdWNjZXNzOiAnXHUyNzEzJyxcbiAgICAgICAgICBlcnJvcjogJ1x1MjcxNScsXG4gICAgICAgICAgd2FybmluZzogJ1x1MjZBMCcsXG4gICAgICAgICAgaW5mbzogJ1x1MjEzOScsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBpY29uc1t0eXBlXSB8fCAnXHUyMTM5JztcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogSW5saW5lIEVkaXQgQ29tcG9uZW50XG4gICAqIEVuYWJsZXMgaW5saW5lIGVkaXRpbmcgb2YgdGV4dCBmaWVsZHMgd2l0aCBQQVRDSCBBUElcbiAgICovXG4gIHdpbmRvdy5BbHBpbmUuZGF0YShcbiAgICAnaW5saW5lRWRpdCcsXG4gICAgKGluaXRpYWxWYWx1ZSA9ICcnLCBlbmRwb2ludCA9ICcnLCBmaWVsZCA9ICcnKTogSUlubGluZUVkaXREYXRhID0+ICh7XG4gICAgICBlZGl0aW5nOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBpbml0aWFsVmFsdWUsXG4gICAgICBvcmlnaW5hbFZhbHVlOiBpbml0aWFsVmFsdWUsXG4gICAgICBzYXZpbmc6IGZhbHNlLFxuICAgICAgZXJyb3I6IG51bGwsXG5cbiAgICAgIHN0YXJ0RWRpdCgpIHtcbiAgICAgICAgdGhpcy5lZGl0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgKHRoaXMgYXMgYW55KS4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgY29uc3QgaW5wdXQgPSAodGhpcyBhcyBhbnkpLiRlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCwgdGV4dGFyZWEnKTtcbiAgICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgfHwgaW5wdXQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB7XG4gICAgICAgICAgICAgIGlucHV0LnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBhc3luYyBzYXZlKCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gdGhpcy5vcmlnaW5hbFZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBbZmllbGRdOiB0aGlzLnZhbHVlIH0pLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gc2F2ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuZWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMub3JpZ2luYWxWYWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICAgICAgICAvLyBTaG93IHN1Y2Nlc3MgdG9hc3RcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxJU2hvd0ZsYXNoRXZlbnREZXRhaWw+KCdzaG93LWZsYXNoJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IHsgdHlwZTogJ3N1Y2Nlc3MnLCB0ZXh0OiAnTW9kaWZpY2F0aW9ucyBlbnJlZ2lzdHJcdTAwRTllcycgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmVycm9yID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcic7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8SVNob3dGbGFzaEV2ZW50RGV0YWlsPignc2hvdy1mbGFzaCcsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdFcnJldXIgbG9ycyBkZSBsYSBzYXV2ZWdhcmRlJyB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMuc2F2aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMub3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgdGhpcy5lZGl0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgfSxcblxuICAgICAgaGFuZGxlS2V5ZG93bihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyAmJiAhZS5zaGlmdEtleSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB2b2lkIHRoaXMuc2F2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogVGFzayBTZWFyY2ggQ29tcG9uZW50XG4gICAqIENsaWVudC1zaWRlIHRhc2sgc2VhcmNoIHdpdGggZGVib3VuY2luZ1xuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICd0YXNrU2VhcmNoJyxcbiAgICAoKTogSVRhc2tTZWFyY2hEYXRhID0+ICh7XG4gICAgICBxdWVyeTogJycsXG4gICAgICBzZWFyY2hpbmc6IGZhbHNlLFxuICAgICAgZGVib3VuY2VUaW1lcjogbnVsbCxcblxuICAgICAgc2VhcmNoKCkge1xuICAgICAgICBpZiAodGhpcy5kZWJvdW5jZVRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZGVib3VuY2VUaW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWFyY2hpbmcgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuZGVib3VuY2VUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAvLyBUcmlnZ2VyIEhUTVggc2VhcmNoIHJlcXVlc3RcbiAgICAgICAgICB3aW5kb3cuaHRteC5hamF4KCdHRVQnLCBgL3Rhc2tzP3NlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLnF1ZXJ5KX1gLCB7XG4gICAgICAgICAgICB0YXJnZXQ6ICcjdGFzay1saXN0LWNvbnRhaW5lcicsXG4gICAgICAgICAgICBzd2FwOiAnaW5uZXJIVE1MJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnNlYXJjaGluZyA9IGZhbHNlO1xuICAgICAgICB9LCAzMDApO1xuICAgICAgfSxcblxuICAgICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICAgICAgdGhpcy5zZWFyY2goKTtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcblxuICAvKipcbiAgICogQ29uZmlybWF0aW9uIERpYWxvZyBDb21wb25lbnRcbiAgICogQ29uZmlybXMgZGVzdHJ1Y3RpdmUgYWN0aW9uc1xuICAgKi9cbiAgd2luZG93LkFscGluZS5kYXRhKFxuICAgICdjb25maXJtRGlhbG9nJyxcbiAgICAoKTogSUNvbmZpcm1EaWFsb2dEYXRhID0+ICh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIG1lc3NhZ2U6ICcnLFxuICAgICAgY29uZmlybVRleHQ6ICdDb25maXJtZXInLFxuICAgICAgY2FuY2VsVGV4dDogJ0FubnVsZXInLFxuICAgICAgb25Db25maXJtOiBudWxsLFxuXG4gICAgICBzaG93KG9wdGlvbnM6IElDb25maXJtRGlhbG9nT3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlID8/ICdDb25maXJtYXRpb24nO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2UgPz8gJ1x1MDBDQXRlcy12b3VzIHNcdTAwRkJyID8nO1xuICAgICAgICB0aGlzLmNvbmZpcm1UZXh0ID0gb3B0aW9ucy5jb25maXJtVGV4dCA/PyAnQ29uZmlybWVyJztcbiAgICAgICAgdGhpcy5jYW5jZWxUZXh0ID0gb3B0aW9ucy5jYW5jZWxUZXh0ID8/ICdBbm51bGVyJztcbiAgICAgICAgdGhpcy5vbkNvbmZpcm0gPSBvcHRpb25zLm9uQ29uZmlybSA/PyBudWxsO1xuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgfSxcblxuICAgICAgY29uZmlybSgpIHtcbiAgICAgICAgaWYgKHRoaXMub25Db25maXJtICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9LFxuXG4gICAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Db25maXJtID0gbnVsbDtcbiAgICAgIH0sXG4gICAgfSlcbiAgKTtcbn0pO1xuXG4vKipcbiAqIEhUTVggRXZlbnQgTGlzdGVuZXJzXG4gKiBHbG9iYWwgSFRNWCBjb25maWd1cmF0aW9uIGFuZCBldmVudCBoYW5kbGVyc1xuICovXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAvLyBTaG93IGxvYWRpbmcgaW5kaWNhdG9yIG9uIEhUTVggcmVxdWVzdHNcbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OmJlZm9yZVJlcXVlc3QnLCAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdodG14LWxvYWRpbmcnKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OmFmdGVyUmVxdWVzdCcsICgpID0+IHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2h0bXgtbG9hZGluZycpO1xuICB9KTtcblxuICAvLyBIYW5kbGUgZXJyb3JzIGZyb20gSFgtVHJpZ2dlciBoZWFkZXJcbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdodG14OnJlc3BvbnNlRXJyb3InLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgaHRteEV2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ7XG4gICAgY29uc3QgdHJpZ2dlckhlYWRlciA9IGh0bXhFdmVudC5kZXRhaWw/Lnhocj8uZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLVRyaWdnZXInKTtcbiAgICBpZiAodHJpZ2dlckhlYWRlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UodHJpZ2dlckhlYWRlcikgYXMgSUh4VHJpZ2dlckRhdGE7XG4gICAgICAgIGlmIChkYXRhLnNob3dFcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggY3VzdG9tIGV2ZW50IGZvciBmbGFzaCBtZXNzYWdlIHN5c3RlbVxuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PElTaG93Rmxhc2hFdmVudERldGFpbD4oJ3Nob3ctZmxhc2gnLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiBkYXRhLnNob3dFcnJvciB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGFyc2UgSFgtVHJpZ2dlciBoZWFkZXI6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gSGFuZGxlIHN1Y2Nlc3NmdWwgbXV0YXRpb25zXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDphZnRlclN3YXAnLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgY29uc3QgaHRteEV2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ7XG4gICAgY29uc3QgdHJpZ2dlckhlYWRlciA9IGh0bXhFdmVudC5kZXRhaWw/Lnhocj8uZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLVRyaWdnZXInKTtcbiAgICBpZiAodHJpZ2dlckhlYWRlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UodHJpZ2dlckhlYWRlcikgYXMgSUh4VHJpZ2dlckRhdGE7XG4gICAgICAgIGlmIChkYXRhLnNob3dTdWNjZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxJU2hvd0ZsYXNoRXZlbnREZXRhaWw+KCdzaG93LWZsYXNoJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IHsgdHlwZTogJ3N1Y2Nlc3MnLCB0ZXh0OiBkYXRhLnNob3dTdWNjZXNzIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSBIWC1UcmlnZ2VyIGhlYWRlcjonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBMEJBLFdBQVMsaUJBQWlCLGVBQWUsTUFBTTtBQUs3QyxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUF5QjtBQUFBLFFBQ3ZCLFFBQVE7QUFBQSxRQUVSLE9BQU87QUFFTCxnQkFBTSxhQUFhLE9BQU8sV0FBVyxjQUFjO0FBQ25ELGVBQUssU0FBUyxlQUFlLE9BQU8sV0FBVztBQUMvQyxpQkFBTyxXQUFXLFdBQVcsS0FBSyxNQUFNO0FBR3hDLGlCQUFPLGlCQUFpQixXQUFXLENBQUMsTUFBb0I7QUFDdEQsZ0JBQUksRUFBRSxRQUFRLE9BQU8sV0FBVyxlQUFlLEVBQUUsVUFBVTtBQUN6RCxtQkFBSyxTQUFTLEVBQUUsYUFBYSxPQUFPLFdBQVc7QUFDL0MscUJBQU8sV0FBVyxXQUFXLEtBQUssTUFBTTtBQUFBLFlBQzFDO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUFBLFFBRUEsU0FBUztBQUNQLGVBQUssU0FBUyxDQUFDLEtBQUs7QUFDcEIsZ0JBQU0sUUFBUSxLQUFLLFNBQVMsT0FBTyxXQUFXLGFBQWEsT0FBTyxXQUFXO0FBQzdFLHVCQUFhLFFBQVEsT0FBTyxXQUFXLGFBQWEsS0FBSztBQUN6RCxpQkFBTyxXQUFXLFdBQVcsS0FBSyxNQUFNO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQU1BLFdBQU8sT0FBTztBQUFBLE1BQ1o7QUFBQSxNQUNBLE9BQW1CO0FBQUEsUUFDakIsTUFBTTtBQUFBLFFBQ04sV0FBVztBQUFBLFFBRVgsT0FBTztBQUNMLGVBQUssT0FBTztBQUNaLG1CQUFTLEtBQUssTUFBTSxXQUFXO0FBSS9CLFVBQUMsS0FBYSxVQUFVLE1BQU07QUFFNUIsa0JBQU0sWUFBYSxLQUFhLElBQUk7QUFBQSxjQUNsQztBQUFBLFlBQ0Y7QUFDQSxnQkFBSSxxQkFBcUIsYUFBYTtBQUNwQyx3QkFBVSxNQUFNO0FBQ2hCLG1CQUFLLFlBQVk7QUFBQSxZQUNuQjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxRQUVBLE9BQU87QUFDTCxlQUFLLE9BQU87QUFDWixtQkFBUyxLQUFLLE1BQU0sV0FBVztBQUFBLFFBQ2pDO0FBQUEsUUFFQSxjQUFjLEdBQWtCO0FBQzlCLGNBQUksRUFBRSxRQUFRLFVBQVU7QUFDdEIsaUJBQUssS0FBSztBQUFBLFVBQ1o7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFNQSxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUFzQjtBQUFBLFFBQ3BCLE1BQU07QUFBQSxRQUVOLFNBQVM7QUFDUCxlQUFLLE9BQU8sQ0FBQyxLQUFLO0FBQUEsUUFDcEI7QUFBQSxRQUVBLFFBQVE7QUFDTixlQUFLLE9BQU87QUFBQSxRQUNkO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFNQSxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUE0QjtBQUFBLFFBQzFCLFFBQVEsQ0FBQztBQUFBLFFBQ1QsU0FBUyxDQUFDO0FBQUEsUUFFVixTQUFTLE9BQWUsT0FBZSxPQUFrQztBQUN2RSxnQkFBTSxTQUFtQixDQUFDO0FBRTFCLGNBQUksTUFBTSxhQUFhLFFBQVEsQ0FBQyxPQUFPO0FBQ3JDLG1CQUFPLEtBQUsscUJBQXFCO0FBQUEsVUFDbkM7QUFFQSxjQUFJLE1BQU0sY0FBYyxVQUFhLE1BQU0sU0FBUyxNQUFNLFdBQVc7QUFDbkUsbUJBQU8sS0FBSyxXQUFXLE1BQU0sU0FBUyxnQkFBYTtBQUFBLFVBQ3JEO0FBRUEsY0FBSSxNQUFNLGNBQWMsVUFBYSxNQUFNLFNBQVMsTUFBTSxXQUFXO0FBQ25FLG1CQUFPLEtBQUssV0FBVyxNQUFNLFNBQVMsZ0JBQWE7QUFBQSxVQUNyRDtBQUVBLGNBQUksTUFBTSxVQUFVLFFBQVEsU0FBUyxDQUFDLDZCQUE2QixLQUFLLEtBQUssR0FBRztBQUM5RSxtQkFBTyxLQUFLLGdCQUFnQjtBQUFBLFVBQzlCO0FBRUEsZUFBSyxPQUFPLEtBQUssSUFBSTtBQUNyQixpQkFBTyxPQUFPLFdBQVc7QUFBQSxRQUMzQjtBQUFBLFFBRUEsTUFBTSxPQUFlO0FBQ25CLGVBQUssUUFBUSxLQUFLLElBQUk7QUFBQSxRQUN4QjtBQUFBLFFBRUEsU0FBUyxPQUF3QjtBQUMvQixpQkFDRSxLQUFLLFFBQVEsS0FBSyxNQUFNLFFBQ3hCLEtBQUssT0FBTyxLQUFLLE1BQU0sVUFDdkIsS0FBSyxPQUFPLEtBQUssRUFBRSxTQUFTO0FBQUEsUUFFaEM7QUFBQSxRQUVBLFNBQVMsT0FBdUI7QUFDOUIsaUJBQU8sS0FBSyxTQUFTLEtBQUssSUFBSSxLQUFLLE9BQU8sS0FBSyxFQUFFLENBQUMsSUFBSTtBQUFBLFFBQ3hEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFNQSxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUEwQjtBQUFBLFFBQ3hCLE1BQU0sT0FBTyxPQUFPLFNBQVMsSUFBSSxFQUFFLEdBQUcsbUJBQW1CO0FBQUEsUUFDekQsU0FBUyxPQUFPLE9BQU8sU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLGFBQWE7QUFBQSxRQUVwRCxTQUFTO0FBQ1AsZUFBSyxPQUFPLENBQUMsS0FBSztBQUFBLFFBQ3BCO0FBQUEsUUFFQSxRQUFRO0FBQ04sZUFBSyxVQUFVLENBQUM7QUFFaEIsaUJBQU8sS0FBSyxLQUFLLE9BQU8sVUFBVTtBQUFBLFlBQ2hDLFFBQVE7QUFBQSxZQUNSLE1BQU07QUFBQSxVQUNSLENBQUM7QUFBQSxRQUNIO0FBQUEsUUFFQSxRQUFRO0FBRU4sZ0JBQU0sU0FBUyxJQUFJO0FBQUEsWUFDakIsT0FBTyxRQUFRLEtBQUssT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsS0FBSyxPQUFPLEtBQUssQ0FBQyxDQUFDO0FBQUEsVUFDekU7QUFDQSxpQkFBTyxLQUFLLEtBQUssT0FBTyxVQUFVLE9BQU8sU0FBUyxDQUFDLElBQUk7QUFBQSxZQUNyRCxRQUFRO0FBQUEsWUFDUixNQUFNO0FBQUEsVUFDUixDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBTUEsV0FBTyxPQUFPO0FBQUEsTUFDWjtBQUFBLE1BQ0EsT0FBMEI7QUFBQSxRQUN4QixRQUFRLENBQUM7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUVSLE9BQU87QUFFTCxpQkFBTyxpQkFBaUIsY0FBYyxDQUFDLFVBQThDO0FBQ25GLGlCQUFLLEtBQUssTUFBTSxPQUFPLE1BQU0sTUFBTSxPQUFPLFFBQVEsTUFBTTtBQUFBLFVBQzFELENBQUM7QUFHRCxtQkFBUyxLQUFLLGlCQUFpQixrQkFBa0IsQ0FBQyxVQUFpQjtBQUNqRSxrQkFBTSxZQUFZO0FBQ2xCLGtCQUFNLFVBQVUsVUFBVSxRQUFRLEtBQUssa0JBQWtCLFlBQVk7QUFDckUsZ0JBQUksU0FBUztBQUNYLGtCQUFJO0FBQ0Ysc0JBQU0sT0FBTyxLQUFLLE1BQU0sT0FBTztBQUMvQixvQkFBSSxLQUFLLGdCQUFnQixRQUFXO0FBQ2xDLHVCQUFLLEtBQUssS0FBSyxhQUFhLFNBQVM7QUFBQSxnQkFDdkM7QUFDQSxvQkFBSSxLQUFLLGNBQWMsUUFBVztBQUNoQyx1QkFBSyxLQUFLLEtBQUssV0FBVyxPQUFPO0FBQUEsZ0JBQ25DO0FBQUEsY0FDRixTQUFTLE9BQU87QUFDZCx3QkFBUSxNQUFNLCtCQUErQixLQUFLO0FBQUEsY0FDcEQ7QUFBQSxZQUNGO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUFBLFFBRUEsS0FBSyxTQUFpQixPQUFrQixRQUFRLFdBQVcsS0FBTTtBQUMvRCxnQkFBTSxLQUFLLEtBQUs7QUFDaEIsZ0JBQU0sUUFBZ0IsRUFBRSxJQUFJLFNBQVMsTUFBTSxTQUFTLEtBQUs7QUFDekQsZUFBSyxPQUFPLEtBQUssS0FBSztBQUd0QixjQUFJLFdBQVcsR0FBRztBQUNoQix1QkFBVyxNQUFNO0FBQ2YsbUJBQUssUUFBUSxFQUFFO0FBQUEsWUFDakIsR0FBRyxRQUFRO0FBQUEsVUFDYjtBQUFBLFFBQ0Y7QUFBQSxRQUVBLFFBQVEsSUFBWTtBQUNsQixnQkFBTSxRQUFRLEtBQUssT0FBTyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUN0RCxjQUFJLFVBQVUsSUFBSTtBQUNoQixpQkFBSyxPQUFPLEtBQUssRUFBRSxVQUFVO0FBQzdCLHVCQUFXLE1BQU07QUFDZixtQkFBSyxTQUFTLEtBQUssT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUFBLFlBQ3JELEdBQUcsR0FBRztBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBQUEsUUFFQSxjQUFjLE1BQXlCO0FBQ3JDLGdCQUFNLFVBQXFDO0FBQUEsWUFDekMsU0FBUztBQUFBLFlBQ1QsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsTUFBTTtBQUFBLFVBQ1I7QUFDQSxpQkFBTyxRQUFRLElBQUksS0FBSztBQUFBLFFBQzFCO0FBQUEsUUFFQSxRQUFRLE1BQXlCO0FBQy9CLGdCQUFNLFFBQW1DO0FBQUEsWUFDdkMsU0FBUztBQUFBLFlBQ1QsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsTUFBTTtBQUFBLFVBQ1I7QUFDQSxpQkFBTyxNQUFNLElBQUksS0FBSztBQUFBLFFBQ3hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFNQSxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxDQUFDLGVBQWUsSUFBSSxXQUFXLElBQUksUUFBUSxRQUF5QjtBQUFBLFFBQ2xFLFNBQVM7QUFBQSxRQUNULE9BQU87QUFBQSxRQUNQLGVBQWU7QUFBQSxRQUNmLFFBQVE7QUFBQSxRQUNSLE9BQU87QUFBQSxRQUVQLFlBQVk7QUFDVixlQUFLLFVBQVU7QUFDZixlQUFLLGdCQUFnQixLQUFLO0FBRTFCLFVBQUMsS0FBYSxVQUFVLE1BQU07QUFFNUIsa0JBQU0sUUFBUyxLQUFhLElBQUksY0FBYyxpQkFBaUI7QUFDL0QsZ0JBQUksaUJBQWlCLGFBQWE7QUFDaEMsb0JBQU0sTUFBTTtBQUNaLGtCQUFJLGlCQUFpQixvQkFBb0IsaUJBQWlCLHFCQUFxQjtBQUM3RSxzQkFBTSxPQUFPO0FBQUEsY0FDZjtBQUFBLFlBQ0Y7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsUUFFQSxNQUFNLE9BQU87QUFDWCxjQUFJLEtBQUssVUFBVSxLQUFLLGVBQWU7QUFDckMsaUJBQUssT0FBTztBQUNaO0FBQUEsVUFDRjtBQUVBLGVBQUssU0FBUztBQUNkLGVBQUssUUFBUTtBQUViLGNBQUk7QUFDRixrQkFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVO0FBQUEsY0FDckMsUUFBUTtBQUFBLGNBQ1IsU0FBUztBQUFBLGdCQUNQLGdCQUFnQjtBQUFBLGdCQUNoQixvQkFBb0I7QUFBQSxjQUN0QjtBQUFBLGNBQ0EsTUFBTSxLQUFLLFVBQVUsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLE1BQU0sQ0FBQztBQUFBLFlBQzlDLENBQUM7QUFFRCxnQkFBSSxDQUFDLFNBQVMsSUFBSTtBQUNoQixvQkFBTSxJQUFJLE1BQU0sZ0JBQWdCO0FBQUEsWUFDbEM7QUFFQSxpQkFBSyxVQUFVO0FBQ2YsaUJBQUssZ0JBQWdCLEtBQUs7QUFHMUIsbUJBQU87QUFBQSxjQUNMLElBQUksWUFBbUMsY0FBYztBQUFBLGdCQUNuRCxRQUFRLEVBQUUsTUFBTSxXQUFXLE1BQU0sZ0NBQTZCO0FBQUEsY0FDaEUsQ0FBQztBQUFBLFlBQ0g7QUFBQSxVQUNGLFNBQVMsT0FBTztBQUNkLGlCQUFLLFFBQVEsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0FBQ3RELG1CQUFPO0FBQUEsY0FDTCxJQUFJLFlBQW1DLGNBQWM7QUFBQSxnQkFDbkQsUUFBUSxFQUFFLE1BQU0sU0FBUyxNQUFNLCtCQUErQjtBQUFBLGNBQ2hFLENBQUM7QUFBQSxZQUNIO0FBQUEsVUFDRixVQUFFO0FBQ0EsaUJBQUssU0FBUztBQUFBLFVBQ2hCO0FBQUEsUUFDRjtBQUFBLFFBRUEsU0FBUztBQUNQLGVBQUssUUFBUSxLQUFLO0FBQ2xCLGVBQUssVUFBVTtBQUNmLGVBQUssUUFBUTtBQUFBLFFBQ2Y7QUFBQSxRQUVBLGNBQWMsR0FBa0I7QUFDOUIsY0FBSSxFQUFFLFFBQVEsV0FBVyxDQUFDLEVBQUUsVUFBVTtBQUNwQyxjQUFFLGVBQWU7QUFDakIsaUJBQUssS0FBSyxLQUFLO0FBQUEsVUFDakIsV0FBVyxFQUFFLFFBQVEsVUFBVTtBQUM3QixpQkFBSyxPQUFPO0FBQUEsVUFDZDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQU1BLFdBQU8sT0FBTztBQUFBLE1BQ1o7QUFBQSxNQUNBLE9BQXdCO0FBQUEsUUFDdEIsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsZUFBZTtBQUFBLFFBRWYsU0FBUztBQUNQLGNBQUksS0FBSyxrQkFBa0IsTUFBTTtBQUMvQix5QkFBYSxLQUFLLGFBQWE7QUFBQSxVQUNqQztBQUNBLGVBQUssWUFBWTtBQUVqQixlQUFLLGdCQUFnQixPQUFPLFdBQVcsTUFBTTtBQUUzQyxtQkFBTyxLQUFLLEtBQUssT0FBTyxpQkFBaUIsbUJBQW1CLEtBQUssS0FBSyxDQUFDLElBQUk7QUFBQSxjQUN6RSxRQUFRO0FBQUEsY0FDUixNQUFNO0FBQUEsWUFDUixDQUFDO0FBQ0QsaUJBQUssWUFBWTtBQUFBLFVBQ25CLEdBQUcsR0FBRztBQUFBLFFBQ1I7QUFBQSxRQUVBLFFBQVE7QUFDTixlQUFLLFFBQVE7QUFDYixlQUFLLE9BQU87QUFBQSxRQUNkO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFNQSxXQUFPLE9BQU87QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUEyQjtBQUFBLFFBQ3pCLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLFlBQVk7QUFBQSxRQUNaLFdBQVc7QUFBQSxRQUVYLEtBQUssVUFBaUMsQ0FBQyxHQUFHO0FBQ3hDLGVBQUssUUFBUSxRQUFRLFNBQVM7QUFDOUIsZUFBSyxVQUFVLFFBQVEsV0FBVztBQUNsQyxlQUFLLGNBQWMsUUFBUSxlQUFlO0FBQzFDLGVBQUssYUFBYSxRQUFRLGNBQWM7QUFDeEMsZUFBSyxZQUFZLFFBQVEsYUFBYTtBQUN0QyxlQUFLLE9BQU87QUFBQSxRQUNkO0FBQUEsUUFFQSxVQUFVO0FBQ1IsY0FBSSxLQUFLLGNBQWMsTUFBTTtBQUMzQixpQkFBSyxVQUFVO0FBQUEsVUFDakI7QUFDQSxlQUFLLE1BQU07QUFBQSxRQUNiO0FBQUEsUUFFQSxRQUFRO0FBQ04sZUFBSyxPQUFPO0FBQ1osZUFBSyxZQUFZO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQU1ELFdBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBRWxELGFBQVMsS0FBSyxpQkFBaUIsc0JBQXNCLE1BQU07QUFDekQsZUFBUyxLQUFLLFVBQVUsSUFBSSxjQUFjO0FBQUEsSUFDNUMsQ0FBQztBQUVELGFBQVMsS0FBSyxpQkFBaUIscUJBQXFCLE1BQU07QUFDeEQsZUFBUyxLQUFLLFVBQVUsT0FBTyxjQUFjO0FBQUEsSUFDL0MsQ0FBQztBQUdELGFBQVMsS0FBSyxpQkFBaUIsc0JBQXNCLENBQUMsVUFBaUI7QUFDckUsWUFBTSxZQUFZO0FBQ2xCLFlBQU0sZ0JBQWdCLFVBQVUsUUFBUSxLQUFLLGtCQUFrQixZQUFZO0FBQzNFLFVBQUksZUFBZTtBQUNqQixZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxLQUFLLE1BQU0sYUFBYTtBQUNyQyxjQUFJLEtBQUssY0FBYyxRQUFXO0FBRWhDLG1CQUFPO0FBQUEsY0FDTCxJQUFJLFlBQW1DLGNBQWM7QUFBQSxnQkFDbkQsUUFBUSxFQUFFLE1BQU0sU0FBUyxNQUFNLEtBQUssVUFBVTtBQUFBLGNBQ2hELENBQUM7QUFBQSxZQUNIO0FBQUEsVUFDRjtBQUFBLFFBQ0YsU0FBUyxPQUFPO0FBQ2Qsa0JBQVEsTUFBTSxzQ0FBc0MsS0FBSztBQUFBLFFBQzNEO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUdELGFBQVMsS0FBSyxpQkFBaUIsa0JBQWtCLENBQUMsVUFBaUI7QUFDakUsWUFBTSxZQUFZO0FBQ2xCLFlBQU0sZ0JBQWdCLFVBQVUsUUFBUSxLQUFLLGtCQUFrQixZQUFZO0FBQzNFLFVBQUksZUFBZTtBQUNqQixZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxLQUFLLE1BQU0sYUFBYTtBQUNyQyxjQUFJLEtBQUssZ0JBQWdCLFFBQVc7QUFDbEMsbUJBQU87QUFBQSxjQUNMLElBQUksWUFBbUMsY0FBYztBQUFBLGdCQUNuRCxRQUFRLEVBQUUsTUFBTSxXQUFXLE1BQU0sS0FBSyxZQUFZO0FBQUEsY0FDcEQsQ0FBQztBQUFBLFlBQ0g7QUFBQSxVQUNGO0FBQUEsUUFDRixTQUFTLE9BQU87QUFDZCxrQkFBUSxNQUFNLHNDQUFzQyxLQUFLO0FBQUEsUUFDM0Q7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
