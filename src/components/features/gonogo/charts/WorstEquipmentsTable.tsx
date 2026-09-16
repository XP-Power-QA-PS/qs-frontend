import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EquipmentRankDTO } from '@/types/equipment';
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableActionButton,
} from '@/components/common/table';

interface WorstEquipmentsTableProps {
  data: EquipmentRankDTO[];
}

function getPassRateColor(rate: number): string {
  if (rate >= 80) return 'text-status-ok';
  if (rate >= 50) return 'text-amber-500';
  return 'text-status-critical';
}

function getProgressColor(rate: number): string {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export const WorstEquipmentsTable: React.FC<WorstEquipmentsTableProps> = ({ data }) => {
  const navigate = useNavigate();

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <span className="material-symbols-outlined text-[36px] text-status-ok">verified</span>
        <p className="text-sm text-text-secondary font-medium">All equipments performing well!</p>
        <p className="text-xs text-text-muted">No failures recorded in the selected period.</p>
      </div>
    );
  }

  return (
    <TableContainer>
      <Table minWidth="560px">
        <TableHeader>
          <tr>
            <TableHead align="center" className="w-10">#</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead align="center">Fails</TableHead>
            <TableHead>Pass Rate</TableHead>
            <TableHead align="right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {data.map((eq, idx) => (
            <TableRow
              key={eq.equipmentId}
              onClick={() =>
                navigate(`/stats/equipment/${eq.equipmentId}?code=${encodeURIComponent(eq.equipmentCode)}&name=${encodeURIComponent(eq.equipmentName)}`)
              }
            >
              <TableCell align="center" className="font-bold text-text-primary">{idx + 1}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {eq.equipmentName}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-primary mt-0.5">{eq.equipmentCode}</span>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary">{eq.floorName}</TableCell>
              <TableCell align="center">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold font-mono">
                  {eq.failCount}
                </span>
              </TableCell>
              <TableCell className="min-w-[110px]">
                <div className="flex items-center gap-2">
                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(eq.passRate)}`}
                      style={{ width: `${Math.max(eq.passRate, 2)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold tabular-nums w-10 text-right ${getPassRateColor(eq.passRate)}`}>
                    {eq.passRate}%
                  </span>
                </div>
              </TableCell>
              <TableCell align="right">
                <TableActionButton label="View" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
