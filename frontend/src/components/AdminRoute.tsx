import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { auth } from '../services/pocketbase';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!auth.isValid || auth.user?.role !== 'Admin') {
      setLocation('/my');
    }
  }, [setLocation]);

  if (!auth.isValid || auth.user?.role !== 'Admin') return null;

  return <>{children}</>;
}
