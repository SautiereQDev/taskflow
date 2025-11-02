/**
 * Web Vitals Monitoring
 *
 * Tracks Core Web Vitals metrics client-side:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time To First Byte)
 *
 * Sends metrics to server for aggregation and monitoring
 *
 * @see https://web.dev/vitals/
 */

(function () {
  'use strict';

  // Check if PerformanceObserver is supported
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  const metrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  };

  /**
   * Send metrics to server
   */
  function sendMetrics() {
    const payload = {
      url: window.location.pathname,
      metrics: metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    // Use sendBeacon for reliability (even if page is closing)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics/web-vitals', JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch('/api/metrics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => console.error('Failed to send metrics:', err));
    }
  }

  /**
   * Largest Contentful Paint (LCP)
   * Target: < 2.5s (good), < 4s (needs improvement)
   */
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
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
      entries.forEach((entry) => {
        metrics.fid = Math.round(entry.processingStart - entry.startTime);

        // Log if exceeds budget
        if (metrics.fid > 100) {
          console.warn(`⚠️ FID: ${metrics.fid}ms (target: < 100ms)`);
        }
      });
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
      for (const entry of list.getEntries()) {
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
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = Math.round(entry.startTime);

          // Log if exceeds budget
          if (metrics.fcp > 1800) {
            console.warn(`⚠️ FCP: ${metrics.fcp}ms (target: < 1800ms)`);
          }
        }
      });
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
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      metrics.ttfb = Math.round(navigationEntry.responseStart - navigationEntry.requestStart);

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
  window.addEventListener('beforeunload', sendMetrics);

  /**
   * Also send metrics after 10 seconds (for users who stay on page)
   */
  setTimeout(sendMetrics, 10000);

  /**
   * Log metrics to console (development only)
   */
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
      console.log('📊 Web Vitals:', metrics);
    }, 5000);
  }
})();
