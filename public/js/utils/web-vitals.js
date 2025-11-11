'use strict';
(() => {
  (() => {
    'use strict';
    if (globalThis.window === void 0) return;
    let e = { lcp: null, fid: null, cls: null, fcp: null, ttfb: null },
      o = !1;
    function a() {
      if (
        o ||
        ((o = !0),
        e.lcp === null && e.fid === null && e.cls === null && e.fcp === null && e.ttfb === null)
      )
        return;
      let t = JSON.stringify({ url: globalThis.location.href, metrics: e, timestamp: Date.now() });
      globalThis.navigator.sendBeacon
        ? globalThis.navigator.sendBeacon('/api/metrics/web-vitals', t)
        : fetch('/api/metrics/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: t,
            keepalive: !0,
          }).catch(() => {});
    }
    try {
      new PerformanceObserver((r) => {
        let n = r.getEntries().at(-1);
        n !== void 0 &&
          ((e.lcp = Math.round(n.startTime)),
          e.lcp > 2500 && console.warn(`\u26A0\uFE0F LCP: ${e.lcp}ms (target: < 2500ms)`));
      }).observe({ type: 'largest-contentful-paint', buffered: !0 });
    } catch (t) {
      console.warn('LCP observation failed:', t);
    }
    try {
      new PerformanceObserver((r) => {
        let s = r.getEntries();
        for (let n of s)
          n.name === 'first-input' &&
            ((e.fid = Math.round(n.processingStart - n.startTime)),
            e.fid > 100 && console.warn(`\u26A0\uFE0F FID: ${e.fid}ms (target: < 100ms)`));
      }).observe({ type: 'first-input', buffered: !0 });
    } catch (t) {
      console.warn('FID observation failed:', t);
    }
    try {
      let t = 0;
      new PerformanceObserver((s) => {
        for (let n of s.getEntries()) {
          let i = n;
          i.hadRecentInput || (t += i.value);
        }
        ((e.cls = Math.round(t * 1e3) / 1e3),
          e.cls > 0.1 && console.warn(`\u26A0\uFE0F CLS: ${e.cls} (target: < 0.1)`));
      }).observe({ type: 'layout-shift', buffered: !0 });
    } catch (t) {
      console.warn('CLS observation failed:', t);
    }
    try {
      new PerformanceObserver((r) => {
        let s = r.getEntries();
        for (let n of s)
          n.name === 'first-contentful-paint' &&
            ((e.fcp = Math.round(n.startTime)),
            e.fcp > 1800 && console.warn(`\u26A0\uFE0F FCP: ${e.fcp}ms (target: < 1800ms)`));
      }).observe({ type: 'paint', buffered: !0 });
    } catch (t) {
      console.warn('FCP observation failed:', t);
    }
    try {
      let t = globalThis.performance.getEntriesByType('navigation');
      if (t.length > 0) {
        let r = t[0];
        ((e.ttfb = Math.round(r.responseStart - r.requestStart)),
          e.ttfb > 600 && console.warn(`\u26A0\uFE0F TTFB: ${e.ttfb}ms (target: < 600ms)`));
      }
    } catch (t) {
      console.warn('TTFB measurement failed:', t);
    }
    (globalThis.addEventListener('beforeunload', a),
      setTimeout(a, 1e4),
      (globalThis.location.hostname === 'localhost' ||
        globalThis.location.hostname === '127.0.0.1') &&
        setTimeout(() => {
          console.info('\u{1F4CA} Web Vitals:', e);
        }, 5e3));
  })();
})();
