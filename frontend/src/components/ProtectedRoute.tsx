import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth } from '../services/pocketbase';
import { useIsMobile } from '../hooks/useIsMobile';
import Sidebar from './Sidebar';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/chats/:chatId?');
  const isMobile = useIsMobile();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!auth.isValid) {
      setLocation('/login');
    } else {
      setIsChecking(false);
    }

    const unsubscribe = auth.onChange(() => {
      if (!auth.isValid) {
        setLocation('/login');
      }
    });

    return unsubscribe;
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-light">{t('common.loading')}</div>
      </div>
    );
  }

  const showSidebar = location !== '/my' && !(isMobile && params?.chatId);

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {showSidebar && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
