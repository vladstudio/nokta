import Avatar from 'boring-avatars';
import pb from '../services/pocketbase';

interface AvatarRecord {
  id: string;
  collectionId?: string;
  collectionName?: string;
  avatar?: string;
  [key: string]: unknown;
}

interface GenericAvatarProps {
  record: AvatarRecord | undefined;
  displayName: string;
  size?: number;
  className?: string;
}

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

function GenericAvatar({ record, displayName, size = 40, className = '' }: GenericAvatarProps) {
  if (!record) {
    return null;
  }

  if (record.avatar) {
    const avatarUrl = pb.files.getURL(record, record.avatar, { thumb: `${size}x${size}` });
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

export function UserAvatar({ user, size = 40, className = '' }: UserAvatarProps) {
  const displayName = user?.name || user?.email || 'User';
  return <GenericAvatar record={user} displayName={displayName} size={size} className={className} />;
}

export function ChatAvatar({ chat, size = 40, className = '' }: ChatAvatarProps) {
  const displayName = chat?.name || 'Chat';
  return <GenericAvatar record={chat} displayName={displayName} size={size} className={className} />;
}
