import React from 'react';
import { useViewMode } from '@/context/ViewModeContext';

interface ViewModeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ className = '', size = 'md' }) => {
  const { viewMode, setViewMode } = useViewMode();

  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle shadow-2xs ${className}`}>
      <button
        type="button"
        onClick={() => setViewMode('card')}
        className={`flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all ${
          isSmall ? 'px-2.5 py-1 min-h-[30px]' : 'px-3 py-1.5 min-h-[34px]'
        } ${
          viewMode === 'card'
            ? 'bg-surface-card text-primary shadow-xs font-bold'
            : 'text-text-muted hover:text-text-primary'
        }`}
        title="Chuyển sang chế độ Thẻ (Cards)"
        aria-pressed={viewMode === 'card'}
      >
        <span className="material-symbols-outlined text-[17px]">grid_view</span>
        <span>Cards</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode('table')}
        className={`flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all ${
          isSmall ? 'px-2.5 py-1 min-h-[30px]' : 'px-3 py-1.5 min-h-[34px]'
        } ${
          viewMode === 'table'
            ? 'bg-surface-card text-primary shadow-xs font-bold'
            : 'text-text-muted hover:text-text-primary'
        }`}
        title="Chuyển sang chế độ Bảng (Table)"
        aria-pressed={viewMode === 'table'}
      >
        <span className="material-symbols-outlined text-[17px]">table_rows</span>
        <span>Table</span>
      </button>
    </div>
  );
};
