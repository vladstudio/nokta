import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { auth } from '../services/pocketbase';
import { useIsMobile } from '../hooks/useIsMobile';
import { useColorScheme } from '../hooks/useColorScheme';
import { showCallViewAtom } from '../store/callStore';
import { preferences } from '../utils/preferences';
import Sidebar from './Sidebar';
import clsx from 'clsx';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/chat/:chatId?');
  const isMobile = useIsMobile();
  const colorScheme = useColorScheme();
  const showCallView = useAtomValue(showCallViewAtom);
  const [isChecking, setIsChecking] = useState(true);
  const [background, setBackground] = useState(preferences.background);
  const [size, setSize] = useState(preferences.size);

  useEffect(() => {
    if (!auth.isValid) { setLocation('/login'); } else { setIsChecking(false); }
    const unsubscribe = auth.onChange(() => { if (!auth.isValid) setLocation('/login'); });
    return unsubscribe;
  }, [setLocation]);

  useEffect(() => {
    const update = () => { setBackground(preferences.background); setSize(preferences.size); };
    window.addEventListener('preferences-change', update);
    return () => window.removeEventListener('preferences-change', update);
  }, []);

  useEffect(() => {
    const effectiveSize = !localStorage.getItem('pref_size') && window.innerWidth < 640 ? 'medium' : size;
    document.documentElement.style.zoom = { small: '', medium: '1.1', large: '1.2' }[effectiveSize];
  }, [size]);

  const getBgClass = () => background ? `bg-pattern-${background}-${colorScheme}` : '';

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-light">{t('common.loading')}</div>
      </div>
    );
  }

  const showSidebar = !['/admin'].includes(location) && !(isMobile && params?.chatId) && !(isMobile && showCallView) && !(isMobile && location === '/settings') && !(isMobile && location === '/new');

  return (
    <div className={clsx("fixed inset-0 flex overflow-hidden bg-pattern", getBgClass())}>
      {showSidebar && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
