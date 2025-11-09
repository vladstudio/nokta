import React from 'react';

interface FormLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  required
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-(--color-text-primary) mb-1"
    >
      {children}
      {required && <span className="text-(--color-error-500) ml-1">*</span>}
    </label>
  );
};
