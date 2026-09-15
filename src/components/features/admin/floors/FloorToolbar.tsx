import React from 'react';
import { Search, X } from 'lucide-react';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';

interface FloorToolbarProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  filteredCount: number;
  totalCount: number;
}

export const FloorToolbar: React.FC<FloorToolbarProps> = ({
  searchKeyword,
  onSearchChange,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm kiếm tầng lầu theo tên hoặc mô tả..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-surface-card border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {searchKeyword && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3">
        <span className="text-xs text-text-secondary">
          Hiển thị: <strong>{filteredCount}</strong> / {totalCount} tầng lầu
        </span>
        <ViewModeToggle />
      </div>
    </div>
  );
};
