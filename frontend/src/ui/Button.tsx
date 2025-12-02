import type { ButtonHTMLAttributes, AnchorHTMLAttributes, HTMLAttributes } from 'react';

type Variant = 'default' | 'primary' | 'ghost' | 'outline';
type Size = 'default' | 'icon';

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: 'button';
  href?: never;
  ref?: React.Ref<HTMLButtonElement>;
};

type ButtonAsAnchor = AnchorHTMLAttributes<HTMLAnchorElement> & {
  as?: 'a';
  href: string;
  ref?: React.Ref<HTMLAnchorElement>;
};

type ButtonAsDiv = HTMLAttributes<HTMLDivElement> & {
  as: 'div';
  href?: never;
  disabled?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

interface BaseButtonProps {
  variant?: Variant;
  size?: Size;
  isSelected?: boolean;
  disabled?: boolean;
}

type ButtonProps = BaseButtonProps & (ButtonAsButton | ButtonAsAnchor | ButtonAsDiv);

const variants: Record<Variant, string> = {
  default: 'border border-(--color-border-default) text-(--color-text-primary) bg-(--color-bg-primary) hover:bg-(--color-bg-hover) focus:ring-(--color-text-secondary)',
  primary: 'border border-(--color-primary-600) bg-(--color-primary-600) text-white hover:border-(--color-primary-700) hover:bg-(--color-primary-700) focus:ring-(--color-primary-500)',
  ghost: 'border border-transparent text-(--color-text-primary) hover:bg-(--color-bg-hover)',
  outline: 'border border-(--color-border-default) text-(--color-text-primary) hover:bg-(--color-bg-hover) focus:ring-(--color-text-secondary)',
};

const sizes: Record<Size, string> = {
  default: 'px-4 py-2',
  icon: 'p-2',
};

export function Button({ variant = 'primary', size = 'default', className = '', disabled, isSelected, ref, ...props }: ButtonProps) {
  const baseClasses = `${sizes[size]} rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`;
  const variantClasses = isSelected ? 'bg-(--color-bg-active)! border border-(--color-bg-active)' : variants[variant];
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  if ('as' in props && props.as === 'div') {
    const { as, ...divProps } = props;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={combinedClasses}
        {...divProps}
      />
    );
  }

  if ('href' in props && props.href) {
    const { href, as, ...anchorProps } = props;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClasses}
        {...anchorProps}
      />
    );
  }

  const { as, ...buttonProps } = props as ButtonAsButton & { as?: 'button' };
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={disabled}
      className={combinedClasses}
      {...buttonProps}
    />
  );
}
