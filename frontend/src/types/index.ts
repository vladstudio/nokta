export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  last_seen?: string;
  created: string;
  updated: string;
}

export interface Space {
  id: string;
  name: string;
  created?: string;
  updated?: string;
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

export interface Chat {
  id: string;
  space: string;
  type: 'public' | 'private';
  participants: string[];
  name?: string;
  created?: string;
  updated?: string;
  expand?: {
    participants?: User[];
  };
}

export interface Message {
  id: string;
  chat: string;
  sender: string | null;
  type: 'text';
  content: string;
  created?: string;
  updated?: string;
  expand?: {
    sender?: User;
  };
}
