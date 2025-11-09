import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth, spaces, pb } from '../services/pocketbase';
import { LAST_SPACE_KEY } from '../components/Sidebar';
import { Alert, Button, FormLabel, Input, FileUpload, RadioGroup, useToastManager } from '../ui';
import { UserAvatar } from '../components/Avatar';
import type { Space } from '../types';

interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  [key: string]: unknown;
}

export default function MyPage() {
  const { t, i18n } = useTranslation();
  const toastManager = useToastManager();
  const [, setLocation] = useLocation();
  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const currentUser = auth.user;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'en' | 'ru'>('en');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  useEffect(() => {
    loadSpaces();
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email);
      setLanguage(currentUser.language || 'en');
      setAvatarPreview(
        currentUser.avatar
          ? pb.files.getURL(currentUser as unknown as PocketBaseRecord, currentUser.avatar)
          : null
      );
    }
  }, [loadSpaces, currentUser]);

  const handleSpaceClick = useCallback((space: Space) => {
    localStorage.setItem(LAST_SPACE_KEY, space.id);
    setLocation(`/spaces/${space.id}/chats`);
  }, [setLocation]);

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
      if (language !== currentUser.language) formData.append('language', language);
      if (avatar) formData.append('avatar', avatar);
      await pb.collection('users').update(currentUser.id, formData);
      await pb.collection('users').authRefresh();
      if (language !== i18n.language) await i18n.changeLanguage(language);
      toastManager.add({
        title: t('userSettingsDialog.settingsSaved'),
        description: t('userSettingsDialog.settingsSavedDesc'),
        data: { type: 'success' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.failedToUpdateSettings'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = useCallback(() => {
    auth.logout();
    setLocation('/login');
  }, [setLocation]);

  const languageOptions = useMemo(() => [
    { value: 'en' as const, label: t('languages.en') },
    { value: 'ru' as const, label: t('languages.ru') },
  ], [t]);

  if (!currentUser) return null;

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 overflow-y-auto">
      <div className="w-full max-w-md space-y-8 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('mySpacesPage.title')}</h1>
          {spaceList.length > 0 ? (
            <div className="space-y-3">
              {spaceList.map((space) => (
                <button
                  key={space.id}
                  onClick={() => handleSpaceClick(space)}
                  className="card w-full p-5 text-left"
                >
                  <div className="font-semibold text-gray-900 text-base">{space.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state card py-12">
              <p className="text-sm">{t('mySpacesPage.noSpaces')}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('userSettingsDialog.title')}</h2>
          <div className="card p-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <div>
              <FormLabel>{t('userSettingsDialog.avatar')}</FormLabel>
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={currentUser.name || currentUser.email} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <UserAvatar user={currentUser} size={80} />
                  )}
                </div>
                <div className="flex-1">
                  <FileUpload value={avatar} onChange={handleAvatarChange} preview={null} />
                </div>
              </div>
            </div>
            <div>
              <FormLabel htmlFor="name">{t('userSettingsDialog.name')}</FormLabel>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('userSettingsDialog.namePlaceholder')} />
            </div>
            <div>
              <FormLabel htmlFor="email">{t('userSettingsDialog.email')}</FormLabel>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('userSettingsDialog.emailPlaceholder')} />
            </div>
            <div>
              <FormLabel htmlFor="password">{t('userSettingsDialog.password')}</FormLabel>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('userSettingsDialog.leaveBlankPassword')} />
            </div>
            <div>
              <FormLabel>{t('userSettingsDialog.language')}</FormLabel>
              <RadioGroup value={language} onChange={setLanguage} options={languageOptions} />
            </div>
            <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full">
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>

        <div>
          <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900 underline">
            {t('sidebar.logOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
