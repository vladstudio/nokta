import { useLocation, useRoute } from 'wouter';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { auth, spaces } from '../services/pocketbase';
import { Button, Select } from '../ui';
import type { Space } from '../types';

const LAST_SPACE_KEY = 'talk:lastSpaceId';

export default function Header() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/:chatId?');
  const user = auth.user;
  const currentSpaceId = params?.spaceId;

  const [spaceList, setSpaceList] = useState<Space[]>([]);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(err => {
      console.error('Failed to load spaces:', err);
      setSpaceList([]);
    });
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  useEffect(() => {
    if (currentSpaceId) {
      loadSpaces();
    }
  }, [currentSpaceId, loadSpaces]);

  const options = useMemo(() =>
    spaceList.map(s => ({ value: s.id, label: s.name })),
    [spaceList]
  );

  const handleSpaceChange = (spaceId: string | null) => {
    if (spaceId) {
      localStorage.setItem(LAST_SPACE_KEY, spaceId);
      setLocation(`/spaces/${spaceId}`);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setLocation('/login');
  };

  return (
    <header className="shrink-0 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center h-16 px-8">
        {spaceList.length > 0 ? (
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Talk" className="w-6 h-6" />
            <div className="w-64">
              <Select
                value={currentSpaceId}
                onChange={handleSpaceChange}
                options={options}
                placeholder="Select space..."
              />
            </div>
          </div>
        ) : (
          <div className="text-lg font-semibold text-gray-900">Talk</div>
        )}

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
          <Button variant="default" onClick={handleLogout} className="text-sm">Logout</Button>
        </div>
      </div>
    </header>
  );
}

export { LAST_SPACE_KEY };
