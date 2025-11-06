import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '../services/pocketbase';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
