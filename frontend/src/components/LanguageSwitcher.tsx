import { useTranslation } from 'react-i18next';
import { preferences } from '../utils/preferences';
import { RadioGroup } from '../ui';

const LANGUAGES = [
  { value: 'en' as const, label: 'English' },
  { value: 'ru' as const, label: 'Русский' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (v: 'en' | 'ru') => {
    preferences.language = v;
    i18n.changeLanguage(v);
  };

  return <RadioGroup value={i18n.language as 'en' | 'ru'} onChange={handleChange} options={LANGUAGES} />;
}
