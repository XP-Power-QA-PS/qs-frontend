import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EquipmentRankDTO } from '@/types/equipment';

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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[560px]">
        <thead className="bg-surface-subtle border-b border-border-subtle">
          <tr>
            <th className="px-3 py-2.5 text-[10px] font-label-md text-text-muted uppercase tracking-wider w-8">#</th>
            <th className="px-3 py-2.5 text-[10px] font-label-md text-text-muted uppercase tracking-wider">Equipment</th>
            <th className="px-3 py-2.5 text-[10px] font-label-md text-text-muted uppercase tracking-wider">Floor</th>
            <th className="px-3 py-2.5 text-[10px] font-label-md text-text-muted uppercase tracking-wider text-center">Fails</th>
            <th className="px-3 py-2.5 text-[10px] font-label-md text-text-muted uppercase tracking-wider">Pass Rate</th>
            <th className="px-3 py-2.5 text-[10px] font-label-md text-text-muted uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((eq, idx) => (
            <tr
              key={eq.equipmentId}
              className="group border-b border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer last:border-0"
              onClick={() =>
                navigate(`/stats/equipment/${eq.equipmentId}?code=${encodeURIComponent(eq.equipmentCode)}&name=${encodeURIComponent(eq.equipmentName)}`)
              }
            >
              <td className="px-3 py-3 text-xs text-text-muted font-technical-data">{idx + 1}</td>
              <td className="px-3 py-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {eq.equipmentName}
                  </span>
                  <span className="text-[10px] font-technical-data text-text-muted mt-0.5">{eq.equipmentCode}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-xs text-text-secondary">{eq.floorName}</td>
              <td className="px-3 py-3 text-center">
                <span className="inline-flex items-center justify-center w-8 h-6 rounded-lg bg-status-critical/10 text-status-critical text-xs font-bold">
                  {eq.failCount}
                </span>
              </td>
              <td className="px-3 py-3 min-w-[110px]">
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
              </td>
              <td className="px-3 py-3 text-right">
                <span className="material-symbols-outlined text-border-strong group-hover:text-primary transition-colors text-[20px]">
                  arrow_forward
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
