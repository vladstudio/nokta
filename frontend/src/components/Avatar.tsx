import Avatar from 'boring-avatars';
import pb from '../services/pocketbase';

interface UserAvatarProps {
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  size?: number;
  className?: string;
}

interface ChatAvatarProps {
  chat?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 40, className = '' }: UserAvatarProps) {
  if (!user) {
    return null;
  }

  const displayName = user.name || user.email || 'User';

  if (user.avatar) {
    const avatarUrl = pb.files.getURL(user, user.avatar, { thumb: `${size}x${size}` });
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Avatar
      size={size}
      name={displayName}
      variant="beam"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
      className={className}
    />
  );
}

export function ChatAvatar({ chat, size = 40, className = '' }: ChatAvatarProps) {
  if (!chat) {
    return null;
  }

  const displayName = chat.name || 'Chat';

  if (chat.avatar) {
    const avatarUrl = pb.files.getURL(chat, chat.avatar, { thumb: `${size}x${size}` });
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Avatar
      size={size}
      name={displayName}
      variant="beam"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
      className={className}
    />
  );
}
