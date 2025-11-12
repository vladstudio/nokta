import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  border?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const paddingStyles = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  shadow = 'lg',
  border = false,
  padding = 'none'
}) => {
  return (
    <div
      className={`bg-(--color-bg-primary) rounded ${shadowStyles[shadow]} ${border ? 'border border-(--color-border-default)' : ''
        } ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
