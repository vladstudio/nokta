import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '../services/pocketbase';
import { LayoutProvider } from '../contexts/LayoutContext';
import Header from './Header';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check auth on mount
    if (!auth.isValid) {
      setLocation('/login');
    } else {
      setIsChecking(false);
    }

    // Listen for auth changes
    const unsubscribe = auth.onChange(() => {
      if (!auth.isValid) {
        setLocation('/login');
      }
    });

    return unsubscribe;
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <LayoutProvider>
      <div className="fixed inset-0 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </LayoutProvider>
  );
}
