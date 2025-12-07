import PocketBase from 'pocketbase';
import type { User, Chat, Message, ChatReadStatus, Invitation, PocketBaseEvent } from '../types';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

/**
 * Generate a cryptographically secure random password
 */
function generateSecurePassword(length = 24): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(value => charset[value % charset.length])
    .join('');
}

// Disable auto-cancellation - app makes legitimate concurrent requests
pb.autoCancellation(false);

// Native app bridges for push notifications
declare global {
  interface Window {
    NoktaAndroid?: {
      registerPushToken(authToken: string, userId: string): void;
    };
    webkit?: {
      messageHandlers?: {
        NoktaiOS?: {
          postMessage(data: { authToken: string; userId: string }): void;
        };
      };
    };
  }
}

export const auth = {
  async login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    if ((authData.record as unknown as User).banned) {
      pb.authStore.clear();
      throw new Error('banned');
    }
    // Register push token on native apps
    if (window.NoktaAndroid) {
      window.NoktaAndroid.registerPushToken(pb.authStore.token, authData.record.id);
    } else if (window.webkit?.messageHandlers?.NoktaiOS) {
      window.webkit.messageHandlers.NoktaiOS.postMessage({ authToken: pb.authStore.token, userId: authData.record.id });
    }
    return authData.record as unknown as User;
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

  async refresh() {
    if (!pb.authStore.isValid) return;
    try { await pb.collection('users').authRefresh(); }
    catch { pb.authStore.clear(); }
  },

  subscribeToCurrentUser(onBanned: () => void) {
    const userId = pb.authStore.record?.id;
    if (!userId) return () => {};
    pb.collection('users').subscribe(userId, (e) => {
      if (e.record.banned) onBanned();
    });
    return () => pb.collection('users').unsubscribe(userId);
  },
};

export const users = {
  async getMany(ids: string[]) {
    if (!ids.length) return [];
    const filterConditions = ids.map((_, index) => `id = {:id${index}}`).join(' || ');
    const filterParams = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
    return await pb.collection('users').getFullList<User>({
      filter: pb.filter(filterConditions, filterParams)
    });
  },

  async updateBackground(userId: string, background: string) {
    return await pb.collection('users').update<User>(userId, { background });
  },

  async list() {
    return await pb.collection('users').getFullList<User>({ sort: '-created' });
  },

  async create(email: string, name: string, role: 'Member' | 'Admin' = 'Member', password?: string) {
    const pwd = password || generateSecurePassword();
    const user = await pb.collection('users').create<User>({ email, name, role, password: pwd, passwordConfirm: pwd, emailVisibility: true });
    return { user, password: pwd };
  },

  async update(userId: string, data: Partial<User> | FormData) {
    return await pb.collection('users').update<User>(userId, data);
  },

  async setBanned(userId: string, banned: boolean) {
    return await pb.collection('users').update<User>(userId, { banned });
  },
};

