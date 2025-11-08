import { useState, useEffect, useMemo } from 'react';
import { Alert, Dialog, Button, FormLabel, Input, FileUpload, RadioGroup, useToastManager } from '../ui';
import { auth, pb } from '../services/pocketbase';
import { UserAvatar } from './Avatar';
import { useTranslation } from 'react-i18next';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'en' | 'ru'>('en');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email);
      setPassword('');
      setLanguage(currentUser.language || 'en');
      setAvatar(null);
      setAvatarPreview(
        currentUser.avatar
          ? pb.files.getURL(currentUser as unknown as PocketBaseRecord, currentUser.avatar)
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
      if (language !== currentUser.language) formData.append('language', language);
      if (avatar) formData.append('avatar', avatar);

      await pb.collection('users').update(currentUser.id, formData);
      await pb.collection('users').authRefresh();

      // Update i18n language immediately
      if (language !== i18n.language) {
        await i18n.changeLanguage(language);
      }

      onOpenChange(false);
      toastManager.add({
        title: t('userSettingsDialog.settingsSaved'),
        description: t('userSettingsDialog.settingsSavedDesc'),
        data: { type: 'success' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  const languageOptions = useMemo(() => [
    { value: 'en' as const, label: t('languages.en') },
    { value: 'ru' as const, label: t('languages.ru') },
  ], [t]);


  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('userSettingsDialog.title')}
      description={t('userSettingsDialog.description')}
      footer={
        <>
          <Button variant="default" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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
          <FormLabel htmlFor="name">{t('userSettingsDialog.name')}</FormLabel>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('userSettingsDialog.namePlaceholder')}
          />
        </div>

        <div>
          <FormLabel htmlFor="email">{t('userSettingsDialog.email')}</FormLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('userSettingsDialog.emailPlaceholder')}
          />
        </div>

        <div>
          <FormLabel htmlFor="password">{t('userSettingsDialog.password')}</FormLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('userSettingsDialog.leaveBlankPassword')}
          />
        </div>

        <div>
          <FormLabel>{t('userSettingsDialog.language')}</FormLabel>
          <RadioGroup value={language} onChange={setLanguage} options={languageOptions} />
        </div>
      </div>
    </Dialog>
  );
}
