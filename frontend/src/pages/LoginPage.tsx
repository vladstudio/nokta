import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth } from '../services/pocketbase';
import { Alert, Button, Input } from '../ui';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.login(email, password);
      setLocation('/');
    } catch (err) {
      const msg = err instanceof Error && err.message === 'banned' ? t('errors.accountBanned') : t('errors.authenticationFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2">
      <div className="flex-1" />
      <div className="max-w-md w-full center flex-col gap-4">
        <img src="/favicon.svg" alt="Logo" className="w-20 h-20 m-8" />
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">{t('common.email')}</label>
            <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('common.email')} />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">{t('common.password')}</label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('common.password')} />
          </div>

          {error && (
            <Alert variant="error" className="mt-4">{error}</Alert>
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full center">
              {loading ? t('common.loading') : t('loginPage.signIn')}
            </Button>
          </div>
        </form>
      </div>
      <div className="flex-3" />
      <div className="mb-4">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
