export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  last_seen?: string;
  language?: 'en' | 'ru';
  theme?: 'default' | 'wooden';
  birthday?: string;
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
  participants: string[];
  created_by?: string;
  name?: string;
  avatar?: string;
  last_message_at?: string;
  last_message_content?: string;
  last_message_sender?: string;
  daily_room_url?: string;
  is_active_call?: boolean;
  call_participants?: string[];
  background?: string;
  created?: string;
  updated?: string;
  unreadCount?: number; // Computed client-side, not from DB
  expand?: {
    participants?: User[];
    last_message_sender?: User;
  };
}

export interface Message {
  id: string;
  chat: string;
  sender: string | null;
  type: 'text' | 'image' | 'file' | 'video';
  content: string;
  file?: string;
  reactions?: Record<string, string[]>;
  created?: string;
  updated?: string;
  expand?: {
    sender?: User;
  };
}

export interface ChatReadStatus {
  id: string;
  user: string;
  chat: string;
  last_read_at: string; // ISO datetime
  created?: string;
  updated?: string;
}

// PocketBase real-time event types
export interface PocketBaseEvent<T = any> {
  action: string;
  record: T;
}

export interface TypingEvent {
  id: string;
  chat: string;
  user: string;
  userName: string;
  timestamp: string;
}

export interface UserPresenceData {
  id: string;
  last_seen: string;
}
