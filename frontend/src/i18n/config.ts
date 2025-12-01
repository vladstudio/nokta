import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

export const defaultLanguage = 'en';
export const supportedLanguages = ['en', 'ru'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

const storedLang = localStorage.getItem('pref_language') as SupportedLanguage | null;

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru } },
  lng: storedLang || defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});

export default i18n;
