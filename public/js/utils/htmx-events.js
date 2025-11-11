'use strict';
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    (document.body.addEventListener('htmx:configRequest', (n) => {
      let o = n,
        e = document.querySelector('meta[name="csrf-token"]'),
        t = document.querySelector('input[name="_csrf"]'),
        s = e?.getAttribute('content') ?? t?.value;
      s !== void 0 && (o.detail.headers['X-CSRF-Token'] = s);
    }),
      document.body.addEventListener('updateTaskCount', (n) => {
        let e = n.detail;
        if (e !== null && typeof e.total == 'number') {
          let t = document.getElementById('task-count');
          t !== null && (t.textContent = `${e.total} t\xE2che(s) au total`);
        }
      }),
      document.body.addEventListener('taskCreated', () => {
        console.info('Task created successfully');
      }),
      document.body.addEventListener('taskUpdated', () => {
        console.info('Task updated successfully');
      }),
      document.body.addEventListener('taskDeleted', () => {
        console.info('Task deleted successfully');
      }));
  });
})();
