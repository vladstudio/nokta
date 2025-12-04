const KEYS = { language: 'pref_language', theme: 'pref_theme', background: 'pref_background' } as const;

export const preferences = {
  get language(): 'en' | 'ru' { return (localStorage.getItem(KEYS.language) as 'en' | 'ru') || 'en'; },
  set language(v: 'en' | 'ru') { localStorage.setItem(KEYS.language, v); window.dispatchEvent(new Event('preferences-change')); },
  get theme(): 'default' | 'wooden' | 'golden' | 'high-contrast' { return (localStorage.getItem(KEYS.theme) as 'default' | 'wooden' | 'golden' | 'high-contrast' ) || 'default'; },
  set theme(v: 'default' | 'wooden' | 'golden' | 'high-contrast') { localStorage.setItem(KEYS.theme, v); window.dispatchEvent(new Event('preferences-change')); },
  get background(): string { return localStorage.getItem(KEYS.background) || ''; },
  set background(v: string) { localStorage.setItem(KEYS.background, v); window.dispatchEvent(new Event('preferences-change')); },
};
