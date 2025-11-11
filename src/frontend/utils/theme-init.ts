/**
 * Theme initialization script
 * Runs before Alpine.js to prevent flash of wrong theme
 * Reads theme from localStorage and applies it immediately
 */

(() => {
  const STORAGE_KEY = 'taskflow-theme';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';

  type Theme = typeof THEME_LIGHT | typeof THEME_DARK;

  /**
   * Get saved theme from localStorage or system preference
   */
  function getSavedTheme(): Theme {
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
    if (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches === true) {
      return THEME_DARK;
    }

    return THEME_LIGHT;
  }

  /**
   * Apply theme to HTML element
   */
  function applyTheme(isDark: boolean): void {
    const theme = isDark ? THEME_DARK : THEME_LIGHT;
    document.documentElement.dataset.theme = theme;
  }

  // Apply theme immediately (before page renders)
  const theme = getSavedTheme();
  applyTheme(theme === THEME_DARK);

  // Make theme utilities available globally for Alpine.js
  globalThis.themeUtils = {
    THEME_LIGHT,
    THEME_DARK,
    STORAGE_KEY,
    applyTheme,
    getSavedTheme,
  };
})();
