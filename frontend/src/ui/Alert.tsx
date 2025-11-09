import React from 'react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  error: 'bg-(--color-error-50) border-(--color-error-500) text-(--color-error-600)',
  success: 'bg-(--color-success-50) border-(--color-success-500) text-(--color-success-600)',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-(--color-primary-50) border-(--color-primary-500) text-(--color-primary-600)',
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  children,
  className = ''
}) => {
  return (
    <div
      className={`p-3 border rounded text-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};
