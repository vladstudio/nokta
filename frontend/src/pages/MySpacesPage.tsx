import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { spaces } from '../services/pocketbase';
import { LAST_SPACE_KEY } from '../components/Sidebar';
import type { Space } from '../types';

export default function MySpacesPage() {
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
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Spaces</h1>

        {spaceList.length > 0 ? (
          <div className="space-y-2">
            {spaceList.map((space) => (
              <button
                key={space.id}
                onClick={() => handleSpaceClick(space)}
                className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="font-medium text-gray-900">{space.name}</div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No spaces available</p>
        )}
      </div>
    </div>
  );
}
