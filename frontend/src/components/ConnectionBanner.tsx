import { useTranslation } from 'react-i18next';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionBanner() {
  const { t } = useTranslation();
  const { isOnline } = useConnectionStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-(--color-error-500) text-white px-4 py-2 text-center text-sm font-medium z-50">
      {t('connectionBanner.offline')}
    </div>
  );
}
