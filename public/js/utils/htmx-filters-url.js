'use strict';
(() => {
  function l(t) {
    if (t instanceof FormData) {
      let n = {},
        r = new Set();
      for (let i of t.keys()) r.add(i);
      for (let i of r) {
        let o = t.getAll(i).map((e) => (typeof e == 'string' ? e : e.name));
        n[i] = o.length > 1 ? o : o[0];
      }
      return n;
    }
    return { ...t };
  }
  function c(t) {
    let n = {};
    for (let r in t) {
      let i = t[r];
      if (Array.isArray(i)) {
        let o = i.filter((e) => e !== null && e.trim() !== '');
        o.length > 0 && (n[r] = o);
      } else typeof i == 'string' && i.trim() !== '' && (n[r] = i);
    }
    return n;
  }
  function a(t) {
    let n = l(t);
    return (console.info('[Filter] Original parameters:', n), c(n));
  }
  document.addEventListener('DOMContentLoaded', () => {
    let t = document.getElementById('filters-form');
    if (t === null) return;
    let n = null,
      r = () => {
        (n !== null && clearTimeout(n),
          (n = globalThis.setTimeout(() => {
            console.info('[Filter] Triggering HTMX request');
            let e = globalThis.htmx;
            e?.trigger && e.trigger(t, 'submit');
          }, 300)));
      },
      i = t.querySelectorAll(
        'input[type="checkbox"], input[type="radio"], input[type="text"], input[type="search"], select'
      );
    console.info(`[Filter] Found ${i.length} filter inputs`);
    for (let e of i)
      (e instanceof HTMLInputElement &&
        (e.type === 'checkbox' || e.type === 'radio') &&
        e.addEventListener('change', () => {
          (console.info(`[Filter] ${e.type} changed:`, e.name, e.value, e.checked), r());
        }),
        e instanceof HTMLInputElement &&
          (e.type === 'text' || e.type === 'search') &&
          e.addEventListener('input', () => {
            (console.info('[Filter] Text input changed:', e.name, e.value), r());
          }),
        e instanceof HTMLSelectElement &&
          e.addEventListener('change', () => {
            (console.info('[Filter] Select changed:', e.name, e.value), r());
          }));
    (document.body.addEventListener('htmx:configRequest', (e) => {
      let s = e;
      (s.detail.elt !== t && !t.contains(s.detail.elt)) ||
        (console.info('[Filter] Intercepting HTMX configRequest'),
        (s.detail.parameters = a(s.detail.parameters)),
        console.info('[Filter] Filtered parameters:', s.detail.parameters));
    }),
      t.addEventListener('submit', () => {
        (console.info('[Filter] Form submitted'), n !== null && (clearTimeout(n), (n = null)));
      }));
    let o = document.getElementById('reset-filters-btn');
    (o !== null &&
      o.addEventListener('click', (e) => {
        (e.preventDefault(), console.info('[Filter] Reset button clicked'), t.reset());
        let s = globalThis.htmx;
        s?.trigger && s.trigger(t, 'submit');
      }),
      console.info('[Filter] Initialization complete'));
  });
})();
