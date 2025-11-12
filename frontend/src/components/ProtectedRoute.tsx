import { ReactNode, useEffect, useState, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth } from '../services/pocketbase';
import { useIsMobile } from '../hooks/useIsMobile';
import { useColorScheme } from '../hooks/useColorScheme';
import Sidebar from './Sidebar';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/:chatId?');
  const isMobile = useIsMobile();
  const colorScheme = useColorScheme();
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

  const bgStyle = useMemo(
    () =>
      auth.user?.background
        ? { backgroundImage: `url(/patterns/${auth.user.background}-${colorScheme}.png)`, backgroundSize: '400px 400px', backgroundRepeat: 'repeat' }
        : undefined,
    [auth.user?.background, colorScheme]
  );

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-light">{t('common.loading')}</div>
      </div>
    );
  }

  const showSidebar = location !== '/my' && !(isMobile && params?.chatId);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={bgStyle}>
      {showSidebar && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
