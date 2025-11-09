import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
  ref?: React.Ref<HTMLInputElement>;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
  ref?: React.Ref<HTMLTextAreaElement>;
}

type Props = InputProps | TextareaProps;

const baseStyles = 'w-full bg-(--color-bg-primary) px-4 py-2 border border-(--color-border-default) rounded-sm    focus:outline-none focus:ring-2 focus:ring-(--color-primary-500) focus:border-transparent';

export function Input({ as: Component = 'input', className = '', ref, ...props }: Props) {
  return Component === 'textarea' ? (
    <textarea
      ref={ref as React.Ref<HTMLTextAreaElement>}
      className={`${baseStyles} resize-none ${className}`}
      {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={`${baseStyles} ${className}`}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  );
}
