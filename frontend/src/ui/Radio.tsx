import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react/radio-group';

interface RadioOption<T = string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T = string> {
  value?: T;
  onChange?: (value: T) => void;
  options: RadioOption<T>[];
  disabled?: boolean;
}

export function RadioGroup<T extends string = string>({ value, onChange, options, disabled }: RadioGroupProps<T>) {
  const handleValueChange = (newValue: unknown) => {
    if (onChange && typeof newValue === 'string') {
      onChange(newValue as T);
    }
  };

  return (
    <BaseRadioGroup value={value} onValueChange={handleValueChange}>
      <div className="grid">
        {options.map((option) => (
          <label key={option.value} className="p-2 rounded-sm flex items-center gap-2 cursor-pointer  hover:bg-(--color-bg-hover)">
            <Radio.Root value={option.value} disabled={disabled} className="w-4 h-4 rounded-full border-2 border-(--color-border-default) flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed data-checked:border-(--color-primary-600)">
              <Radio.Indicator className="w-2 h-2 rounded-full bg-(--color-primary-600)" />
            </Radio.Root>
            <span className="text-(--color-text-primary)">{option.label}</span>
          </label>
        ))}
      </div>
    </BaseRadioGroup>
  );
}
