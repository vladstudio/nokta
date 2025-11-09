interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  ref?: React.Ref<HTMLDivElement>;
}

export default function Avatar({ size = 40, className = '', children, ref, ...props }: AvatarProps) {
  return (
    <div
      ref={ref}
      className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'var(--color-primary-500)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
