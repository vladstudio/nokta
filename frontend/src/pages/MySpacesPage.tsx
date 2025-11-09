import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { spaces } from '../services/pocketbase';
import { LAST_SPACE_KEY } from '../components/Sidebar';
import type { Space } from '../types';

export default function MySpacesPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [spaceList, setSpaceList] = useState<Space[]>([]);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  const handleSpaceClick = useCallback((space: Space) => {
    localStorage.setItem(LAST_SPACE_KEY, space.id);
    setLocation(`/spaces/${space.id}/chats`);
  }, [setLocation]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('mySpacesPage.title')}</h1>

        {spaceList.length > 0 ? (
          <div className="space-y-3">
            {spaceList.map((space) => (
              <button
                key={space.id}
                onClick={() => handleSpaceClick(space)}
                className="card w-full p-5 text-left"
              >
                <div className="font-semibold text-gray-900 text-base">{space.name}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state card py-12">
            <p className="text-sm">{t('mySpacesPage.noSpaces')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
