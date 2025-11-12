import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth, spaces, pb } from '../services/pocketbase';
import { LAST_SPACE_KEY } from '../components/Sidebar';
import { Alert, Button, Card, FormLabel, Input, FileUpload, RadioGroup, Select, useToastManager, ScrollArea } from '../ui';
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
  const [birthdayDay, setBirthdayDay] = useState<string>('');
  const [birthdayMonth, setBirthdayMonth] = useState<string>('');
  const [birthdayYear, setBirthdayYear] = useState<string>('');
  const [background, setBackground] = useState<string>('');
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
      setBackground(currentUser.background || '');
      setAvatarPreview(
        currentUser.avatar
          ? pb.files.getURL(currentUser as unknown as PocketBaseRecord, currentUser.avatar)
          : null
      );
      // Parse birthday if it exists
      if (currentUser.birthday) {
        const date = new Date(currentUser.birthday);
        setBirthdayDay(date.getDate().toString());
        setBirthdayMonth((date.getMonth() + 1).toString());
        setBirthdayYear(date.getFullYear().toString());
      }
    }
    // Only run on mount - don't reset form when currentUser changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpaceClick = useCallback((space: Space) => {
    localStorage.setItem(LAST_SPACE_KEY, space.id);
    setLocation(`/spaces/${space.id}/chat`);
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
      if (background !== currentUser.background) formData.append('background', background);
      if (avatar) formData.append('avatar', avatar);
      // Handle birthday - combine day, month, year into a date string
      if (birthdayDay && birthdayMonth && birthdayYear) {
        const birthday = `${birthdayYear}-${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`;
        if (birthday !== currentUser.birthday) formData.append('birthday', birthday);
      } else if (currentUser.birthday) {
        // Clear birthday if user removed it
        formData.append('birthday', '');
      }
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

  const dayOptions = useMemo(() => [
    { value: '', label: t('userSettingsDialog.day') },
    ...Array.from({ length: 31 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString()
    }))
  ], [t]);

  const monthOptions = useMemo(() => [
    { value: '', label: t('userSettingsDialog.month') },
    { value: '1', label: t('months.january') },
    { value: '2', label: t('months.february') },
    { value: '3', label: t('months.march') },
    { value: '4', label: t('months.april') },
    { value: '5', label: t('months.may') },
    { value: '6', label: t('months.june') },
    { value: '7', label: t('months.july') },
    { value: '8', label: t('months.august') },
    { value: '9', label: t('months.september') },
    { value: '10', label: t('months.october') },
    { value: '11', label: t('months.november') },
    { value: '12', label: t('months.december') },
  ], [t]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: '', label: t('userSettingsDialog.year') },
      ...Array.from({ length: 100 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString()
      }))
    ];
  }, [t]);

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
            <FormLabel>{t('userSettingsDialog.birthday')}</FormLabel>
            <div className="flex gap-2">
              <Select value={birthdayDay} onChange={(v) => setBirthdayDay(v || '')} options={dayOptions} className="flex-1" />
              <Select value={birthdayMonth} onChange={(v) => setBirthdayMonth(v || '')} options={monthOptions} className="flex-1" />
              <Select value={birthdayYear} onChange={(v) => setBirthdayYear(v || '')} options={yearOptions} className="flex-1" />
            </div>
          </div>
          <div>
            <FormLabel>{t('userSettingsDialog.language')}</FormLabel>
            <RadioGroup value={language} onChange={setLanguage} options={languageOptions} />
          </div>
          <div>
            <FormLabel>{t('userSettingsDialog.theme')}</FormLabel>
            <RadioGroup value={theme} onChange={setTheme} options={themeOptions} />
          </div>
          <div>
            <FormLabel>{t('chats.background')}</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {[null, '1', '2', '3', '4', '5', '6', '7', '8'].map((bg) => (
                <Button
                  key={bg || 'none'}
                  variant="outline"
                  isSelected={background === (bg || '')}
                  onClick={() => setBackground(bg || '')}
                  className="aspect-square center p-1!"
                >
                  {bg ? <div className="w-full h-full" style={{ backgroundImage: `url(/patterns/${bg}-dark.png)`, backgroundSize: '50%' }} /> : <span className="text-xs text-light">None</span>}
                </Button>
              ))}
            </div>
          </div>
          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full center">
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </Card>

      </div>
    </ScrollArea>
  );
}
