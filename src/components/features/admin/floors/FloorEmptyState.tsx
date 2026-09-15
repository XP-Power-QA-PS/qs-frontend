import React from 'react';
import { Building2, Plus } from 'lucide-react';

interface FloorEmptyStateProps {
  searchKeyword: string;
  onClearSearch: () => void;
  onAddFloor: () => void;
}

export const FloorEmptyState: React.FC<FloorEmptyStateProps> = ({
  searchKeyword,
  onClearSearch,
  onAddFloor,
}) => {
  return (
    <div className="bg-surface-card rounded-2xl border border-border-subtle p-12 text-center shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3 text-text-muted">
        <Building2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-text-primary">
        {searchKeyword ? 'Không tìm thấy tầng lầu phù hợp' : 'Chưa có tầng lầu nào trong hệ thống'}
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-4">
        {searchKeyword
          ? `Không có kết quả nào khớp với từ khóa "${searchKeyword}". Hãy thử lại với từ khóa khác.`
          : 'Hãy bắt đầu bằng cách thêm tầng lầu đầu tiên để quản lý vị trí đặt thiết bị.'}
      </p>
      {searchKeyword ? (
        <button
          type="button"
          onClick={onClearSearch}
          className="px-3.5 py-1.5 text-xs font-semibold bg-surface-subtle hover:bg-border-subtle text-text-primary rounded-lg transition-colors cursor-pointer"
        >
          Xóa bộ lọc tìm kiếm
        </button>
      ) : (
        <button
          type="button"
          onClick={onAddFloor}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tầng Lầu Mới</span>
        </button>
      )}
    </div>
  );
};
