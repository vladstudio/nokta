import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { auth } from '../services/pocketbase';
import Sidebar from './Sidebar';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!auth.isValid) {
      setLocation('/login');
    } else {
      setIsChecking(false);
    }

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
    <div className="fixed inset-0 flex overflow-hidden">
      {location !== '/my-spaces' && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
