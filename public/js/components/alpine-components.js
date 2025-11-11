'use strict';
(() => {
  document.addEventListener('alpine:init', () => {
    (window.Alpine.data('themeSwitch', () => ({
      isDark: !1,
      init() {
        let e = localStorage.getItem('theme');
        (e
          ? (this.isDark = e === 'dark')
          : (this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches),
          window.themeUtils.applyTheme(this.isDark),
          window.addEventListener('storage', (i) => {
            i.key === 'theme' &&
              i.newValue &&
              ((this.isDark = i.newValue === 'dark'), window.themeUtils.applyTheme(this.isDark));
          }));
      },
      toggle() {
        ((this.isDark = !this.isDark),
          localStorage.setItem('theme', this.isDark ? 'dark' : 'light'),
          window.themeUtils.applyTheme(this.isDark));
      },
    })),
      window.Alpine.data('modal', () => ({
        open: !1,
        focusTrap: null,
        show() {
          ((this.open = !0),
            (document.body.style.overflow = 'hidden'),
            this.$nextTick(() => {
              let e = this.$el.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              e instanceof HTMLElement && (e.focus(), (this.focusTrap = e));
            }));
        },
        hide() {
          ((this.open = !1), (document.body.style.overflow = ''));
        },
        handleKeydown(e) {
          e.key === 'Escape' && this.hide();
        },
      })),
      window.Alpine.data('dropdown', () => ({
        open: !1,
        toggle() {
          this.open = !this.open;
        },
        close() {
          this.open = !1;
        },
      })),
      window.Alpine.data('formValidation', () => ({
        errors: {},
        touched: {},
        validate(e, i, s) {
          let t = [];
          return (
            s.required === !0 && !i && t.push('Ce champ est requis'),
            s.minLength !== void 0 &&
              i.length < s.minLength &&
              t.push(`Minimum ${s.minLength} caract\xE8res`),
            s.maxLength !== void 0 &&
              i.length > s.maxLength &&
              t.push(`Maximum ${s.maxLength} caract\xE8res`),
            s.email === !0 &&
              i &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i) &&
              t.push('Email invalide'),
            (this.errors[e] = t),
            t.length === 0
          );
        },
        touch(e) {
          this.touched[e] = !0;
        },
        hasError(e) {
          return this.touched[e] === !0 && this.errors[e] !== void 0 && this.errors[e].length > 0;
        },
        getError(e) {
          return this.hasError(e) ? this.errors[e][0] : '';
        },
      })),
      window.Alpine.data('filtersPanel', () => ({
        open: window.Alpine.$persist(!0).as('filtersPanel_open'),
        filters: window.Alpine.$persist({}).as('taskFilters'),
        toggle() {
          this.open = !this.open;
        },
        reset() {
          ((this.filters = {}),
            window.htmx.ajax('GET', '/tasks', {
              target: '#task-list-container',
              swap: 'innerHTML',
            }));
        },
        apply() {
          let e = new URLSearchParams(Object.entries(this.filters).map(([i, s]) => [i, String(s)]));
          window.htmx.ajax('GET', `/tasks?${e.toString()}`, {
            target: '#task-list-container',
            swap: 'innerHTML',
          });
        },
      })),
      window.Alpine.data('toastManager', () => ({
        toasts: [],
        nextId: 1,
        init() {
          (window.addEventListener('show-flash', (e) => {
            this.show(e.detail.text, e.detail.type || 'info');
          }),
            document.body.addEventListener('htmx:afterSwap', (e) => {
              let s = e.detail?.xhr?.getResponseHeader('HX-Trigger');
              if (s)
                try {
                  let t = JSON.parse(s);
                  (t.showSuccess !== void 0 && this.show(t.showSuccess, 'success'),
                    t.showError !== void 0 && this.show(t.showError, 'error'));
                } catch (t) {
                  console.error('Failed to parse HX-Trigger:', t);
                }
            }));
        },
        show(e, i = 'info', s = 4e3) {
          let t = this.nextId++,
            a = { id: t, message: e, type: i, visible: !0 };
          (this.toasts.push(a),
            s > 0 &&
              setTimeout(() => {
                this.dismiss(t);
              }, s));
        },
        dismiss(e) {
          let i = this.toasts.findIndex((s) => s.id === e);
          i !== -1 &&
            ((this.toasts[i].visible = !1),
            setTimeout(() => {
              this.toasts = this.toasts.filter((s) => s.id !== e);
            }, 300));
        },
        getAlertClass(e) {
          return (
            {
              success: 'alert-success',
              error: 'alert-error',
              warning: 'alert-warning',
              info: 'alert-info',
            }[e] || 'alert-info'
          );
        },
        getIcon(e) {
          return (
            { success: '\u2713', error: '\u2715', warning: '\u26A0', info: '\u2139' }[e] || '\u2139'
          );
        },
      })),
      window.Alpine.data('inlineEdit', (e = '', i = '', s = '') => ({
        editing: !1,
        value: e,
        originalValue: e,
        saving: !1,
        error: null,
        startEdit() {
          ((this.editing = !0),
            (this.originalValue = this.value),
            this.$nextTick(() => {
              let t = this.$el.querySelector('input, textarea');
              t instanceof HTMLElement &&
                (t.focus(),
                (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) && t.select());
            }));
        },
        async save() {
          if (this.value === this.originalValue) {
            this.cancel();
            return;
          }
          ((this.saving = !0), (this.error = null));
          try {
            if (
              !(
                await fetch(i, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                  },
                  body: JSON.stringify({ [s]: this.value }),
                })
              ).ok
            )
              throw new Error('Failed to save');
            ((this.editing = !1),
              (this.originalValue = this.value),
              window.dispatchEvent(
                new CustomEvent('show-flash', {
                  detail: { type: 'success', text: 'Modifications enregistr\xE9es' },
                })
              ));
          } catch (t) {
            ((this.error = t instanceof Error ? t.message : 'Unknown error'),
              window.dispatchEvent(
                new CustomEvent('show-flash', {
                  detail: { type: 'error', text: 'Erreur lors de la sauvegarde' },
                })
              ));
          } finally {
            this.saving = !1;
          }
        },
        cancel() {
          ((this.value = this.originalValue), (this.editing = !1), (this.error = null));
        },
        handleKeydown(t) {
          t.key === 'Enter' && !t.shiftKey
            ? (t.preventDefault(), this.save())
            : t.key === 'Escape' && this.cancel();
        },
      })),
      window.Alpine.data('taskSearch', () => ({
        query: '',
        searching: !1,
        debounceTimer: null,
        search() {
          (this.debounceTimer !== null && clearTimeout(this.debounceTimer),
            (this.searching = !0),
            (this.debounceTimer = window.setTimeout(() => {
              (window.htmx.ajax('GET', `/tasks?search=${encodeURIComponent(this.query)}`, {
                target: '#task-list-container',
                swap: 'innerHTML',
              }),
                (this.searching = !1));
            }, 300)));
        },
        clear() {
          ((this.query = ''), this.search());
        },
      })),
      window.Alpine.data('confirmDialog', () => ({
        open: !1,
        title: '',
        message: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        onConfirm: null,
        show(e = {}) {
          ((this.title = e.title ?? 'Confirmation'),
            (this.message = e.message ?? '\xCAtes-vous s\xFBr ?'),
            (this.confirmText = e.confirmText ?? 'Confirmer'),
            (this.cancelText = e.cancelText ?? 'Annuler'),
            (this.onConfirm = e.onConfirm ?? null),
            (this.open = !0));
        },
        confirm() {
          (this.onConfirm !== null && this.onConfirm(), this.close());
        },
        close() {
          ((this.open = !1), (this.onConfirm = null));
        },
      })));
  });
  document.addEventListener('DOMContentLoaded', () => {
    (document.body.addEventListener('htmx:beforeRequest', () => {
      document.body.classList.add('htmx-loading');
    }),
      document.body.addEventListener('htmx:afterRequest', () => {
        document.body.classList.remove('htmx-loading');
      }),
      document.body.addEventListener('htmx:responseError', (e) => {
        let s = e.detail?.xhr?.getResponseHeader('HX-Trigger');
        if (s)
          try {
            let t = JSON.parse(s);
            t.showError !== void 0 &&
              window.dispatchEvent(
                new CustomEvent('show-flash', { detail: { type: 'error', text: t.showError } })
              );
          } catch (t) {
            console.error('Failed to parse HX-Trigger header:', t);
          }
      }),
      document.body.addEventListener('htmx:afterSwap', (e) => {
        let s = e.detail?.xhr?.getResponseHeader('HX-Trigger');
        if (s)
          try {
            let t = JSON.parse(s);
            t.showSuccess !== void 0 &&
              window.dispatchEvent(
                new CustomEvent('show-flash', { detail: { type: 'success', text: t.showSuccess } })
              );
          } catch (t) {
            console.error('Failed to parse HX-Trigger header:', t);
          }
      }));
  });
})();
