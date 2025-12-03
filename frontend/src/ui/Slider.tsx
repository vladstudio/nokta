import { Slider as BaseSlider } from '@base-ui-components/react/slider';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showTicks?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, showTicks, disabled, className = '' }: SliderProps) {
  const tickCount = Math.floor((max - min) / step) + 1;
  return (
    <BaseSlider.Root value={value} onValueChange={(val) => onValueChange(val as number)} min={min} max={max} step={step} disabled={disabled} className={`w-full ${className}`}>
      <BaseSlider.Control className="flex items-center h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        <BaseSlider.Track className="relative w-full h-1 rounded-full bg-(--color-border-default)">
          {showTicks && Array.from({ length: tickCount }, (_, i) => (
            <span key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[2px] h-3 bg-(--color-border-default)" style={{ left: `${(i / (tickCount - 1)) * 100}%` }} />
          ))}
          <BaseSlider.Indicator className="absolute h-full rounded-full bg-(--color-text-primary)" />
          <BaseSlider.Thumb className="w-4 h-4 rounded-full bg-(--color-bg-primary) border-2 border-(--color-text-primary) outline-none" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
