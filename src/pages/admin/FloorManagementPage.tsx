import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { adminService } from '@/services/admin';
import type { FloorItem } from '@/types/admin';
import toast from 'react-hot-toast';
import { useViewMode } from '@/context/ViewModeContext';
import {
  FloorStatsCards,
  FloorToolbar,
  FloorEmptyState,
  FloorCardView,
  FloorTableView,
  FloorFormModal,
  FloorDeleteModal,
} from '@/components/features/admin/floors';

export const FloorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode } = useViewMode();

  const [floors, setFloors] = useState<FloorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modals state
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
  }>({ isOpen: false, mode: 'add' });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<FloorItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFloors = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFloors();
      setFloors(data);
    } catch (error: any) {
      toast.error('Failed to load floors: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloors();
  }, []);

  // Filtered floors based on search
  const filteredFloors = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return floors;
    return floors.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );
  }, [floors, searchKeyword]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = floors.length;
    const withEquipments = floors.filter((f) => f.equipmentCount > 0).length;
    const totalEquipments = floors.reduce((acc, f) => acc + (f.equipmentCount || 0), 0);
    return { total, withEquipments, totalEquipments };
  }, [floors]);

  // Modal open helpers
  const openAdd = () => {
    setSelectedFloor(null);
    setFormModal({ isOpen: true, mode: 'add' });
  };

  const openEdit = (floor: FloorItem) => {
    setSelectedFloor(floor);
    setFormModal({ isOpen: true, mode: 'edit' });
  };

  const openDelete = (floor: FloorItem) => {
    setSelectedFloor(floor);
    setIsDeleteOpen(true);
  };

  // Form Submit (Handles both Add & Edit)
  const handleFormSubmit = async (data: { name: string; description?: string }) => {
    setSubmitting(true);
    try {
      if (formModal.mode === 'add') {
        await adminService.createFloor(data);
        toast.success('Đã thêm tầng lầu mới thành công');
      } else if (selectedFloor) {
        await adminService.updateFloor(selectedFloor.id, data);
        toast.success('Đã cập nhật thông tin tầng lầu thành công');
      }
      setFormModal({ isOpen: false, mode: 'add' });
      setSelectedFloor(null);
      loadFloors();
    } catch (error: any) {
      toast.error(
        error.message ||
          (formModal.mode === 'add' ? 'Không thể tạo tầng lầu' : 'Không thể cập nhật tầng lầu')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Submit
  const handleDeleteSubmit = async () => {
    if (!selectedFloor) return;
    if (selectedFloor.equipmentCount > 0) {
      toast.error('Không thể xóa tầng lầu đang có thiết bị');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.deleteFloor(selectedFloor.id);
      toast.success(`Đã xóa tầng lầu "${selectedFloor.name}" thành công`);
      setIsDeleteOpen(false);
      setSelectedFloor(null);
      loadFloors();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa tầng lầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigateEquipment = (floorId: string, floorName: string) => {
    navigate(`/equipments?floorId=${floorId}&floorName=${encodeURIComponent(floorName)}`);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-8 font-body-md">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-6 border-b border-border-subtle pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-headline-xl text-text-primary">
                  Quản Lý Tầng Lầu
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-md">
                  Floor Management
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md">
                  ROLE_ADMIN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Quản lý các khu vực lầu, thêm tầng mới hoặc chỉnh sửa tên để đồng bộ với hệ thống kiểm tra thiết bị.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={loadFloors}
              disabled={loading}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle rounded-xl transition-colors cursor-pointer"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Tầng Lầu</span>
            </button>
          </div>
        </div>

        {/* ── Metric Summary Cards ─────────────────────────────────────────── */}
        <FloorStatsCards stats={stats} />

        {/* ── Search Toolbar & View Switcher ──────────────────────────────── */}
        <FloorToolbar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          filteredCount={filteredFloors.length}
          totalCount={floors.length}
        />
      </div>

      {/* ── Main Content: Grid or Table ────────────────────────────────────── */}
      {loading && floors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-text-secondary">Đang tải danh sách tầng lầu...</p>
        </div>
      ) : filteredFloors.length === 0 ? (
        <FloorEmptyState
          searchKeyword={searchKeyword}
          onClearSearch={() => setSearchKeyword('')}
          onAddFloor={openAdd}
        />
      ) : viewMode === 'card' ? (
        <FloorCardView
          floors={filteredFloors}
          onEdit={openEdit}
          onDelete={openDelete}
          onNavigateEquipment={handleNavigateEquipment}
          formatDate={formatDate}
        />
      ) : (
        <FloorTableView
          floors={filteredFloors}
          onEdit={openEdit}
          onDelete={openDelete}
          onNavigateEquipment={handleNavigateEquipment}
          formatDate={formatDate}
        />
      )}

      {/* ── Modal: Add / Edit Floor ─────────────────────────────────────────── */}
      <FloorFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        initialData={
          selectedFloor
            ? { name: selectedFloor.name, description: selectedFloor.description || '' }
            : undefined
        }
        submitting={submitting}
        onClose={() => setFormModal({ ...formModal, isOpen: false })}
        onSubmit={handleFormSubmit}
      />

      {/* ── Modal: Delete Confirmation ──────────────────────────────────────── */}
      <FloorDeleteModal
        isOpen={isDeleteOpen}
        floor={selectedFloor}
        submitting={submitting}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedFloor(null);
        }}
        onConfirm={handleDeleteSubmit}
      />
    </div>
  );
};

export default FloorManagementPage;
