import { useEffect, useState } from 'react';
import { preferences } from '../utils/preferences';

export type Theme = 'default' | 'wooden' | 'golden' | 'high-contrast';

const THEMES: Record<Theme, string> = {
  default: '/themes/default.css',
  wooden: '/themes/wooden.css',
  golden: '/themes/golden.css',
  'high-contrast': '/themes/high-contrast.css',
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(preferences.theme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = () => { setTheme(preferences.theme); applyTheme(preferences.theme); setIsLoading(false); };
    load();
    window.addEventListener('preferences-change', load);
    return () => window.removeEventListener('preferences-change', load);
  }, []);

  return { theme, isLoading };
}

/**
 * Apply theme by loading the corresponding CSS file
 */
function applyTheme(theme: Theme) {
  const existingThemeLink = document.getElementById('theme-css') as HTMLLinkElement | null;
  const newThemeHref = THEMES[theme];

  // If theme link already exists with the correct href, no need to reload
  if (existingThemeLink && existingThemeLink.href.endsWith(newThemeHref)) {
    return;
  }

  // Remove existing theme link if any
  if (existingThemeLink) {
    existingThemeLink.remove();
  }

  // Create and append new theme link
  const link = document.createElement('link');
  link.id = 'theme-css';
  link.rel = 'stylesheet';
  link.href = newThemeHref;
  document.head.appendChild(link);
}
