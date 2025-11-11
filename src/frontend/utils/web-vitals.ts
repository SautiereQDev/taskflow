/**
 * Core Web Vitals Monitoring
 *
 * Tracks and reports key performance metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time To First Byte)
 */

interface IWebVitalsMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

interface ILayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface INavigationEntry extends PerformanceEntry {
  responseStart: number;
  requestStart: number;
}

(() => {
  'use strict';

  // Skip if not in browser environment
  if (globalThis.window === undefined) return;

  const metrics: IWebVitalsMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  };

  let metricsSent = false;

  /**
   * Send metrics to server
   */
  function sendMetrics(): void {
    // Only send once
    if (metricsSent) return;
    metricsSent = true;

    // Only send if we have at least one metric
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

    // Try to use sendBeacon (guaranteed to send even if page is closing)
    if (globalThis.navigator.sendBeacon) {
      globalThis.navigator.sendBeacon('/api/metrics/web-vitals', payload);
    } else {
      // Fallback to fetch with keepalive
      fetch('/api/metrics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silent fail - metrics are not critical
      });
    }
  }

  /**
   * Largest Contentful Paint (LCP)
   * Target: < 2.5s (good), < 4s (needs improvement)
   */
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries.at(-1);
      if (lastEntry === undefined) return;
      metrics.lcp = Math.round(lastEntry.startTime);

      // Log if exceeds budget
      if (metrics.lcp > 2500) {
        console.warn(`⚠️ LCP: ${metrics.lcp}ms (target: < 2500ms)`);
      }
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observation failed:', e);
  }

  /**
   * First Input Delay (FID)
   * Target: < 100ms (good), < 300ms (needs improvement)
   */
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.name === 'first-input') {
          metrics.fid = Math.round(entry.processingStart - entry.startTime);

          // Log if exceeds budget
          if (metrics.fid > 100) {
            console.warn(`⚠️ FID: ${metrics.fid}ms (target: < 100ms)`);
          }
        }
      }
    });

    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID observation failed:', e);
  }

  /**
   * Cumulative Layout Shift (CLS)
   * Target: < 0.1 (good), < 0.25 (needs improvement)
   */
  try {
    let clsScore = 0;

    const clsObserver = new PerformanceObserver((list) => {
      for (const perfEntry of list.getEntries()) {
        const entry = perfEntry as ILayoutShiftEntry;
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
      metrics.cls = Math.round(clsScore * 1000) / 1000; // Round to 3 decimals

      // Log if exceeds budget
      if (metrics.cls > 0.1) {
        console.warn(`⚠️ CLS: ${metrics.cls} (target: < 0.1)`);
      }
    });

    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS observation failed:', e);
  }

  /**
   * First Contentful Paint (FCP)
   * Target: < 1.8s (good), < 3s (needs improvement)
   */
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = Math.round(entry.startTime);

          // Log if exceeds budget
          if (metrics.fcp > 1800) {
            console.warn(`⚠️ FCP: ${metrics.fcp}ms (target: < 1800ms)`);
          }
        }
      }
    });

    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('FCP observation failed:', e);
  }

  /**
   * Time To First Byte (TTFB)
   * Target: < 600ms (good), < 800ms (needs improvement)
   */
  try {
    const navigationEntries = globalThis.performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as INavigationEntry;
      metrics.ttfb = Math.round(navEntry.responseStart - navEntry.requestStart);

      // Log if exceeds budget
      if (metrics.ttfb > 600) {
        console.warn(`⚠️ TTFB: ${metrics.ttfb}ms (target: < 600ms)`);
      }
    }
  } catch (e) {
    console.warn('TTFB measurement failed:', e);
  }

  /**
   * Send metrics when page is about to unload
   */
  globalThis.addEventListener('beforeunload', sendMetrics);

  /**
   * Also send metrics after 10 seconds (for users who stay on page)
   */
  setTimeout(sendMetrics, 10000);

  /**
   * Log metrics to console (development only)
   */
  if (
    globalThis.location.hostname === 'localhost' ||
    globalThis.location.hostname === '127.0.0.1'
  ) {
    setTimeout(() => {
      console.info('📊 Web Vitals:', metrics);
    }, 5000);
  }
})();
