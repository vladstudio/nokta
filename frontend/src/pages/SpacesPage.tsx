import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { spaces } from '../services/pocketbase';
import type { Space } from '../types';

export default function SpacesPage() {
  const [, setLocation] = useLocation();
  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const records = await spaces.list();
      setSpaceList(records);
    } catch (err: any) {
      setError(err.message || 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading spaces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Spaces</h1>
          <p className="mt-2 text-sm text-gray-600">Select a space to start chatting</p>
        </div>

        {spaceList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No spaces available</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spaceList.map((space) => (
              <button
                key={space.id}
                onClick={() => setLocation(`/spaces/${space.id}`)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-left border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900">{space.name}</h2>
                {space.created && (
                  <p className="mt-2 text-sm text-gray-500">
                    Created {new Date(space.created).toLocaleDateString()}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
