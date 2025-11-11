'use strict';
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (s) => {
      let t = s.target,
        e = t.closest('.task-card');
      if (
        e === null ||
        t.closest('.task-card-action') !== null ||
        t.closest('.dropdown-content') !== null ||
        t.closest('button[hx-post]') !== null ||
        t.closest('button[hx-delete]') !== null
      )
        return;
      let n = e.dataset.taskUrl;
      n !== void 0 && (globalThis.location.href = n);
    });
  });
})();
