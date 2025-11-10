import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth, spaces, pb } from '../services/pocketbase';
import { LAST_SPACE_KEY } from '../components/Sidebar';
import { Alert, Button, Card, FormLabel, Input, FileUpload, RadioGroup, useToastManager, ScrollArea } from '../ui';
import { UserAvatar } from '../components/Avatar';
import type { Space } from '../types';
import { ArrowRightIcon } from "@phosphor-icons/react";

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
  const [theme, setTheme] = useState<'default' | 'wooden'>('default');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email);
      setLanguage(currentUser.language || 'en');
      setTheme(currentUser.theme || 'default');
      setAvatarPreview(
        currentUser.avatar
          ? pb.files.getURL(currentUser as unknown as PocketBaseRecord, currentUser.avatar)
          : null
      );
    }
    // Only run on mount - don't reset form when currentUser changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (theme !== currentUser.theme) formData.append('theme', theme);
      if (avatar) formData.append('avatar', avatar);
      await pb.collection('users').update(currentUser.id, formData);
      await pb.collection('users').authRefresh();
      if (language !== i18n.language) await i18n.changeLanguage(language);
      toastManager.add({
        title: t('userSettingsDialog.settingsSaved'),
        data: { type: 'success' },
      });
      setLocation('/');
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

  const themeOptions = useMemo(() => [
    { value: 'default' as const, label: t('themes.default') },
    { value: 'wooden' as const, label: t('themes.wooden') },
  ], [t]);

  if (!currentUser) return null;

  return (
    <ScrollArea>
      <div className="mx-auto w-full max-w-md grid gap-4 p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold flex-1">{t('mySpacesPage.title')}</h2>
          <Button variant="ghost" onClick={handleLogout} className="text-xs text-light">
            {t('sidebar.logOut')}
          </Button>
        </div>
        {spaceList.length > 0 ? (
          <div className="space-y-1">
            {spaceList.map((space) => (
              <Button
                variant="default"
                key={space.id}
                onClick={() => handleSpaceClick(space)}
                className="w-full p-3! text-left font-normal! flex items-center gap-2"
              >
                <div className="flex-1">{space.name}</div>
                <ArrowRightIcon size={20} className="text-accent" />
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-light font-medium text-center p-4 sm:p-8">{t('mySpacesPage.noSpaces')}</p>
        )}
        <hr />
        <h2 className="font-semibold">{t('userSettingsDialog.title')}</h2>
        <Card border shadow="sm" padding="lg" className="space-y-4">
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
          <div>
            <FormLabel>{t('userSettingsDialog.theme')}</FormLabel>
            <RadioGroup value={theme} onChange={setTheme} options={themeOptions} />
          </div>
          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full">
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </Card>

      </div>
    </ScrollArea>
  );
}
