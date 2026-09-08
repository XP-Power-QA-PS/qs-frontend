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
    <div
      className={`inline-flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle shadow-2xs ${
        isSmall ? 'h-9' : 'h-10'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setViewMode('card')}
        className={`inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all h-full ${
          isSmall ? 'px-2.5' : 'px-3'
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
        className={`inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all h-full px-3 ${
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
