import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { spaces, chats } from '../services/pocketbase';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Space, Chat } from '../types';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:spaceId/:chatId?');
  const [, setLocation] = useLocation();
  const spaceId = params?.spaceId;
  const chatId = params?.chatId;

  const [space, setSpace] = useState<Space | null>(null);
  const [chatList, setChatList] = useState<Chat[]>([]);
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

      // If no chatId in URL but chats exist, redirect to first chat
      if (!chatId && chatsData.length > 0) {
        setLocation(`/spaces/${spaceId}/${chatsData[0].id}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load space';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [spaceId, chatId, setLocation]);

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

  const handleSelectChat = (newChatId: string) => {
    setLocation(`/spaces/${spaceId}/${newChatId}`);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50">
      <div className="flex shrink-0">
        <ChatList
          chats={chatList}
          selectedChatId={chatId || null}
          onSelectChat={handleSelectChat}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {chatId ? (
          <div className="flex-1 overflow-hidden">
            <ChatWindow chatId={chatId} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
