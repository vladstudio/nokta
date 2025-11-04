import { Route, Switch } from 'wouter';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SpacesPage from './pages/SpacesPage';
import SpaceFormPage from './pages/SpaceFormPage';
import SpaceMembersPage from './pages/SpaceMembersPage';

function App() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      <Route path="/">
        <ProtectedRoute>
          <SpacesPage />
        </ProtectedRoute>
      </Route>

      <Route path="/spaces/new">
        <ProtectedRoute>
          <SpaceFormPage />
        </ProtectedRoute>
      </Route>

      <Route path="/spaces/:id/edit">
        <ProtectedRoute>
          <SpaceFormPage />
        </ProtectedRoute>
      </Route>

      <Route path="/spaces/:id">
        <ProtectedRoute>
          <SpaceMembersPage />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

export default App;
