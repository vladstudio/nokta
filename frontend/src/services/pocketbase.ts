import PocketBase from 'pocketbase';
import type { User, Space, SpaceMember, Chat, Message, ChatReadStatus } from '../types';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Enable auto-cancellation for duplicate requests
pb.autoCancellation(false);

export const auth = {
  async login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record as unknown as User;
  },

  async register(email: string, password: string, passwordConfirm: string, name?: string) {
    const data: any = { email, password, passwordConfirm };
    if (name) data.name = name;
    const record = await pb.collection('users').create<User>(data);
    return record;
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
    const records = await pb.collection('spaces').getFullList<Space>();
    return records;
  },

  async getOne(id: string) {
    const record = await pb.collection('spaces').getOne<Space>(id);
    return record;
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
      expand: 'participants',
    });
    return records;
  },

  async getOne(id: string) {
    const record = await pb.collection('chats').getOne<Chat>(id, {
      expand: 'participants',
    });
    return record;
  },

  subscribe(callback: (data: any) => void) {
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

  async countUnread(chatId: string, afterTimestamp: string): Promise<number> {
    const result = await pb.collection('messages').getList(1, 1, {
      filter: `chat = "${chatId}" && created > "${afterTimestamp}"`,
    });
    return result.totalItems;
  },

  subscribe(chatId: string, callback: (data: any) => void) {
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
    try {
      const records = await pb.collection('chat_read_status').getFullList<ChatReadStatus>({
        filter: `user = "${userId}" && chat = "${chatId}"`,
      });

      if (records.length > 0) {
        return records[0];
      }
    } catch (err) {
      // Doesn't exist, create it
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
  subscribe(userId: string, callback: (data: any) => void) {
    return pb.collection('chat_read_status').subscribe('*', callback, {
      filter: `user = "${userId}"`,
    });
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('chat_read_status').unsubscribe(subscriptionId);
  },
};

export { pb };
export default pb;
