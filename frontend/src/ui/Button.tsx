import type { ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'primary' | 'ghost';
type Size = 'default' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  ref?: React.Ref<HTMLButtonElement>;
}

const variants: Record<Variant, string> = {
  default: 'border border-(--color-border-default) text-(--color-text-primary) bg-(--color-bg-primary) hover:bg-(--color-bg-hover) focus:ring-(--color-text-secondary)',
  primary: 'bg-(--color-primary-600) text-white hover:bg-(--color-primary-700) focus:ring-(--color-primary-500)',
  ghost: 'text-(--color-text-primary) hover:bg-(--color-bg-hover)',
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
      className={`${sizes[size]} rounded font-medium transition-colors duration-75 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