export const chats = {
  async list() {
    if (!auth.user?.id) {
      throw new Error('User must be authenticated to list chats');
    }
    const records = await pb.collection('chats').getFullList<Chat>({
      filter: pb.filter('participants.id ?= {:userId}', { userId: auth.user.id }),
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

  async create(participants: string[], name?: string) {
    if (!auth.user?.id) {
      throw new Error('User must be authenticated to create a chat');
    }
    return await pb.collection('chats').create<Chat>({
      participants,
      name,
      created_by: auth.user.id,
    });
  },

  async update(chatId: string, name?: string, participants?: string[]) {
    const data: { name?: string; participants?: string[] } = {};
    if (name !== undefined) data.name = name;
    if (participants !== undefined) data.participants = participants;
    return await pb.collection('chats').update<Chat>(chatId, data);
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
      expand: 'sender,reply_to,forwarded_from',
      sort: '-created',
    });
    return records;
  },

  async getOne(id: string) {
    const record = await pb.collection('messages').getOne<Message>(id, {
      expand: 'sender,reply_to,forwarded_from',
    });
    return record;
  },

  async getAround(messageId: string, total = 50) {
    const targetMsg = await this.getOne(messageId);
    const halfCount = Math.floor(total / 2);
    const [beforeResult, afterResult] = await Promise.all([
      pb.collection('messages').getList<Message>(1, halfCount, {
        filter: pb.filter('chat = {:chatId} && created < {:created}', { chatId: targetMsg.chat, created: targetMsg.created }),
        expand: 'sender,reply_to,forwarded_from',
        sort: '-created',
      }),
      pb.collection('messages').getList<Message>(1, total - halfCount, {
        filter: pb.filter('chat = {:chatId} && created >= {:created}', { chatId: targetMsg.chat, created: targetMsg.created }),
        expand: 'sender,reply_to,forwarded_from',
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

  async create(chatId: string, content: string, replyTo?: string) {
    const record = await pb.collection('messages').create<Message>({
      chat: chatId,
      sender: auth.user?.id,
      type: 'text',
      content,
      ...(replyTo && { reply_to: replyTo }),
    });
    return record;
  },

  async forward(chatId: string, originalMessage: Message) {
    const record = await pb.collection('messages').create<Message>({
      chat: chatId,
      sender: auth.user?.id,
      type: originalMessage.type,
      content: originalMessage.content,
      ...(originalMessage.file && { file: originalMessage.file }),
      forwarded_from: originalMessage.id,
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

  async clearChat(chatId: string) {
    const batch = await pb.collection('messages').getFullList({ filter: pb.filter('chat = {:chatId}', { chatId }) });
    await Promise.all(batch.map((m) => pb.collection('messages').delete(m.id)));
  },

  async createWithFile(chatId: string, type: 'image' | 'file' | 'video' | 'voice', file: File, caption?: string) {
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

  subscribeToMultipleChats(chatIds: string[], callback: (data: PocketBaseEvent<Message>) => void) {
    if (chatIds.length === 0) {
      return Promise.resolve(() => {});
    }
    const filterConditions = chatIds.map((_, index) => `chat = {:chatId${index}}`).join(' || ');
    const filterParams = Object.fromEntries(chatIds.map((id, index) => [`chatId${index}`, id]));
    return pb.collection('messages').subscribe('*', callback, {
      filter: pb.filter(filterConditions, filterParams),
    });
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('messages').unsubscribe(subscriptionId);
  },

  async toggleReaction(messageId: string, emoji: string) {
    if (!auth.user?.id) {
      throw new Error('User must be authenticated to react to messages');
    }
    const msg = await pb.collection('messages').getOne<Message>(messageId);
    const reactions = { ...(msg.reactions || {}) };
    const userId = auth.user.id;
    if (!reactions[emoji]) reactions[emoji] = [];
    const idx = reactions[emoji].indexOf(userId);
    idx > -1 ? reactions[emoji].splice(idx, 1) : reactions[emoji].push(userId);
    if (!reactions[emoji].length) delete reactions[emoji];
    return await pb.collection('messages').update<Message>(messageId, { reactions });
  },

  async toggleFav(messageId: string) {
    if (!auth.user?.id) throw new Error('User must be authenticated');
    const msg = await pb.collection('messages').getOne<Message>(messageId);
    const favs = [...(msg.favs || [])];
    const idx = favs.indexOf(auth.user.id);
    idx > -1 ? favs.splice(idx, 1) : favs.push(auth.user.id);
    return await pb.collection('messages').update<Message>(messageId, { favs });
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
   * Get read status for all chats
   * Returns map of chatId -> last_read_at
   */
  async getAll(userId: string): Promise<Map<string, string>> {
    const records = await pb.collection('chat_read_status').getFullList<ChatReadStatus>({
      filter: pb.filter('user = {:userId}', { userId }),
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

export const invitations = {
  async list() {
    return await pb.collection('invitations').getFullList<Invitation>({
      filter: pb.filter('invited_by = {:userId} && used != true', { userId: auth.user?.id }),
      sort: '-created',
    });
  },

  async create() {
    const code = crypto.randomUUID().replace(/-/g, '');
    const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    return await pb.collection('invitations').create<Invitation>({
      code,
      invited_by: auth.user?.id,
      expires_at: expires,
      used: false,
    });
  },

  async getByCode(code: string) {
    // Use secure validation endpoint that doesn't expose all invitation data
    const result = await pb.send<{ valid: boolean; invitedBy?: string; expiresAt?: string }>('/api/invitations/validate', {
      method: 'POST',
      body: { code },
    });
    if (!result.valid) return null;
    return {
      code,
      invited_by: '',
      expires_at: result.expiresAt || '',
      used: false,
      inviterName: result.invitedBy,
    } as Invitation & { inviterName?: string };
  },

  async markUsed(id: string) {
    return await pb.collection('invitations').update<Invitation>(id, { used: true });
  },

  async delete(id: string) {
    await pb.collection('invitations').delete(id);
  },

  async signup(code: string, name: string, email: string, password: string) {
    // Use secure backend endpoint that handles everything atomically
    const result = await pb.send<{ id: string; email: string; name: string }>('/api/invitations/signup', {
      method: 'POST',
      body: { code, name, email, password },
    });
    // Log in with the newly created account
    await auth.login(email, password);
    return result as unknown as User;
  },
};

export const stats = {
  async get(): Promise<{ dataSizeMB: number; freeSpaceMB: number }> {
    return await pb.send('/api/stats', { method: 'GET' });
  },
};

export const nokta = {
  async getInfo(): Promise<{ app: string; version: string }> {
    return await pb.send('/api/nokta', { method: 'GET' });
  },
};

export { pb };
export default pb;
