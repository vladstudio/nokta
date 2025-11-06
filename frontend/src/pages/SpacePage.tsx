import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { spaces, chats } from '../services/pocketbase';
import type { Space, Chat } from '../types';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:id');
  const [, setLocation] = useLocation();
  const spaceId = params?.id;

  const [space, setSpace] = useState<Space | null>(null);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!spaceId) return;
    loadData();
  }, [spaceId]);

  const loadData = async () => {
    if (!spaceId) return;

    try {
      const [spaceData, chatsData] = await Promise.all([
        spaces.getOne(spaceId),
        chats.list(spaceId),
      ]);
      setSpace(spaceData);
      setChatList(chatsData);

      // Auto-select first chat if available
      if (chatsData.length > 0 && !selectedChatId) {
        setSelectedChatId(chatsData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load space');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Space not found'}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLocation('/spaces')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat List Sidebar - Hidden on mobile when chat is selected */}
        <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} flex-shrink-0`}>
          <ChatList
            chats={chatList}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
        </div>

        {/* Chat Window - Full width on mobile */}
        <div className="flex-1">
          {selectedChatId ? (
            <div className="h-full flex flex-col">
              {/* Mobile back button */}
              <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to chats
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow chatId={selectedChatId} />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
