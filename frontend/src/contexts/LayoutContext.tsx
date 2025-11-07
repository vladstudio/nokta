import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  spaceName: string | null;
  setSpaceName: (name: string | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [spaceName, setSpaceName] = useState<string | null>(null);

  return (
    <LayoutContext.Provider value={{ spaceName, setSpaceName }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
}
