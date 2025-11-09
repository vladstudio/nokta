interface OnlineIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  isOnline: boolean;
  ref?: React.Ref<HTMLSpanElement>;
}

export default function OnlineIndicator({ isOnline, className = '', ref, ...props }: OnlineIndicatorProps) {
  const bgColor = isOnline ? 'bg-(--color-success-500)' : 'bg-gray-400';

  return (
    <span
      ref={ref}
      className={`w-3 h-3 rounded-full border-2 border-white ${bgColor} ${className}`}
      {...props}
    />
  );
}
