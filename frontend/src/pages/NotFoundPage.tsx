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
        <Link href="/my" className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors">
          {t('notFound.goHome', 'Go to My Spaces')}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
