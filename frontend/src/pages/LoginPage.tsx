import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth } from '../services/pocketbase';
import { Alert, Button, Input } from '../ui';

export default function LoginPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t('validation.passwordMinLength');
    }
    if (!/[a-z]/.test(password)) {
      return t('validation.passwordLowercase');
    }
    if (!/[A-Z]/.test(password)) {
      return t('validation.passwordUppercase');
    }
    if (!/[0-9]/.test(password)) {
      return t('validation.passwordNumber');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await auth.login(email, password);
        setLocation('/');
      } else {
        if (password !== passwordConfirm) {
          setError(t('loginPage.passwordsNoMatch'));
          setLoading(false);
          return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        await auth.register(email, password, passwordConfirm, name);
        await auth.login(email, password);
        setLocation('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.authenticationFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2>
            {isLogin ? t('loginPage.signInTitle') : t('loginPage.signUpTitle')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">{t('loginPage.nameOptional')}</label>
                <Input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('loginPage.nameOptional')} />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">{t('loginPage.emailAddress')}</label>
              <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('loginPage.emailAddress')} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('loginPage.password')}</label>
              <Input id="password" name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('loginPage.password')} />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="passwordConfirm" className="sr-only">{t('loginPage.confirmPassword')}</label>
                <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={t('loginPage.confirmPassword')} />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="error" className="mt-4">{error}</Alert>
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('loginPage.pleaseWait') : isLogin ? t('loginPage.signIn') : t('loginPage.signUp')}
            </Button>
          </div>

          <div className="text-center">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-blue-600 hover:text-blue-500">
              {isLogin ? t('loginPage.noAccount') : t('loginPage.hasAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
