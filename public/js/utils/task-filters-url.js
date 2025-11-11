'use strict';
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    (console.info('[Task Filters] URL update script loaded'),
      document.body.addEventListener('htmx:afterSwap', (r) => {
        let a = r;
        if (
          (console.info('[Task Filters] htmx:afterSwap event', a.detail),
          a.detail.target?.id === 'task-list-container')
        ) {
          console.info('[Task Filters] Updating URL after filter change');
          let o = document.getElementById('filters-form');
          if (o === null) {
            console.warn('[Task Filters] Form not found');
            return;
          }
          let i = new FormData(o),
            t = new URLSearchParams();
          for (let [l, e] of i.entries()) {
            let n = typeof e == 'string' ? e : e.name;
            n !== null && n !== '' && t.append(l, n);
          }
          let s = t.toString() === '' ? '/tasks' : `/tasks?${t.toString()}`;
          (console.info('[Task Filters] New URL:', s), globalThis.history.pushState({}, '', s));
        }
      }));
  });
})();
