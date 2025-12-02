import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useTranslation } from 'react-i18next';
import { invitations } from '../services/pocketbase';
import type { Invitation } from '../types';
import { Alert, Button, Input } from '../ui';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function SignupPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { code } = useParams<{ code: string }>();
  const [invite, setInvite] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!code) return;
    invitations.getByCode(code).then(inv => {
      if (!inv || inv.used || new Date(inv.expires_at) < new Date()) {
        setError(t('invites.invalidOrExpired'));
      } else {
        setInvite(inv);
      }
      setLoading(false);
    });
  }, [code, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 10) {
      setError(t('invites.passwordMin'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await invitations.signup(code!, name, email, password);
      setLocation('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invites.invalidOrExpired'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2">
      <div className="flex-1" />
      <div className="max-w-md w-full center flex-col gap-4">
        <img src="/favicon.svg" alt="Logo" className="w-20 h-20 m-8" />
        {invite ? (
            <form className="grid gap-4 w-full" onSubmit={handleSubmit}>
              <Input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder={t('common.name')} />
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t('common.email')} />
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={t('common.password')} minLength={10} />
              {error && <Alert variant="error">{error}</Alert>}
              <Button type="submit" disabled={submitting} className="w-full center">
                {submitting ? t('common.loading') : t('invites.signup')}
              </Button>
            </form>
        ) : (
          <Alert variant="error">{error || t('invites.invalidOrExpired')}</Alert>
        )}
      </div>
      <div className="flex-3" />
      <div className="mb-4"><LanguageSwitcher /></div>
    </div>
  );
}
