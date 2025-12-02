import { Route, Switch, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { auth } from './services/pocketbase';
import { requestNotificationPermission, getNotificationPermission } from './utils/notifications';
import { ToastProvider } from './ui';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ConnectionBanner from './components/ConnectionBanner';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import UserSettingsPage from './pages/UserSettingsPage';
import InvitesPage from './pages/InvitesPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import CreateChatView from './components/CreateChatView';
import LoadingSpinner from './components/LoadingSpinner';
import './i18n/config';
import { useTheme } from './hooks/useTheme';

function App() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isValid);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useTheme();

  useEffect(() => {
    const unsubscribe = auth.onChange(() => {
      setIsAuthenticated(auth.isValid);
    });
    return unsubscribe;
  }, []);


  useEffect(() => {
    if (isAuthenticated && location === '/') {
      setLocation('/chat');
      setIsInitialLoading(false);
    } else {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, location, setLocation]);

  // Request notification permission
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const perm = await getNotificationPermission();
      if (perm.canRequest) {
        await new Promise(r => setTimeout(r, 2000));
        await requestNotificationPermission();
      }
    })();
  }, [isAuthenticated]);

  return (
    <JotaiProvider>
      <ToastProvider>
        <ErrorBoundary>
          <ConnectionBanner />
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/signup/:code" component={SignupPage} />
            <Route path="/admin">
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </ProtectedRoute>
            </Route>
            <Route path="/settings">
              <ProtectedRoute>
                <UserSettingsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/invites">
              <ProtectedRoute>
                <InvitesPage />
              </ProtectedRoute>
            </Route>
            <Route path="/new">
              <ProtectedRoute>
                <CreateChatView />
              </ProtectedRoute>
            </Route>
            <Route path="/chat/:chatId?">
              <ProtectedRoute>
                <ChatPage />
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
