import type { Chat } from '../types';

export function getChatDisplayName(
  chat: Chat | null,
  currentUserId: string | undefined,
  fallbacks: {
    directMessage: string;
    groupChat: string;
    defaultName?: string;
  }
): string {
  if (!chat) return fallbacks.defaultName || '';

  if (chat.name) return chat.name;

  if (chat.expand?.participants) {
    const otherParticipants = chat.expand.participants.filter(
      (p) => p.id !== currentUserId
    );
    if (otherParticipants.length > 0) {
      return otherParticipants.map((p) => p.name || p.email).join(', ');
    }
  }

  return chat.participants.length === 2 ? fallbacks.directMessage : fallbacks.groupChat;
}
