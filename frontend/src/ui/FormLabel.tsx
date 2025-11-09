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
      className="block text-sm font-medium text-(--color-text-secondary) mb-2"
    >
      {children}
      {required && <span className="text-(--color-error-500) ml-2">*</span>}
    </label>
  );
};
