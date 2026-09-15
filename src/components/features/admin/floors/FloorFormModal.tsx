import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Loader2, X } from 'lucide-react';

export interface FloorFormData {
  name: string;
  description: string;
}

interface FloorFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: FloorFormData;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
}

export const FloorFormModal: React.FC<FloorFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<FloorFormData>({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialData || { name: '', description: '' });
      setFormErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isAdd = mode === 'add';

  const validate = (): boolean => {
    const errors: { name?: string } = {};
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      errors.name = 'Tên tầng lầu không được để trống';
    } else if (trimmedName.length > 100) {
      errors.name = 'Tên tầng lầu không vượt quá 100 ký tự';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
              {isAdd ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-headline-sm text-text-primary">
                {isAdd ? 'Thêm Tầng Lầu Mới' : 'Chỉnh Sửa Tầng Lầu'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isAdd
                  ? 'Khai báo khu vực/tầng lầu để quản lý thiết bị'
                  : 'Cập nhật tên hoặc mô tả tầng lầu'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Tên Tầng Lầu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={isAdd ? 'ví dụ: 1st Floor, 4th Floor, Tầng 4 - Xưởng B' : 'Tên tầng lầu...'}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (formErrors.name) setFormErrors({});
              }}
              autoFocus
              className={`w-full px-3.5 py-2.5 bg-surface-subtle border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                formErrors.name ? 'border-rose-500' : 'border-border-subtle focus:border-primary'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>
            )}
            {!isAdd && (
              <p className="text-[11px] text-text-muted mt-1">
                Lưu ý: Tên mới sẽ tự động hiển thị trên Dashboard người dùng và trang Go/No-Go check.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Mô Tả Khu Vực
            </label>
            <textarea
              rows={3}
              placeholder={
                isAdd
                  ? 'ví dụ: Khu vực sản xuất lắp ráp linh kiện, dây chuyền SMT...'
                  : 'Mô tả khu vực sản xuất...'
              }
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            {isAdd && <p className="text-[11px] text-text-muted mt-1">Tối đa 500 ký tự</p>}
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-xl border border-border-subtle transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isAdd ? 'Tạo Tầng Lầu' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
