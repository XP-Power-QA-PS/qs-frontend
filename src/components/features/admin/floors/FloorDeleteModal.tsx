import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { FloorItem } from '@/types/admin';

interface FloorDeleteModalProps {
  isOpen: boolean;
  floor: FloorItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const FloorDeleteModal: React.FC<FloorDeleteModalProps> = ({
  isOpen,
  floor,
  submitting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !floor) return null;

  const hasEquipments = floor.equipmentCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div
              className={`p-3 rounded-2xl border shrink-0 ${
                hasEquipments
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {hasEquipments ? 'Không Thể Xóa Tầng Lầu' : 'Xác Nhận Xóa Tầng Lầu'}
              </h3>
              <p className="text-xs text-text-secondary">
                Tầng lầu: <strong>{floor.name}</strong>
              </p>
            </div>
          </div>

          {hasEquipments ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-200 leading-relaxed mb-6">
              Tầng lầu <strong>"{floor.name}"</strong> hiện đang có{' '}
              <span className="font-bold underline">{floor.equipmentCount} thiết bị</span> hoạt động.
              Hệ thống không cho phép xóa để tránh ảnh hưởng đến dữ liệu kiểm tra thiết bị.
              Vui lòng di chuyển hoặc xóa các thiết bị này trước khi xóa tầng lầu.
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
              Bạn có chắc chắn muốn xóa tầng lầu <strong>"{floor.name}"</strong>?
              Hệ thống sẽ lưu trữ và ẩn tầng lầu này khỏi danh sách hoạt động.
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-xl border border-border-subtle transition-colors cursor-pointer"
            >
              {hasEquipments ? 'Đã hiểu' : 'Hủy'}
            </button>
            {!hasEquipments && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác Nhận Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
