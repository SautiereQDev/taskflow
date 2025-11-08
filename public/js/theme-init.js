/**
 * Theme initialization script
 * Runs before Alpine.js to prevent flash of wrong theme
 * Reads theme from localStorage and applies it immediately
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'taskflow-theme';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';

  /**
   * Get saved theme from localStorage or system preference
   */
  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === THEME_LIGHT || saved === THEME_DARK) {
        return saved;
      }
      // Handle legacy theme names (taskflowLight/taskflowDark)
      if (saved === 'taskflowLight') {
        return THEME_LIGHT;
      }
      if (saved === 'taskflowDark') {
        return THEME_DARK;
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }

    return THEME_LIGHT;
  }

  /**
   * Apply theme to HTML element
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Apply theme immediately (before page renders)
  const theme = getSavedTheme();
  applyTheme(theme);

  // Make theme utilities available globally for Alpine.js
  window.themeUtils = {
    THEME_LIGHT,
    THEME_DARK,
    STORAGE_KEY,
    applyTheme,
    getSavedTheme,
  };
})();
