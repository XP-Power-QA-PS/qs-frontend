import React from 'react';
import { Building2, CheckCircle2, Cpu } from 'lucide-react';

export interface FloorStats {
  total: number;
  withEquipments: number;
  totalEquipments: number;
}

interface FloorStatsCardsProps {
  stats: FloorStats;
}

export const FloorStatsCards: React.FC<FloorStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
      <div className="bg-surface-card p-3.5 sm:p-4 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Floors</p>
          <p className="text-2xl font-bold font-technical-data text-text-primary mt-0.5">{stats.total}</p>
        </div>
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-500/20">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-surface-card p-3.5 sm:p-4 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Active Floors</p>
          <p className="text-2xl font-bold font-technical-data text-emerald-600 mt-0.5">{stats.withEquipments}</p>
        </div>
        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-surface-card p-3.5 sm:p-4 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Linked Equipments</p>
          <p className="text-2xl font-bold font-technical-data text-primary mt-0.5">{stats.totalEquipments}</p>
        </div>
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
          <Cpu className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
