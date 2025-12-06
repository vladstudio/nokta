export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  last_seen?: string;
  birthday?: string;
  role?: 'Member' | 'Admin';
  created: string;
  updated: string;
}

export interface Chat {
  id: string;
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
  type: 'text' | 'image' | 'file' | 'video' | 'voice';
  content: string;
  file?: string;
  reactions?: Record<string, string[]>;
  favs?: string[];
  reply_to?: string;
  forwarded_from?: string;
  created?: string;
  updated?: string;
  expand?: {
    sender?: User;
    reply_to?: Message;
    forwarded_from?: Message;
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

export interface Invitation {
  id: string;
  code: string;
  invited_by: string;
  expires_at: string;
  used?: boolean;
  created?: string;
  expand?: { invited_by?: User };
}
