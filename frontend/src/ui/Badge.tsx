interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'unread';
  ref?: React.Ref<HTMLSpanElement>;
}

export default function Badge({ variant = 'default', className = '', children, ref, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 text-gray-700',
    unread: 'text-white',
  };

  const baseStyles = 'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold min-w-[1.5rem] h-6';

  const style: React.CSSProperties = {};
  if (variant === 'unread') {
    style.backgroundColor = 'var(--color-accent-500)';
  }

  return (
    <span
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}
