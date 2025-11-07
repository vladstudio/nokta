import { Route, Switch, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { auth, spaces } from './services/pocketbase';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionBanner from './components/ConnectionBanner';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import SpacePage from './pages/SpacePage';
import NoSpacesPage from './pages/NoSpacesPage';
import LoadingSpinner from './components/LoadingSpinner';
import { LAST_SPACE_KEY } from './components/Header';

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
          setLocation('/no-spaces');
        } else {
          const lastSpaceId = localStorage.getItem(LAST_SPACE_KEY);
          const targetSpace = spaceList.find(s => s.id === lastSpaceId) || spaceList[0];
          setLocation(`/spaces/${targetSpace.id}`);
        }
      }).catch((err) => {
        console.error('Failed to load spaces:', err);
        setLocation('/no-spaces');
      });
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <ErrorBoundary>
      <ConnectionBanner />
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/no-spaces">
          <ProtectedRoute>
            <NoSpacesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/spaces/:spaceId/:chatId?">
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
  );
}

export default App;
