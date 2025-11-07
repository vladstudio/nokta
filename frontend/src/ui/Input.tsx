import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

type Props = InputProps | TextareaProps;

const baseStyles = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ as: Component = 'input', className = '', ...props }, ref) =>
    Component === 'textarea' ? (
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
    )
);

Input.displayName = 'Input';
