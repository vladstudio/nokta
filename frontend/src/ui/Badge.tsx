interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'unread' | 'online';
  ref?: React.Ref<HTMLSpanElement>;
}

export default function Badge({ variant = 'default', className = '', children, ref, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 text-gray-700',
    unread: 'text-white',
    online: 'w-3 h-3 border-2 border-white',
  };

  const baseStyles = 'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold';
  const minStyles = 'min-w-[1.5rem] h-6';

  // Apply custom background colors for unread and online variants
  const style: React.CSSProperties = {};
  if (variant === 'unread') {
    style.backgroundColor = 'var(--color-accent-500)';
  } else if (variant === 'online') {
    style.backgroundColor = 'var(--color-success-500)';
  }

  return (
    <span
      ref={ref}
      className={`${baseStyles} ${variant === 'online' ? '' : minStyles} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}
