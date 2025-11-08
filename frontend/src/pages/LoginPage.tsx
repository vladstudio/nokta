import { useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '../services/pocketbase';
import { Alert, Button, Input } from '../ui';

export default function LoginPage() {
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
      return 'Password must be at least 8 characters long';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
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
          setError('Passwords do not match');
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
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <Input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <Input id="password" name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="passwordConfirm" className="sr-only">Confirm Password</label>
                <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirm password" />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="error" className="mt-4">{error}</Alert>
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Sign up'}
            </Button>
          </div>

          <div className="text-center">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-blue-600 hover:text-blue-500">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
