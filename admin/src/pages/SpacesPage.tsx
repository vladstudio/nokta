import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { spaces as spacesApi, auth } from '../services/pocketbase';
import type { Space } from '../types';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const data = await spacesApi.list();
      setSpaces(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Spaces</h1>
            <p className="text-gray-600 mt-1">
              Logged in as {auth.user?.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/spaces/new">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create Space
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {spaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No spaces yet</p>
            <Link href="/spaces/new">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create your first space
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <div key={space.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {space.name}
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Created {space.created ? new Date(space.created).toLocaleDateString() : 'Unknown'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/spaces/${space.id}`}>
                    <button className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Members
                    </button>
                  </Link>
                  <Link href={`/spaces/${space.id}/chats`}>
                    <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Chats
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
