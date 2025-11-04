import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { auth } from '../services/pocketbase';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!auth.isValid) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
