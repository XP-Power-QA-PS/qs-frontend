import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'card' | 'table';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'qs_view_mode_pref';

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'card' || saved === 'table') {
        return saved;
      }
    } catch {
      // ignore
    }
    return window.innerWidth < 768 ? 'card' : 'table';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'card' ? 'table' : 'card');
  };

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'card' || e.newValue === 'table')) {
        setViewModeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
