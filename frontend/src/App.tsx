import { Route, Switch, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { auth } from './services/pocketbase';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SpacesPage from './pages/SpacesPage';
import SpacePage from './pages/SpacePage';

function App() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isValid);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = auth.onChange(() => {
      setIsAuthenticated(auth.isValid);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Redirect to spaces if authenticated and on root
    if (isAuthenticated && window.location.pathname === '/') {
      setLocation('/spaces');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/spaces">
        <ProtectedRoute>
          <SpacesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/spaces/:id">
        <ProtectedRoute>
          <SpacePage />
        </ProtectedRoute>
      </Route>
      <Route>
        {isAuthenticated ? <SpacesPage /> : <LoginPage />}
      </Route>
    </Switch>
  );
}

export default App;
