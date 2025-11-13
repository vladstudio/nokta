import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { WarningCircleIcon } from '@phosphor-icons/react';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="center flex-col gap-4 max-w-md">
        <WarningCircleIcon size={64} className="text-(--color-border-default)" />
        <p className="text-lg">
          {t('notFound.message', 'Page not found')}
        </p>
        <Link href="/" className="link">
          {t('notFound.goHome', 'Go Home')}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
