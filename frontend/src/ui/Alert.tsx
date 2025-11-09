import React from 'react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
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
