import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth, users, pb } from '../services/pocketbase';
import { preferences } from '../utils/preferences';
import { Alert, Button, Card, FormLabel, Input, FileUpload, RadioGroup, Select, ScrollArea } from '../ui';
import { UserAvatar } from '../components/Avatar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useIsMobile } from '../hooks/useIsMobile';
import { ArrowLeftIcon, ShieldCheckIcon, EnvelopeIcon } from '@phosphor-icons/react';
import type { Theme } from '../hooks/useTheme';
import type { User } from '../types';

const BIRTH_YEAR_RANGE = 100;

export default function UserSettingsPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const currentUser = auth.user;

  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState<Theme>(preferences.theme);
  const [fontSize, setFontSize] = useState(preferences.fontSize);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [birthdayDay, setBirthdayDay] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayYear, setBirthdayYear] = useState('');
  const [background, setBackground] = useState(preferences.background);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      if (!avatar) {
        setAvatarPreview(currentUser.avatar ? pb.files.getURL(currentUser as User & { collectionId: string; collectionName: string }, currentUser.avatar) : null);
      }
      if (currentUser.birthday) {
        const [y, m, d] = currentUser.birthday.split('T')[0].split('-');
        setBirthdayDay(String(parseInt(d)));
        setBirthdayMonth(String(parseInt(m)));
        setBirthdayYear(y);
      }
    }
  }, [currentUser?.id]);

  const handleThemeChange = (v: Theme) => { setTheme(v); preferences.theme = v; };
  const handleFontSizeChange = (v: 'default' | 'large') => { setFontSize(v); preferences.fontSize = v; };
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
    if (password && !oldPassword) {
      setError(t('userSettingsDialog.oldPasswordRequired'));
      return;
    }
    setStatus('saving');
    setError('');
    try {
      const formData = new FormData();
      if (name !== currentUser.name) formData.append('name', name);
      if (password) {
        formData.append('oldPassword', oldPassword);
        formData.append('password', password);
        formData.append('passwordConfirm', password);
      }
      if (avatar) formData.append('avatar', avatar);
      if (birthdayDay && birthdayMonth && birthdayYear) {
        const birthday = `${birthdayYear}-${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`;
        if (birthday !== currentUser.birthday?.split('T')[0]) formData.append('birthday', birthday);
      } else if (currentUser.birthday) {
        formData.append('birthday', '');
      }
      await users.update(currentUser.id, formData);
      await auth.refresh();
      setAvatar(null);
      setStatus('saved');
      setPassword('');
      setOldPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.failedToUpdateSettings'));
      setStatus('idle');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setLocation('/login');
  };

  const themeOptions = useMemo(() => [
    { value: 'default' as const, label: t('themes.default') },
    { value: 'wooden' as const, label: t('themes.wooden') },
    { value: 'golden' as const, label: t('themes.golden') },
    { value: 'high-contrast' as const, label: t('themes.high-contrast') },
    { value: 'green' as const, label: t('themes.green') },
  ], [t]);

  const fontSizeOptions = useMemo(() => [
    { value: 'default' as const, label: t('userSettingsDialog.fontSizeDefault') },
    { value: 'large' as const, label: t('userSettingsDialog.fontSizeLarge') },
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
      ...Array.from({ length: BIRTH_YEAR_RANGE }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString()
      }))
    ];
  }, [t]);

  if (!currentUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between p-2 pl-4 border-b bg-(--color-bg-primary) border-(--color-border-default)">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button onClick={() => setLocation('/chat')} className="p-1 -ml-2">
              <ArrowLeftIcon size={20} className="text-accent" />
            </button>
          )}
          <h2 className="font-semibold">{t('userSettingsDialog.title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          {auth.user?.role === 'Admin' && (
            <Button variant="ghost" onClick={() => setLocation('/admin')} className="text-accent">
              <ShieldCheckIcon size={20} className="text-accent" /> Admin
            </Button>
          )}
          <Button variant="ghost" onClick={() => setLocation('/invites')} className="text-accent">
            <EnvelopeIcon size={20} /> {t('invites.title')}
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="text-accent">
            {t('sidebar.logOut')}
          </Button>
        </div>
      </header>
      <ScrollArea>
        <div className="mx-auto w-full max-w-md p-6 grid gap-4">
          <Card border shadow="sm" padding="lg">
            <div className="grid gap-8">
              <div>
                <FormLabel>{t('userSettingsDialog.language')}</FormLabel>
                <LanguageSwitcher />
              </div>
              <div>
                <FormLabel>{t('userSettingsDialog.theme')}</FormLabel>
                <RadioGroup value={theme} onChange={handleThemeChange} options={themeOptions} />
              </div>
              <div>
                <FormLabel>{t('userSettingsDialog.fontSize')}</FormLabel>
                <RadioGroup value={fontSize} onChange={handleFontSizeChange} options={fontSizeOptions} />
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
            </div>
          </Card>
          {status === 'saved' ? (
            <Card border shadow="sm" padding="lg" className="text-center">
              <p>{t('userSettingsDialog.settingsSaved')}</p>
            </Card>
          ) : (
            <Card border shadow="sm" padding="lg">
              <form onSubmit={handleSave} className="grid gap-4">
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
                  <FormLabel htmlFor="name">{t('common.name')}</FormLabel>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('common.name')} />
                </div>
                <div>
                  <FormLabel htmlFor="email">{t('common.email')}</FormLabel>
                  <Input id="email" type="email" value={currentUser.email} readOnly className="opacity-60" />
                </div>
                <div>
                  <FormLabel htmlFor="oldPassword">{t('userSettingsDialog.oldPassword')}</FormLabel>
                  <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder={t('userSettingsDialog.oldPassword')} />
                </div>
                <div>
                  <FormLabel htmlFor="password">{t('userSettingsDialog.newPassword')}</FormLabel>
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
                <Button type="submit" variant="primary" disabled={status === 'saving'} className="w-full center">
                  {status === 'saving' ? t('common.loading') : t('common.save')}
                </Button>
              </form>
            </Card>
          )}
          <div className="text-xs mx-auto flex gap-2">
            <a href="https://nokta.chat/" target="_blank" className="link text-light">Nokta.chat</a>
            <span className="text-light">·</span>
            <button onClick={() => window.location.reload()} className="link text-light cursor-pointer">{t('common.reload')}</button>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
