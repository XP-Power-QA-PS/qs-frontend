import React from 'react';
import { Building2, Cpu, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import type { FloorItem } from '@/types/admin';

interface FloorCardViewProps {
  floors: FloorItem[];
  onEdit: (floor: FloorItem) => void;
  onDelete: (floor: FloorItem) => void;
  onNavigateEquipment: (floorId: string, floorName: string) => void;
  formatDate: (isoStr?: string) => string;
}

export const FloorCardView: React.FC<FloorCardViewProps> = ({
  floors,
  onEdit,
  onDelete,
  onNavigateEquipment,
  formatDate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {floors.map((floor) => (
        <div
          key={floor.id}
          className="bg-surface-card rounded-2xl border border-border-subtle shadow-2xs hover:shadow-md hover:border-primary/40 transition-all p-5 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-headline-sm text-text-primary group-hover:text-primary transition-colors">
                    {floor.name}
                  </h2>
                  <span className="text-[11px] font-technical-data text-text-muted">
                    ID: {floor.id}
                  </span>
                </div>
              </div>

              {/* Equipment count badge */}
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1 ${
                  floor.equipmentCount > 0
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-surface-subtle text-text-muted border-border-subtle'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>{floor.equipmentCount} {floor.equipmentCount === 1 ? 'equipment' : 'equipments'}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 min-h-[2.5rem]">
              {floor.description || <span className="italic text-text-muted">No description provided</span>}
            </p>

            {floor.equipmentCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigateEquipment(floor.id, floor.name)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                <span>View equipments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-5 pt-3.5 border-t border-border-subtle/80 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              Updated: {formatDate(floor.updatedAt || floor.createdAt)}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(floor)}
                className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                title="Edit floor details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(floor)}
                className="p-1.5 text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title={floor.equipmentCount > 0 ? 'Cannot delete floor with associated equipment' : 'Delete floor'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
