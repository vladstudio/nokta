import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
  ref?: React.Ref<HTMLInputElement>;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
  ref?: React.Ref<HTMLTextAreaElement>;
  autoHeight?: boolean;
}

type Props = InputProps | TextareaProps;

const baseStyles = 'w-full bg-(--color-bg-primary)! px-3 py-2 border border-(--color-border-default) rounded-sm';

export function Input({ as: Component = 'input', className = '', ref, ...props }: Props) {
  const autoHeight = Component === 'textarea' && (props as TextareaProps).autoHeight;
  const { autoHeight: _, ...restProps } = props as TextareaProps;

  return Component === 'textarea' ? (
    <textarea
      ref={ref as React.Ref<HTMLTextAreaElement>}
      className={`${baseStyles} resize-none ${className}`}
      style={autoHeight ? { ...props.style, fieldSizing: 'content' } as React.CSSProperties : props.style}
      {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={`${baseStyles} ${className}`}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  );
}
