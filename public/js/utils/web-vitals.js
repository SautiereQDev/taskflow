'use strict';
(() => {
  // src/frontend/utils/web-vitals.ts
  (() => {
    'use strict';
    if (globalThis.window === void 0) return;
    const metrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
    };
    let metricsSent = false;
    function sendMetrics() {
      if (metricsSent) return;
      metricsSent = true;
      if (
        metrics.lcp === null &&
        metrics.fid === null &&
        metrics.cls === null &&
        metrics.fcp === null &&
        metrics.ttfb === null
      ) {
        return;
      }
      const payload = JSON.stringify({
        url: globalThis.location.href,
        metrics,
        timestamp: Date.now(),
      });
      if (globalThis.navigator.sendBeacon) {
        globalThis.navigator.sendBeacon('/api/metrics/web-vitals', payload);
      } else {
        fetch('/api/metrics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries.at(-1);
        if (lastEntry === void 0) return;
        metrics.lcp = Math.round(lastEntry.startTime);
        if (metrics.lcp > 2500) {
          console.warn(`\u26A0\uFE0F LCP: ${metrics.lcp}ms (target: < 2500ms)`);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP observation failed:', e);
    }
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-input') {
            metrics.fid = Math.round(entry.processingStart - entry.startTime);
            if (metrics.fid > 100) {
              console.warn(`\u26A0\uFE0F FID: ${metrics.fid}ms (target: < 100ms)`);
            }
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID observation failed:', e);
    }
    try {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const perfEntry of list.getEntries()) {
          const entry = perfEntry;
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        metrics.cls = Math.round(clsScore * 1e3) / 1e3;
        if (metrics.cls > 0.1) {
          console.warn(`\u26A0\uFE0F CLS: ${metrics.cls} (target: < 0.1)`);
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS observation failed:', e);
    }
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = Math.round(entry.startTime);
            if (metrics.fcp > 1800) {
              console.warn(`\u26A0\uFE0F FCP: ${metrics.fcp}ms (target: < 1800ms)`);
            }
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('FCP observation failed:', e);
    }
    try {
      const navigationEntries = globalThis.performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0];
        metrics.ttfb = Math.round(navEntry.responseStart - navEntry.requestStart);
        if (metrics.ttfb > 600) {
          console.warn(`\u26A0\uFE0F TTFB: ${metrics.ttfb}ms (target: < 600ms)`);
        }
      }
    } catch (e) {
      console.warn('TTFB measurement failed:', e);
    }
    globalThis.addEventListener('beforeunload', sendMetrics);
    setTimeout(sendMetrics, 1e4);
    if (
      globalThis.location.hostname === 'localhost' ||
      globalThis.location.hostname === '127.0.0.1'
    ) {
      setTimeout(() => {
        console.info('\u{1F4CA} Web Vitals:', metrics);
      }, 5e3);
    }
  })();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2Zyb250ZW5kL3V0aWxzL3dlYi12aXRhbHMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQ29yZSBXZWIgVml0YWxzIE1vbml0b3JpbmdcbiAqXG4gKiBUcmFja3MgYW5kIHJlcG9ydHMga2V5IHBlcmZvcm1hbmNlIG1ldHJpY3M6XG4gKiAtIExDUCAoTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50KVxuICogLSBGSUQgKEZpcnN0IElucHV0IERlbGF5KVxuICogLSBDTFMgKEN1bXVsYXRpdmUgTGF5b3V0IFNoaWZ0KVxuICogLSBGQ1AgKEZpcnN0IENvbnRlbnRmdWwgUGFpbnQpXG4gKiAtIFRURkIgKFRpbWUgVG8gRmlyc3QgQnl0ZSlcbiAqL1xuXG5pbnRlcmZhY2UgSVdlYlZpdGFsc01ldHJpY3Mge1xuICBsY3A6IG51bWJlciB8IG51bGw7XG4gIGZpZDogbnVtYmVyIHwgbnVsbDtcbiAgY2xzOiBudW1iZXIgfCBudWxsO1xuICBmY3A6IG51bWJlciB8IG51bGw7XG4gIHR0ZmI6IG51bWJlciB8IG51bGw7XG59XG5cbmludGVyZmFjZSBJTGF5b3V0U2hpZnRFbnRyeSBleHRlbmRzIFBlcmZvcm1hbmNlRW50cnkge1xuICBoYWRSZWNlbnRJbnB1dDogYm9vbGVhbjtcbiAgdmFsdWU6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIElOYXZpZ2F0aW9uRW50cnkgZXh0ZW5kcyBQZXJmb3JtYW5jZUVudHJ5IHtcbiAgcmVzcG9uc2VTdGFydDogbnVtYmVyO1xuICByZXF1ZXN0U3RhcnQ6IG51bWJlcjtcbn1cblxuKCgpID0+IHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFNraXAgaWYgbm90IGluIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAgaWYgKGdsb2JhbFRoaXMud2luZG93ID09PSB1bmRlZmluZWQpIHJldHVybjtcblxuICBjb25zdCBtZXRyaWNzOiBJV2ViVml0YWxzTWV0cmljcyA9IHtcbiAgICBsY3A6IG51bGwsXG4gICAgZmlkOiBudWxsLFxuICAgIGNsczogbnVsbCxcbiAgICBmY3A6IG51bGwsXG4gICAgdHRmYjogbnVsbCxcbiAgfTtcblxuICBsZXQgbWV0cmljc1NlbnQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2VuZCBtZXRyaWNzIHRvIHNlcnZlclxuICAgKi9cbiAgZnVuY3Rpb24gc2VuZE1ldHJpY3MoKTogdm9pZCB7XG4gICAgLy8gT25seSBzZW5kIG9uY2VcbiAgICBpZiAobWV0cmljc1NlbnQpIHJldHVybjtcbiAgICBtZXRyaWNzU2VudCA9IHRydWU7XG5cbiAgICAvLyBPbmx5IHNlbmQgaWYgd2UgaGF2ZSBhdCBsZWFzdCBvbmUgbWV0cmljXG4gICAgaWYgKFxuICAgICAgbWV0cmljcy5sY3AgPT09IG51bGwgJiZcbiAgICAgIG1ldHJpY3MuZmlkID09PSBudWxsICYmXG4gICAgICBtZXRyaWNzLmNscyA9PT0gbnVsbCAmJlxuICAgICAgbWV0cmljcy5mY3AgPT09IG51bGwgJiZcbiAgICAgIG1ldHJpY3MudHRmYiA9PT0gbnVsbFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICB1cmw6IGdsb2JhbFRoaXMubG9jYXRpb24uaHJlZixcbiAgICAgIG1ldHJpY3MsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgfSk7XG5cbiAgICAvLyBUcnkgdG8gdXNlIHNlbmRCZWFjb24gKGd1YXJhbnRlZWQgdG8gc2VuZCBldmVuIGlmIHBhZ2UgaXMgY2xvc2luZylcbiAgICBpZiAoZ2xvYmFsVGhpcy5uYXZpZ2F0b3Iuc2VuZEJlYWNvbikge1xuICAgICAgZ2xvYmFsVGhpcy5uYXZpZ2F0b3Iuc2VuZEJlYWNvbignL2FwaS9tZXRyaWNzL3dlYi12aXRhbHMnLCBwYXlsb2FkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmFsbGJhY2sgdG8gZmV0Y2ggd2l0aCBrZWVwYWxpdmVcbiAgICAgIGZldGNoKCcvYXBpL21ldHJpY3Mvd2ViLXZpdGFscycsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICBib2R5OiBwYXlsb2FkLFxuICAgICAgICBrZWVwYWxpdmU6IHRydWUsXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8vIFNpbGVudCBmYWlsIC0gbWV0cmljcyBhcmUgbm90IGNyaXRpY2FsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApXG4gICAqIFRhcmdldDogPCAyLjVzIChnb29kKSwgPCA0cyAobmVlZHMgaW1wcm92ZW1lbnQpXG4gICAqL1xuICB0cnkge1xuICAgIGNvbnN0IGxjcE9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoKGxpc3QpID0+IHtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBsaXN0LmdldEVudHJpZXMoKTtcbiAgICAgIGNvbnN0IGxhc3RFbnRyeSA9IGVudHJpZXMuYXQoLTEpO1xuICAgICAgaWYgKGxhc3RFbnRyeSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICBtZXRyaWNzLmxjcCA9IE1hdGgucm91bmQobGFzdEVudHJ5LnN0YXJ0VGltZSk7XG5cbiAgICAgIC8vIExvZyBpZiBleGNlZWRzIGJ1ZGdldFxuICAgICAgaWYgKG1ldHJpY3MubGNwID4gMjUwMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFx1MjZBMFx1RkUwRiBMQ1A6ICR7bWV0cmljcy5sY3B9bXMgKHRhcmdldDogPCAyNTAwbXMpYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsY3BPYnNlcnZlci5vYnNlcnZlKHsgdHlwZTogJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcsIGJ1ZmZlcmVkOiB0cnVlIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS53YXJuKCdMQ1Agb2JzZXJ2YXRpb24gZmFpbGVkOicsIGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpcnN0IElucHV0IERlbGF5IChGSUQpXG4gICAqIFRhcmdldDogPCAxMDBtcyAoZ29vZCksIDwgMzAwbXMgKG5lZWRzIGltcHJvdmVtZW50KVxuICAgKi9cbiAgdHJ5IHtcbiAgICBjb25zdCBmaWRPYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChsaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gbGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5Lm5hbWUgPT09ICdmaXJzdC1pbnB1dCcpIHtcbiAgICAgICAgICBtZXRyaWNzLmZpZCA9IE1hdGgucm91bmQoZW50cnkucHJvY2Vzc2luZ1N0YXJ0IC0gZW50cnkuc3RhcnRUaW1lKTtcblxuICAgICAgICAgIC8vIExvZyBpZiBleGNlZWRzIGJ1ZGdldFxuICAgICAgICAgIGlmIChtZXRyaWNzLmZpZCA+IDEwMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBcdTI2QTBcdUZFMEYgRklEOiAke21ldHJpY3MuZmlkfW1zICh0YXJnZXQ6IDwgMTAwbXMpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBmaWRPYnNlcnZlci5vYnNlcnZlKHsgdHlwZTogJ2ZpcnN0LWlucHV0JywgYnVmZmVyZWQ6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oJ0ZJRCBvYnNlcnZhdGlvbiBmYWlsZWQ6JywgZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3VtdWxhdGl2ZSBMYXlvdXQgU2hpZnQgKENMUylcbiAgICogVGFyZ2V0OiA8IDAuMSAoZ29vZCksIDwgMC4yNSAobmVlZHMgaW1wcm92ZW1lbnQpXG4gICAqL1xuICB0cnkge1xuICAgIGxldCBjbHNTY29yZSA9IDA7XG5cbiAgICBjb25zdCBjbHNPYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChsaXN0KSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHBlcmZFbnRyeSBvZiBsaXN0LmdldEVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBlbnRyeSA9IHBlcmZFbnRyeSBhcyBJTGF5b3V0U2hpZnRFbnRyeTtcbiAgICAgICAgLy8gT25seSBjb3VudCBsYXlvdXQgc2hpZnRzIHdpdGhvdXQgcmVjZW50IHVzZXIgaW5wdXRcbiAgICAgICAgaWYgKCFlbnRyeS5oYWRSZWNlbnRJbnB1dCkge1xuICAgICAgICAgIGNsc1Njb3JlICs9IGVudHJ5LnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtZXRyaWNzLmNscyA9IE1hdGgucm91bmQoY2xzU2NvcmUgKiAxMDAwKSAvIDEwMDA7IC8vIFJvdW5kIHRvIDMgZGVjaW1hbHNcblxuICAgICAgLy8gTG9nIGlmIGV4Y2VlZHMgYnVkZ2V0XG4gICAgICBpZiAobWV0cmljcy5jbHMgPiAwLjEpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBcdTI2QTBcdUZFMEYgQ0xTOiAke21ldHJpY3MuY2xzfSAodGFyZ2V0OiA8IDAuMSlgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNsc09ic2VydmVyLm9ic2VydmUoeyB0eXBlOiAnbGF5b3V0LXNoaWZ0JywgYnVmZmVyZWQ6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oJ0NMUyBvYnNlcnZhdGlvbiBmYWlsZWQ6JywgZSk7XG4gIH1cblxuICAvKipcbiAgICogRmlyc3QgQ29udGVudGZ1bCBQYWludCAoRkNQKVxuICAgKiBUYXJnZXQ6IDwgMS44cyAoZ29vZCksIDwgM3MgKG5lZWRzIGltcHJvdmVtZW50KVxuICAgKi9cbiAgdHJ5IHtcbiAgICBjb25zdCBmY3BPYnNlcnZlciA9IG5ldyBQZXJmb3JtYW5jZU9ic2VydmVyKChsaXN0KSA9PiB7XG4gICAgICBjb25zdCBlbnRyaWVzID0gbGlzdC5nZXRFbnRyaWVzKCk7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKGVudHJ5Lm5hbWUgPT09ICdmaXJzdC1jb250ZW50ZnVsLXBhaW50Jykge1xuICAgICAgICAgIG1ldHJpY3MuZmNwID0gTWF0aC5yb3VuZChlbnRyeS5zdGFydFRpbWUpO1xuXG4gICAgICAgICAgLy8gTG9nIGlmIGV4Y2VlZHMgYnVkZ2V0XG4gICAgICAgICAgaWYgKG1ldHJpY3MuZmNwID4gMTgwMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBcdTI2QTBcdUZFMEYgRkNQOiAke21ldHJpY3MuZmNwfW1zICh0YXJnZXQ6IDwgMTgwMG1zKWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZmNwT2JzZXJ2ZXIub2JzZXJ2ZSh7IHR5cGU6ICdwYWludCcsIGJ1ZmZlcmVkOiB0cnVlIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS53YXJuKCdGQ1Agb2JzZXJ2YXRpb24gZmFpbGVkOicsIGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRpbWUgVG8gRmlyc3QgQnl0ZSAoVFRGQilcbiAgICogVGFyZ2V0OiA8IDYwMG1zIChnb29kKSwgPCA4MDBtcyAobmVlZHMgaW1wcm92ZW1lbnQpXG4gICAqL1xuICB0cnkge1xuICAgIGNvbnN0IG5hdmlnYXRpb25FbnRyaWVzID0gZ2xvYmFsVGhpcy5wZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlUeXBlKCduYXZpZ2F0aW9uJyk7XG4gICAgaWYgKG5hdmlnYXRpb25FbnRyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5hdkVudHJ5ID0gbmF2aWdhdGlvbkVudHJpZXNbMF0gYXMgSU5hdmlnYXRpb25FbnRyeTtcbiAgICAgIG1ldHJpY3MudHRmYiA9IE1hdGgucm91bmQobmF2RW50cnkucmVzcG9uc2VTdGFydCAtIG5hdkVudHJ5LnJlcXVlc3RTdGFydCk7XG5cbiAgICAgIC8vIExvZyBpZiBleGNlZWRzIGJ1ZGdldFxuICAgICAgaWYgKG1ldHJpY3MudHRmYiA+IDYwMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFx1MjZBMFx1RkUwRiBUVEZCOiAke21ldHJpY3MudHRmYn1tcyAodGFyZ2V0OiA8IDYwMG1zKWApO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUud2FybignVFRGQiBtZWFzdXJlbWVudCBmYWlsZWQ6JywgZSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBtZXRyaWNzIHdoZW4gcGFnZSBpcyBhYm91dCB0byB1bmxvYWRcbiAgICovXG4gIGdsb2JhbFRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgc2VuZE1ldHJpY3MpO1xuXG4gIC8qKlxuICAgKiBBbHNvIHNlbmQgbWV0cmljcyBhZnRlciAxMCBzZWNvbmRzIChmb3IgdXNlcnMgd2hvIHN0YXkgb24gcGFnZSlcbiAgICovXG4gIHNldFRpbWVvdXQoc2VuZE1ldHJpY3MsIDEwMDAwKTtcblxuICAvKipcbiAgICogTG9nIG1ldHJpY3MgdG8gY29uc29sZSAoZGV2ZWxvcG1lbnQgb25seSlcbiAgICovXG4gIGlmIChcbiAgICBnbG9iYWxUaGlzLmxvY2F0aW9uLmhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fFxuICAgIGdsb2JhbFRoaXMubG9jYXRpb24uaG9zdG5hbWUgPT09ICcxMjcuMC4wLjEnXG4gICkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS5pbmZvKCdcdUQ4M0RcdURDQ0EgV2ViIFZpdGFsczonLCBtZXRyaWNzKTtcbiAgICB9LCA1MDAwKTtcbiAgfVxufSkoKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQTZCQSxHQUFDLE1BQU07QUFDTDtBQUdBLFFBQUksV0FBVyxXQUFXLE9BQVc7QUFFckMsVUFBTSxVQUE2QjtBQUFBLE1BQ2pDLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNM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
