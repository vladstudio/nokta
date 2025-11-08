import { useState } from 'react';
import { auth, pb } from '../services/pocketbase';
import { Alert, Button, FormLabel, Input } from '../ui';
import type { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  [key: string]: unknown;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const currentUser = auth.user;
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser?.avatar
      ? pb.files.getUrl(currentUser as unknown as PocketBaseRecord, currentUser.avatar)
      : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const formData = new FormData();
      if (name !== currentUser.name) {
        formData.append('name', name);
      }
      if (email !== currentUser.email) {
        formData.append('email', email);
      }
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await pb.collection('users').update(currentUser.id, formData);

      // Refresh auth to get updated user data
      await pb.collection('users').authRefresh();

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500">
                  {(name || email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
              <span>Change Avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          {/* Email */}
          <div>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Error message */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Success message */}
          {success && <Alert variant="success">Profile updated successfully!</Alert>}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="default" onClick={onClose} disabled={saving} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
