import { useTranslation } from 'react-i18next';

export default function Info() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center text-sm text-light">
        {t('common.comingSoon')}
      </div>
    </div>
  );
}
