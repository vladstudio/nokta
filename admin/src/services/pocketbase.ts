import PocketBase from 'pocketbase';
import type { User, Space, SpaceMember } from '../types';

const pb = new PocketBase('http://127.0.0.1:8090');

// Enable auto-cancellation for duplicate requests
pb.autoCancellation(false);

export const auth = {
  async login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record as User;
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
};

export const spaces = {
  async list() {
    const records = await pb.collection('spaces').getFullList<Space>();
    return records;
  },

  async create(name: string) {
    const record = await pb.collection('spaces').create<Space>({
      name,
    });
    return record;
  },

  async update(id: string, name: string) {
    const record = await pb.collection('spaces').update<Space>(id, {
      name,
    });
    return record;
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

  async add(spaceId: string, userId: string, role: 'admin' | 'member') {
    const record = await pb.collection('space_members').create<SpaceMember>({
      space: spaceId,
      user: userId,
      role,
      joined_at: new Date().toISOString(),
    });
    return record;
  },

  async update(id: string, role: 'admin' | 'member') {
    const record = await pb.collection('space_members').update<SpaceMember>(id, {
      role,
    });
    return record;
  },
};

export const users = {
  async list() {
    const records = await pb.collection('users').getFullList<User>();
    return records;
  },
};

export default pb;
