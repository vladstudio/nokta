import { pb } from './pocketbase';
import { dailyAPI } from './daily';
import type { Chat } from '../types';
import type { RecordSubscription } from 'pocketbase';

export const callsAPI = {
  /**
   * Start or join a call in a chat
   * - Creates Daily room if chat doesn't have one
   * - Adds current user to call_participants
   * - Sets is_active_call to true
   */
  async startCall(chatId: string): Promise<Chat> {
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) throw new Error('User not authenticated');

    const chat = await pb.collection('chats').getOne<Chat>(chatId);
    let dailyRoomUrl = chat.daily_room_url;

    // Create room if it doesn't exist
    if (!dailyRoomUrl) {
      const roomName = `nokta-${chatId}-${Date.now()}`;
      try {
        const dailyRoom = await dailyAPI.createRoom(roomName);
        dailyRoomUrl = dailyRoom.url;
      } catch (error) {
        console.error('Failed to create Daily.co room:', error);
        throw new Error('Failed to create call room');
      }
    }

    // Add user to call_participants if not already there
    const callParticipants = chat.call_participants || [];
    const updatedParticipants = callParticipants.includes(currentUserId)
      ? callParticipants
      : [...callParticipants, currentUserId];

    // Update chat with room URL and active call status
    const updatedChat = await pb.collection('chats').update<Chat>(chatId, {
      daily_room_url: dailyRoomUrl,
      is_active_call: true,
      call_participants: updatedParticipants
    });

    return updatedChat;
  },

  /**
   * Leave a call
   * - Removes user from call_participants
   * - Sets is_active_call to false if no participants remain
   */
  async leaveCall(chatId: string, userId: string): Promise<Chat> {
    const chat = await pb.collection('chats').getOne<Chat>(chatId);
    const callParticipants = chat.call_participants || [];

    // Remove user from participants
    const updatedParticipants = callParticipants.filter(id => id !== userId);

    // Update chat
    const updatedChat = await pb.collection('chats').update<Chat>(chatId, {
      call_participants: updatedParticipants,
      is_active_call: updatedParticipants.length > 0
    });

    return updatedChat;
  },

  /**
   * Get all chats with active calls in a space
   */
  async getActiveCallsInSpace(spaceId: string): Promise<Chat[]> {
    const chats = await pb.collection('chats').getFullList<Chat>({
      filter: `space = "${spaceId}" && is_active_call = true`,
      sort: '-updated',
      expand: 'participants'
    });
    return chats;
  },

  /**
   * Subscribe to chat updates in a space
   * Passes all chat update events to callback for active call tracking
   */
  subscribeToActiveCalls(
    spaceId: string,
    callback: (data: RecordSubscription<Chat>) => void
  ) {
    return pb.collection('chats').subscribe('*', async (data) => {
      // Only trigger callback for chats in this space
      if (data.record.space === spaceId && data.action === 'update') {
        // Fetch full chat with expanded participants for proper display
        try {
          const fullChat = await pb.collection('chats').getOne<Chat>(data.record.id, {
            expand: 'participants'
          });
          callback({ ...data, record: fullChat });
        } catch (error) {
          console.error('Failed to fetch full chat:', error);
          callback({ ...data, record: data.record as unknown as Chat });
        }
      }
    });
  }
};
