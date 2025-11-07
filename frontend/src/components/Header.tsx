import { useLocation } from 'wouter';
import { auth } from '../services/pocketbase';
import { useLayout } from '../contexts/LayoutContext';

export default function Header() {
  const [, setLocation] = useLocation();
  const user = auth.user;
  const { spaceName } = useLayout();

  const handleLogout = () => {
    auth.logout();
    setLocation('/login');
  };

  return (
    <header className="shrink-0 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/spaces')}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Talk
          </button>
          {spaceName && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-lg text-gray-700">{spaceName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {user?.name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
