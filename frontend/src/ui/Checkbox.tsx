import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      checked={checked}
      onCheckedChange={(checked) => onCheckedChange(checked === true)}
      disabled={disabled}
      className={`w-4 h-4 rounded border-2 border-(--color-border-default) cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
