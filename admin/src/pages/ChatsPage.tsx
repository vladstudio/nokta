import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { chats as chatsApi, spaces as spacesApi } from '../services/pocketbase';
import type { Chat, Space } from '../types';

export default function ChatsPage() {
  const params = useParams();
  const spaceId = params.id!;

  const [space, setSpace] = useState<Space | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [spaceId]);

  const loadData = async () => {
    try {
      const [spaceData, chatsData] = await Promise.all([
        spacesApi.getOne(spaceId),
        chatsApi.list(spaceId),
      ]);
      setSpace(spaceData);
      setChats(chatsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const publicChats = chats.filter((chat) => chat.type === 'public');
  const privateChats = chats.filter((chat) => chat.type === 'private');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/">
            <button className="text-blue-600 hover:text-blue-700 mb-2">
              ← Back to Spaces
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {space?.name} - Chats
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Public Chats ({publicChats.length})</h2>
          {publicChats.length === 0 ? (
            <p className="text-gray-500">No public chats</p>
          ) : (
            <div className="space-y-3">
              {publicChats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-4 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {chat.name || 'General'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created {chat.created ? new Date(chat.created).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Public
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Direct Messages ({privateChats.length})</h2>
          {privateChats.length === 0 ? (
            <p className="text-gray-500">No DM chats yet. Add members to create DM chats.</p>
          ) : (
            <div className="space-y-3">
              {privateChats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-4 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {chat.expand?.participants?.map((p) => p.email).join(' & ') ||
                          `${chat.participants.length} participants`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created {chat.created ? new Date(chat.created).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      DM
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
