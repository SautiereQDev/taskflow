'use strict';
(() => {
  (() => {
    let r = 'taskflow-theme',
      o = 'light',
      t = 'dark';
    function a() {
      try {
        let e = localStorage.getItem(r);
        if (e === o || e === t) return e;
        if (e === 'taskflowLight') return o;
        if (e === 'taskflowDark') return t;
      } catch (e) {
        console.warn('Failed to read theme from localStorage:', e);
      }
      return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches === !0 ? t : o;
    }
    function n(e) {
      let l = e ? t : o;
      document.documentElement.dataset.theme = l;
    }
    let c = a();
    (n(c === t),
      (globalThis.themeUtils = {
        THEME_LIGHT: o,
        THEME_DARK: t,
        STORAGE_KEY: r,
        applyTheme: n,
        getSavedTheme: a,
      }));
  })();
})();
