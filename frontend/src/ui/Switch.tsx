import { Switch as BaseSwitch } from '@base-ui-components/react/switch';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className = '' }: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-primary-500) focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-(--color-primary-600)' : 'bg-(--color-border-default)'} ${className}`}
    >
      <BaseSwitch.Thumb className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </BaseSwitch.Root>
  );
}
