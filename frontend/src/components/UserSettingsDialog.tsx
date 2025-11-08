import { useState, useEffect } from 'react';
import { Dialog, Button, Input, FileUpload, useToastManager } from '../ui';
import { auth, pb } from '../services/pocketbase';

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  [key: string]: unknown;
}

export default function UserSettingsDialog({ open, onOpenChange }: UserSettingsDialogProps) {
  const currentUser = auth.user;
  const toastManager = useToastManager();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email);
      setPassword('');
      setAvatar(null);
      setAvatarPreview(
        currentUser.avatar
          ? pb.files.getUrl(currentUser as unknown as PocketBaseRecord, currentUser.avatar)
          : null
      );
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setError(null);
    setSaving(true);

    try {
      const formData = new FormData();

      if (name !== currentUser.name) formData.append('name', name);
      if (email !== currentUser.email) formData.append('email', email);
      if (password) {
        formData.append('password', password);
        formData.append('passwordConfirm', password);
      }
      if (avatar) formData.append('avatar', avatar);

      await pb.collection('users').update(currentUser.id, formData);
      await pb.collection('users').authRefresh();

      onOpenChange(false);
      toastManager.add({
        title: 'Settings saved',
        description: 'Your profile has been updated successfully',
        data: { type: 'success' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title="My Settings"
        description="Update your profile information"
        footer={
          <>
            <Button variant="default" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <FileUpload value={avatar} onChange={handleAvatarChange} preview={avatarPreview} />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>
        </div>
    </Dialog>
  );
}
