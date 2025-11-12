import { ScrollArea as BaseScrollArea } from '@base-ui-components/react/scroll-area';
import type { ReactNode } from 'react';

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function ScrollArea({ children, className = '', ref }: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={`group/scroll flex-1 flex flex-col min-h-0 ${className}`}>
      <BaseScrollArea.Viewport ref={ref} className="flex-1 min-h-0">
        <BaseScrollArea.Content>
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        orientation="vertical"
        className="w-1 absolute top-0 right-0 bottom-0 flex justify-center select-none touch-none bg-transparent rounded-md m-1 opacity-0 transition-opacity duration-75 delay-300 data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:opacity-100 data-scrolling:delay-0 group-hover/scroll:opacity-100 group-hover/scroll:delay-0"
      >
        <BaseScrollArea.Thumb className="w-full rounded-md bg-(--color-text-secondary)/60 hover:bg-(--color-text-primary)/80 transition-colors" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
