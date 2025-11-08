import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import ChatWindow from '../components/ChatWindow';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:spaceId/:chatId?');
  const [, setLocation] = useLocation();
  const chatId = params?.chatId;

  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const { chatId: targetChatId, spaceId: targetSpaceId } = (event as CustomEvent).detail;
      if (targetSpaceId && targetChatId) {
        setLocation(`/spaces/${targetSpaceId}/${targetChatId}`);
      }
    };
    window.addEventListener('notification-click', handleNotificationClick);
    return () => window.removeEventListener('notification-click', handleNotificationClick);
  }, [setLocation]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {chatId ? (
        <ChatWindow chatId={chatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
