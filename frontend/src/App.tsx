import { Route, Switch, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { auth, spaces } from './services/pocketbase';
import { requestNotificationPermission, getNotificationPermission } from './utils/notifications';
import { ToastProvider } from './ui';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionBanner from './components/ConnectionBanner';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import SpacePage from './pages/SpacePage';
import MySpacesPage from './pages/MySpacesPage';
import MySettingsPage from './pages/MySettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/LoadingSpinner';
import { LAST_SPACE_KEY } from './components/Sidebar';
import './i18n/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from './hooks/useTheme';

function App() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isValid);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { i18n } = useTranslation();
  useTheme(); // Load and apply user's theme preference

  useEffect(() => {
    const unsubscribe = auth.onChange(() => {
      setIsAuthenticated(auth.isValid);
    });
    return unsubscribe;
  }, []);

  // Sync user language preference with i18n
  useEffect(() => {
    if (auth.user?.language) {
      i18n.changeLanguage(auth.user.language);
    }
  }, [auth.user?.language, i18n]);

  useEffect(() => {
    if (isAuthenticated && (location === '/' || location === '/spaces')) {
      spaces.list().then(spaceList => {
        if (spaceList.length === 0) {
          setLocation('/my');
        } else {
          const lastSpaceId = localStorage.getItem(LAST_SPACE_KEY);
          const targetSpace = spaceList.find(s => s.id === lastSpaceId) || spaceList[0];
          setLocation(`/spaces/${targetSpace.id}/chat`);
        }
      }).catch((err) => {
        console.error('Failed to load spaces:', err);
        setLocation('/my');
      }).finally(() => {
        setIsInitialLoading(false);
      });
    } else {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, location, setLocation]);

  // Request notification permission
  useEffect(() => {
    if (!isAuthenticated) return;

    const requestPermissions = async () => {
      const permission = getNotificationPermission();

      if (permission.canRequest) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const granted = await requestNotificationPermission();
        if (granted) {
          console.log('Notification permission granted');
        }
      }
    };

    requestPermissions();
  }, [isAuthenticated]);

  return (
    <JotaiProvider>
      <ToastProvider>
        <ErrorBoundary>
          <ConnectionBanner />
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/my/settings">
              <ProtectedRoute>
                <MySettingsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/my">
              <ProtectedRoute>
                <MySpacesPage />
              </ProtectedRoute>
            </Route>
            <Route path="/spaces/:spaceId/chat/:chatId?">
              <ProtectedRoute>
                <SpacePage />
              </ProtectedRoute>
            </Route>
            <Route>
              {isInitialLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : isAuthenticated ? (
                <NotFoundPage />
              ) : (
                <LoginPage />
              )}
            </Route>
          </Switch>
        </ErrorBoundary>
      </ToastProvider>
    </JotaiProvider>
  );
}

export default App;
