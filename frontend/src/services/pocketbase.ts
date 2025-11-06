import PocketBase from 'pocketbase';
import type { User, Space, SpaceMember, Chat, Message } from '../types';

const pb = new PocketBase('http://127.0.0.1:8090');

// Enable auto-cancellation for duplicate requests
pb.autoCancellation(false);

export const auth = {
  async login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record as User;
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
      sort: 'created',
    });
    return records;
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

  subscribe(chatId: string, callback: (data: any) => void) {
    return pb.collection('messages').subscribe('*', callback, {
      filter: `chat = "${chatId}"`,
    });
  },

  unsubscribe(subscriptionId?: string) {
    return pb.collection('messages').unsubscribe(subscriptionId);
  },
};

export { pb };
export default pb;
