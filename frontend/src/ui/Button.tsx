import type { ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'primary' | 'ghost';
type Size = 'default' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  ref?: React.Ref<HTMLButtonElement>;
}

const variants: Record<Variant, string> = {
  default: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

const sizes: Record<Size, string> = {
  default: 'px-4 py-2',
  icon: 'p-2',
};

export function Button({ variant = 'primary', size = 'default', className = '', disabled, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${sizes[size]} rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
