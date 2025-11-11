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

export const users = {
  async getMany(ids: string[]) {
    if (!ids.length) return [];
    return await pb.collection('users').getFullList<User>({ filter: ids.map(id => `id='${id}'`).join('||') });
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
      filter: pb.filter('space = {:spaceId}', { spaceId }),
      expand: 'user',
    });
    return records;
  },
};

export const chats = {
  async list(spaceId: string) {
    const records = await pb.collection('chats').getFullList<Chat>({
      filter: pb.filter('space = {:spaceId}', { spaceId }),
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

  async create(spaceId: string, participants: string[], name?: string) {
    if (!auth.user?.id) {
      throw new Error('User must be authenticated to create a chat');
    }
    return await pb.collection('chats').create<Chat>({
      space: spaceId,
      participants,
      name,
      created_by: auth.user.id,
    });
  },

  async delete(chatId: string) {
    await pb.collection('chats').delete(chatId);
  },

  async removeParticipant(chatId: string, userId: string) {
    const chat = await this.getOne(chatId);
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
  async list(chatId: string, page = 1, perPage = 50, beforeTimestamp?: string) {
    const filter = beforeTimestamp
      ? pb.filter('chat = {:chatId} && created < {:beforeTimestamp}', { chatId, beforeTimestamp })
      : pb.filter('chat = {:chatId}', { chatId });
    const records = await pb.collection('messages').getList<Message>(page, perPage, {
      filter,
      expand: 'sender',
      sort: '-created',
    });
    return records;
  },

  async getOne(id: string) {
    const record = await pb.collection('messages').getOne<Message>(id, {
      expand: 'sender',
    });
    return record;
  },

  async getAround(messageId: string, total = 50) {
    const targetMsg = await this.getOne(messageId);
    const halfCount = Math.floor(total / 2);
    const [beforeResult, afterResult] = await Promise.all([
      pb.collection('messages').getList<Message>(1, halfCount, {
        filter: pb.filter('chat = {:chatId} && created < {:created}', { chatId: targetMsg.chat, created: targetMsg.created }),
        expand: 'sender',
        sort: '-created',
      }),
      pb.collection('messages').getList<Message>(1, total - halfCount, {
        filter: pb.filter('chat = {:chatId} && created >= {:created}', { chatId: targetMsg.chat, created: targetMsg.created }),
        expand: 'sender',
        sort: 'created',
      }),
    ]);
    return {
      items: [...beforeResult.items.reverse(), ...afterResult.items],
      hasMoreBefore: beforeResult.totalItems > halfCount,
      hasMoreAfter: afterResult.totalItems > (total - halfCount),
      targetIndex: beforeResult.items.length,
    };
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

  async createWithFile(chatId: string, type: 'image' | 'file' | 'video', file: File, caption?: string) {
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
      filter: pb.filter('chat = {:chatId} && created > {:afterTimestamp}', { chatId, afterTimestamp }),
    });
    return result.totalItems;
  },

  subscribe(chatId: string, callback: (data: PocketBaseEvent<Message>) => void) {
    return pb.collection('messages').subscribe('*', callback, {
      filter: pb.filter('chat = {:chatId}', { chatId }),
    });
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('messages').unsubscribe(subscriptionId);
  },

  async toggleReaction(messageId: string, emoji: string) {
    const msg = await pb.collection('messages').getOne<Message>(messageId);
    const reactions = { ...(msg.reactions || {}) };
    const userId = auth.user!.id;
    if (!reactions[emoji]) reactions[emoji] = [];
    const idx = reactions[emoji].indexOf(userId);
    idx > -1 ? reactions[emoji].splice(idx, 1) : reactions[emoji].push(userId);
    if (!reactions[emoji].length) delete reactions[emoji];
    return await pb.collection('messages').update<Message>(messageId, { reactions });
  },

  async search(chatId: string, query: string, page = 1, perPage = 50) {
    const records = await pb.collection('messages').getList<Message>(page, perPage, {
      filter: pb.filter('chat = {:chatId} && content ~ {:query}', { chatId, query }),
      expand: 'sender',
      sort: '-created',
    });
    return records;
  },
};

export const chatReadStatus = {
  /**
   * Get read status for all chats in a space
   * Returns map of chatId -> last_read_at
   */
  async getForSpace(userId: string, spaceId: string): Promise<Map<string, string>> {
    const records = await pb.collection('chat_read_status').getFullList<ChatReadStatus>({
      filter: pb.filter('user = {:userId} && chat.space = {:spaceId}', { userId, spaceId }),
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
      filter: pb.filter('user = {:userId} && chat = {:chatId}', { userId, chatId }),
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
