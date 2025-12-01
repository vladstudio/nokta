import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Alert, Dialog, Button, FormLabel, Input, FileUpload, RadioGroup, Select, useToastManager } from '../ui';
import { auth, pb } from '../services/pocketbase';
import { preferences } from '../utils/preferences';
import { UserAvatar } from './Avatar';
import LanguageSwitcher from './LanguageSwitcher';

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
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState<'default' | 'wooden'>(preferences.theme);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [birthdayDay, setBirthdayDay] = useState<string>('');
  const [birthdayMonth, setBirthdayMonth] = useState<string>('');
  const [birthdayYear, setBirthdayYear] = useState<string>('');
  const [background, setBackground] = useState<string>(preferences.background);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email);
      setOldPassword('');
      setPassword('');
      setTheme(preferences.theme);
      setBackground(preferences.background);
      setAvatar(null);
      setAvatarPreview(currentUser.avatar ? pb.files.getURL(currentUser as unknown as PocketBaseRecord, currentUser.avatar) : null);
      if (currentUser.birthday) {
        const date = new Date(currentUser.birthday);
        setBirthdayDay(date.getDate().toString());
        setBirthdayMonth((date.getMonth() + 1).toString());
        setBirthdayYear(date.getFullYear().toString());
      } else {
        setBirthdayDay('');
        setBirthdayMonth('');
        setBirthdayYear('');
      }
      setError(null);
    }
  }, [open, currentUser]);

  const handleThemeChange = (v: 'default' | 'wooden') => { setTheme(v); preferences.theme = v; };
  const handleBackgroundChange = (v: string) => { setBackground(v); preferences.background = v; };

  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentUser) return;
    setError(null);
    setSaving(true);
    try {
      const formData = new FormData();
      if (name !== currentUser.name) formData.append('name', name);
      if (email !== currentUser.email) formData.append('email', email);
      if (password) {
        formData.append('oldPassword', oldPassword);
        formData.append('password', password);
        formData.append('passwordConfirm', password);
      }
      if (avatar) formData.append('avatar', avatar);
      if (birthdayDay && birthdayMonth && birthdayYear) {
        const birthday = `${birthdayYear}-${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`;
        if (birthday !== currentUser.birthday) formData.append('birthday', birthday);
      } else if (currentUser.birthday) {
        formData.append('birthday', '');
      }
      await pb.collection('users').update(currentUser.id, formData);
      await pb.collection('users').authRefresh();
      onOpenChange(false);
      toastManager.add({ title: t('userSettingsDialog.settingsSaved'), data: { type: 'success' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.failedToUpdateSettings'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setLocation('/login');
  };

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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('userSettingsDialog.title')}
      description={t('userSettingsDialog.description')}
      footer={
        <>
          <Button variant="ghost" onClick={handleLogout} disabled={saving}>
            {t('sidebar.logOut')}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="user-settings-form" disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="user-settings-form" onSubmit={handleSave} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <FormLabel>{t('userSettingsDialog.avatar')}</FormLabel>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={currentUser.name || currentUser.email}
                  className="w-20 h-20 rounded-full object-cover"
                />
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
          <FormLabel htmlFor="name">{t('common.name')}</FormLabel>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('common.name')}
          />
        </div>

        <div>
          <FormLabel htmlFor="email">{t('common.email')}</FormLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('common.email')}
          />
        </div>

        <div>
          <FormLabel htmlFor="oldPassword">{t('userSettingsDialog.oldPassword')}</FormLabel>
          <Input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t('userSettingsDialog.oldPassword')}
          />
        </div>

        <div>
          <FormLabel htmlFor="password">{t('userSettingsDialog.newPassword')}</FormLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('userSettingsDialog.leaveBlankPassword')}
          />
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
          <LanguageSwitcher />
        </div>
        <div>
          <FormLabel>{t('userSettingsDialog.theme')}</FormLabel>
          <RadioGroup value={theme} onChange={handleThemeChange} options={themeOptions} />
        </div>
        <div>
          <FormLabel>{t('chats.background')}</FormLabel>
          <div className="grid grid-cols-3 gap-2">
            <Button type="button" variant="outline" isSelected={background === ''} onClick={() => handleBackgroundChange('')} className="aspect-square center p-1!">
              <span className="text-xs text-light">None</span>
            </Button>
            {['1', '2', '3', '4', '5', '6', '7', '8'].map((bg) => (
              <Button key={bg} type="button" variant="outline" isSelected={background === bg} onClick={() => handleBackgroundChange(bg)} className="aspect-square center p-1!">
                <div className={`w-full h-full bg-preview-${bg}`} />
              </Button>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
