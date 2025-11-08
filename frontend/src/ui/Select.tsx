import { Select as BaseSelect } from '@base-ui-components/react/select';

interface Option<T = string> {
  value: T;
  label: string;
}

interface SelectProps<T = string> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T | null) => void;
  options: Option<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Select<T extends string = string>({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = 'Select...',
  disabled,
  className = '',
  ref,
}: SelectProps<T>) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <BaseSelect.Root value={value} defaultValue={defaultValue} onValueChange={onChange} disabled={disabled}>
      <BaseSelect.Trigger
        ref={ref}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${className}`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <BaseSelect.Icon className="ml-2 text-gray-500">▼</BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4}>
          <BaseSelect.Popup className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 data-highlighted:bg-gray-100 data-selected:bg-blue-50 data-selected:text-blue-600 flex items-center justify-between"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="ml-2">✓</BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
