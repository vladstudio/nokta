import { useState, useEffect, useCallback } from 'react';
import { useRoute } from 'wouter';
import { spaces, chats } from '../services/pocketbase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../ui';
import type { Space, Chat } from '../types';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:id');
  const spaceId = params?.id;

  const [space, setSpace] = useState<Space | null>(null);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!spaceId) return;

    setLoading(true);
    setError('');

    try {
      const [spaceData, chatsData] = await Promise.all([
        spaces.getOne(spaceId),
        chats.list(spaceId),
      ]);
      setSpace(spaceData);
      setChatList(chatsData);
      setSelectedChatId(chatsData.length > 0 ? chatsData[0].id : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load space';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-600">{error || 'Space not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50">
      {/* Chat List Sidebar - Hidden on mobile when chat is selected */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} shrink-0`}>
        <ChatList
          chats={chatList}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>

      {/* Chat Window - Full width on mobile */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChatId ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden shrink-0 bg-white border-b border-gray-200 px-4 py-3">
              <Button variant="default" onClick={() => setSelectedChatId(null)} className="text-blue-600 hover:text-blue-700 text-sm border-0 px-0">← Back to chats</Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatWindow chatId={selectedChatId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
