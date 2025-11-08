import type { ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'primary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  ref?: React.Ref<HTMLButtonElement>;
}

const variants: Record<Variant, string> = {
  default: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
};

export function Button({ variant = 'primary', className = '', disabled, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
