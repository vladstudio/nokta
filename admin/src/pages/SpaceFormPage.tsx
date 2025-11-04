import { useState, useEffect, FormEvent } from 'react';
import { useLocation, useParams } from 'wouter';
import { spaces as spacesApi } from '../services/pocketbase';

export default function SpaceFormPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const spaceId = params.id;
  const isEdit = !!spaceId;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && spaceId) {
      loadSpace(spaceId);
    }
  }, [isEdit, spaceId]);

  const loadSpace = async (id: string) => {
    try {
      const space = await spacesApi.getOne(id);
      setName(space.name);
    } catch (err: any) {
      setError(err.message || 'Failed to load space');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && spaceId) {
        await spacesApi.update(spaceId, name);
      } else {
        await spacesApi.create(name);
      }
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Edit Space' : 'Create New Space'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Space Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="My Space"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Space' : 'Create Space'}
              </button>
              <button
                type="button"
                onClick={() => setLocation('/')}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
