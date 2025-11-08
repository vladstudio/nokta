import { Route, Switch, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { auth, spaces } from './services/pocketbase';
import { requestNotificationPermission, getNotificationPermission } from './utils/notifications';
import { ToastProvider } from './ui';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionBanner from './components/ConnectionBanner';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import SpacePage from './pages/SpacePage';
import MySpacesPage from './pages/MySpacesPage';
import LoadingSpinner from './components/LoadingSpinner';
import { LAST_SPACE_KEY } from './components/Sidebar';

function App() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isValid);

  useEffect(() => {
    const unsubscribe = auth.onChange(() => {
      setIsAuthenticated(auth.isValid);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthenticated && (location === '/' || location === '/spaces')) {
      spaces.list().then(spaceList => {
        if (spaceList.length === 0) {
          setLocation('/my-spaces');
        } else {
          const lastSpaceId = localStorage.getItem(LAST_SPACE_KEY);
          const targetSpace = spaceList.find(s => s.id === lastSpaceId) || spaceList[0];
          setLocation(`/spaces/${targetSpace.id}/chats`);
        }
      }).catch((err) => {
        console.error('Failed to load spaces:', err);
        setLocation('/my-spaces');
      });
    }
  }, [isAuthenticated, location, setLocation]);

  // Request notification permission
  useEffect(() => {
    if (!isAuthenticated) return;

    const requestPermission = async () => {
      const permission = getNotificationPermission();

      if (permission.canRequest) {
        // Small delay to let user see the app first
        await new Promise(resolve => setTimeout(resolve, 2000));

        const granted = await requestNotificationPermission();
        if (granted) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission not granted');
        }
      }
    };

    requestPermission();
  }, [isAuthenticated]);

  return (
    <ToastProvider>
      <ErrorBoundary>
        <ConnectionBanner />
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/my-spaces">
            <ProtectedRoute>
              <MySpacesPage />
            </ProtectedRoute>
          </Route>
          <Route path="/spaces/:spaceId/chats/:chatId?">
            <ProtectedRoute>
              <SpacePage />
            </ProtectedRoute>
          </Route>
          <Route>
            {isAuthenticated ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <LoginPage />
            )}
          </Route>
        </Switch>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
