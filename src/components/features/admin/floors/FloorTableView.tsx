import React from 'react';
import { Building2, Cpu, Edit2, Trash2 } from 'lucide-react';
import type { FloorItem } from '@/types/admin';
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/common/table';

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
    <TableContainer>
      <Table minWidth="700px">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Floor Name</TableHead>
            <TableHead className="w-[35%]">Description</TableHead>
            <TableHead align="center" className="w-[15%]">Equipments</TableHead>
            <TableHead className="w-[15%]">Last Updated</TableHead>
            <TableHead align="right" className="w-[10%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {floors.map((floor) => (
            <TableRow
              key={floor.id}
              clickable={false}
            >
              <TableCell>
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
              </TableCell>

              <TableCell className="text-text-secondary">
                {floor.description || <span className="italic text-text-muted">—</span>}
              </TableCell>

              <TableCell align="center">
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
                  title={floor.equipmentCount > 0 ? 'Click to view equipments' : 'No equipments'}
                >
                  <Cpu className="w-3 h-3" />
                  <span>{floor.equipmentCount}</span>
                </button>
              </TableCell>

              <TableCell className="text-xs text-text-secondary">
                <p>{formatDate(floor.updatedAt || floor.createdAt)}</p>
                {floor.updatedBy && (
                  <p className="text-[11px] text-text-muted">by {floor.updatedBy}</p>
                )}
              </TableCell>

              <TableCell align="right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(floor)}
                    className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit floor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(floor)}
                    className="p-1.5 text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete floor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
