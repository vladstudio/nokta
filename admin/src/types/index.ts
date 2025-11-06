export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface Space {
  id: string;
  name: string;
  created: string;
  updated: string;
}

export interface SpaceMember {
  id: string;
  space: string;
  user: string;
  role: 'admin' | 'member';
  joined_at: string;
  expand?: {
    user?: User;
  };
}

export interface AuthStore {
  token: string;
  user: User;
}

export interface Chat {
  id: string;
  space: string;
  type: 'public' | 'private';
  participants: string[];
  name?: string;
  created: string;
  updated: string;
  expand?: {
    participants?: User[];
  };
}
