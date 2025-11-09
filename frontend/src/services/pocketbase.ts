import PocketBase from 'pocketbase';
import type { User, Space, SpaceMember, Chat, Message, ChatReadStatus, PocketBaseEvent } from '../types';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Disable auto-cancellation - app makes legitimate concurrent requests
pb.autoCancellation(false);

export const auth = {
  async login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record as unknown as User;
  },

  async register(email: string, password: string, passwordConfirm: string, name?: string) {
    const data: { email: string; password: string; passwordConfirm: string; name?: string } = {
      email,
      password,
      passwordConfirm,
    };
    if (name) data.name = name;
    return await pb.collection('users').create<User>(data);
  },

  logout() {
    pb.authStore.clear();
  },

  get isValid() {
    return pb.authStore.isValid;
  },

  get user() {
    return pb.authStore.record as User | null;
  },

  get token() {
    return pb.authStore.token;
  },

  onChange(callback: () => void) {
    return pb.authStore.onChange(callback);
  },
};

export const spaces = {
  async list() {
    return await pb.collection('spaces').getFullList<Space>();
  },

  async getOne(id: string) {
    return await pb.collection('spaces').getOne<Space>(id);
  },
};

export const spaceMembers = {
  async list(spaceId: string) {
    const records = await pb.collection('space_members').getFullList<SpaceMember>({
      filter: `space = "${spaceId}"`,
      expand: 'user',
    });
    return records;
  },
};

export const chats = {
  async list(spaceId: string) {
    const records = await pb.collection('chats').getFullList<Chat>({
      filter: `space = "${spaceId}"`,
      expand: 'participants,last_message_sender',
      sort: '-last_message_at',
    });
    return records;
  },

  async getOne(id: string) {
    const record = await pb.collection('chats').getOne<Chat>(id, {
      expand: 'participants,last_message_sender',
    });
    return record;
  },

  async create(spaceId: string, type: 'public' | 'private', participants: string[], name?: string) {
    return await pb.collection('chats').create<Chat>({
      space: spaceId,
      type,
      participants,
      name,
      created_by: auth.user?.id,
    });
  },

  async delete(chatId: string) {
    await pb.collection('chats').delete(chatId);
  },

  async removeParticipant(chatId: string, chat: Chat, userId: string) {
    const updatedParticipants = chat.participants.filter(id => id !== userId);
    return await pb.collection('chats').update<Chat>(chatId, {
      participants: updatedParticipants,
    });
  },

  subscribe(callback: (data: PocketBaseEvent<Chat>) => void) {
    return pb.collection('chats').subscribe('*', callback);
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('chats').unsubscribe(subscriptionId);
  },
};

export const messages = {
  async list(chatId: string, page = 1, perPage = 50) {
    const records = await pb.collection('messages').getList<Message>(page, perPage, {
      filter: `chat = "${chatId}"`,
      expand: 'sender',
      sort: '-created', // Sort descending to get LATEST 50 messages
    });
    return records;
  },

  async getOne(id: string) {
    const record = await pb.collection('messages').getOne<Message>(id, {
      expand: 'sender',
    });
    return record;
  },

  async create(chatId: string, content: string) {
    const record = await pb.collection('messages').create<Message>({
      chat: chatId,
      sender: auth.user?.id,
      type: 'text',
      content,
    });
    return record;
  },

  async update(messageId: string, content: string) {
    const record = await pb.collection('messages').update<Message>(messageId, {
      content,
    });
    return record;
  },

  async delete(messageId: string) {
    await pb.collection('messages').delete(messageId);
  },

  async createWithFile(chatId: string, type: 'image' | 'file', file: File, caption?: string) {
    const formData = new FormData();
    formData.append('chat', chatId);
    formData.append('sender', auth.user?.id || '');
    formData.append('type', type);
    formData.append('content', caption || file.name);
    formData.append('file', file);

    const record = await pb.collection('messages').create<Message>(formData);
    return record;
  },

  getFileURL(message: Message, thumb?: string): string {
    if (!message.file) return '';
    return pb.files.getURL(message, message.file, thumb ? { thumb } : {});
  },

  async countUnread(chatId: string, afterTimestamp: string): Promise<number> {
    const result = await pb.collection('messages').getList(1, 1, {
      filter: `chat = "${chatId}" && created > "${afterTimestamp}"`,
    });
    return result.totalItems;
  },

  subscribe(chatId: string, callback: (data: PocketBaseEvent<Message>) => void) {
    return pb.collection('messages').subscribe('*', callback, {
      filter: `chat = "${chatId}"`,
    });
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('messages').unsubscribe(subscriptionId);
  },
};

export const chatReadStatus = {
  /**
   * Get read status for all chats in a space
   * Returns map of chatId -> last_read_at
   */
  async getForSpace(userId: string, spaceId: string): Promise<Map<string, string>> {
    const records = await pb.collection('chat_read_status').getFullList<ChatReadStatus>({
      filter: `user = "${userId}" && chat.space = "${spaceId}"`,
      expand: 'chat',
    });

    const map = new Map<string, string>();
    records.forEach(record => {
      map.set(record.chat, record.last_read_at);
    });
    return map;
  },

  /**
   * Get or create read status for a specific chat
   */
  async getOrCreate(userId: string, chatId: string): Promise<ChatReadStatus> {
    const records = await pb.collection('chat_read_status').getFullList<ChatReadStatus>({
      filter: `user = "${userId}" && chat = "${chatId}"`,
    });

    if (records.length > 0) {
      return records[0];
    }

    return await pb.collection('chat_read_status').create<ChatReadStatus>({
      user: userId,
      chat: chatId,
      last_read_at: new Date().toISOString(),
    });
  },

  /**
   * Mark chat as read (update last_read_at to now)
   */
  async markAsRead(userId: string, chatId: string): Promise<void> {
    const status = await this.getOrCreate(userId, chatId);

    await pb.collection('chat_read_status').update(status.id, {
      last_read_at: new Date().toISOString(),
    });
  },

  /**
   * Subscribe to read status changes (for multi-device sync)
   */
  subscribe(userId: string, callback: (data: PocketBaseEvent<ChatReadStatus>) => void) {
    return pb.collection('chat_read_status').subscribe('*', callback, {
      filter: pb.filter('user = {:userId}', { userId }),
    });
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('chat_read_status').unsubscribe(subscriptionId);
  },
};

export { pb };
export default pb;
