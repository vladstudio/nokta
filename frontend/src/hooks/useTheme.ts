import { useEffect, useState } from 'react';
import { auth } from '../services/pocketbase';

export type Theme = 'default' | 'wooden';

const THEMES: Record<Theme, string> = {
  default: '/src/themes/default.css',
  wooden: '/src/themes/wooden.css',
};

/**
 * Hook to manage theme loading and application
 * Loads theme CSS file based on user preference
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from user settings
  useEffect(() => {
    const loadTheme = () => {
      const userTheme = (auth.user?.theme as Theme) || 'default';
      setTheme(userTheme);
      applyTheme(userTheme);
      setIsLoading(false);
    };

    // Load theme on mount
    loadTheme();

    // Listen for auth changes to update theme
    const unsubscribe = auth.onChange(() => {
      loadTheme();
    });

    return unsubscribe;
  }, []);

  return { theme, isLoading };
}

/**
 * Apply theme by loading the corresponding CSS file
 */
function applyTheme(theme: Theme) {
  // Remove existing theme link if any
  const existingThemeLink = document.getElementById('theme-css');
  if (existingThemeLink) {
    existingThemeLink.remove();
  }

  // Create and append new theme link
  const link = document.createElement('link');
  link.id = 'theme-css';
  link.rel = 'stylesheet';
  link.href = THEMES[theme];
  document.head.appendChild(link);
}
