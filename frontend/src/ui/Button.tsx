import type { ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'primary' | 'ghost' | 'outline';
type Size = 'default' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isSelected?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const variants: Record<Variant, string> = {
  default: 'border border-(--color-border-default) text-(--color-text-primary) bg-(--color-bg-primary) hover:bg-(--color-bg-hover) focus:ring-(--color-text-secondary)',
  primary: 'bg-(--color-primary-600) text-white hover:bg-(--color-primary-700) focus:ring-(--color-primary-500)',
  ghost: 'text-(--color-text-primary) hover:bg-(--color-bg-hover)',
  outline: 'border border-(--color-border-default) text-(--color-text-primary) hover:bg-(--color-bg-hover) focus:ring-(--color-text-secondary)',
};

const sizes: Record<Size, string> = {
  default: 'px-4 py-2',
  icon: 'p-2',
};

export function Button({ variant = 'primary', size = 'default', className = '', disabled, isSelected, ref, ...props }: ButtonProps) {
  const baseClasses = `${sizes[size]} rounded font-medium transition-colors duration-75 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`;
  const variantClasses = isSelected ? 'bg-(--color-bg-active)!' : variants[variant];

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    />
  );
}
