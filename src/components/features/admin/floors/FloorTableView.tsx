import React from 'react';
import { Building2, Cpu, Edit2, Trash2 } from 'lucide-react';
import type { FloorItem } from '@/types/admin';

interface FloorTableViewProps {
  floors: FloorItem[];
  onEdit: (floor: FloorItem) => void;
  onDelete: (floor: FloorItem) => void;
  onNavigateEquipment: (floorId: string, floorName: string) => void;
  formatDate: (isoStr?: string) => string;
}

export const FloorTableView: React.FC<FloorTableViewProps> = ({
  floors,
  onEdit,
  onDelete,
  onNavigateEquipment,
  formatDate,
}) => {
  return (
    <div className="bg-surface-card rounded-2xl shadow-2xs border border-border-subtle overflow-hidden max-w-full w-full">
      <div className="overflow-x-auto max-w-full w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-surface-subtle border-b border-border-subtle">
            <tr>
              <th className="px-4 sm:px-6 py-3.5 font-label-md text-text-muted uppercase tracking-wider text-xs w-[25%]">
                Tên Tầng Lầu
              </th>
              <th className="px-4 sm:px-6 py-3.5 font-label-md text-text-muted uppercase tracking-wider text-xs w-[35%]">
                Mô Tả
              </th>
              <th className="px-4 sm:px-6 py-3.5 font-label-md text-text-muted uppercase tracking-wider text-xs w-[15%] text-center">
                Số Thiết Bị
              </th>
              <th className="px-4 sm:px-6 py-3.5 font-label-md text-text-muted uppercase tracking-wider text-xs w-[15%]">
                Cập Nhật Lần Cuối
              </th>
              <th className="px-4 sm:px-6 py-3.5 font-label-md text-text-muted uppercase tracking-wider text-xs w-[10%] text-right">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {floors.map((floor) => (
              <tr
                key={floor.id}
                className="group hover:bg-surface-subtle/70 transition-colors"
              >
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                        {floor.name}
                      </p>
                      <p className="text-[11px] font-technical-data text-text-muted">
                        ID: {floor.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-text-secondary">
                  {floor.description || <span className="italic text-text-muted">—</span>}
                </td>

                <td className="px-4 sm:px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      floor.equipmentCount > 0 &&
                      onNavigateEquipment(floor.id, floor.name)
                    }
                    disabled={floor.equipmentCount === 0}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                      floor.equipmentCount > 0
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer'
                        : 'bg-surface-subtle text-text-muted border-border-subtle cursor-default'
                    }`}
                    title={floor.equipmentCount > 0 ? 'Nhấn để xem danh sách thiết bị' : 'Chưa có thiết bị'}
                  >
                    <Cpu className="w-3 h-3" />
                    <span>{floor.equipmentCount}</span>
                  </button>
                </td>

                <td className="px-4 sm:px-6 py-4 text-xs text-text-secondary">
                  <p>{formatDate(floor.updatedAt || floor.createdAt)}</p>
                  {floor.updatedBy && (
                    <p className="text-[11px] text-text-muted">bởi {floor.updatedBy}</p>
                  )}
                </td>

                <td className="px-4 sm:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(floor)}
                      className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa tầng lầu"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(floor)}
                      className="p-1.5 text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Xóa tầng lầu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
