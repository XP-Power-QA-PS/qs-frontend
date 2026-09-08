import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import type { FloorStatsDTO } from '@/types/equipment';

interface FloorComparisonChartProps {
  data: FloorStatsDTO[];
}

function getBarColor(passRate: number): string {
  if (passRate >= 80) return '#22c55e'; // green
  if (passRate >= 60) return '#f97316'; // orange
  return '#ef4444';                      // red
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as FloorStatsDTO;
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg px-4 py-3 text-sm min-w-[190px]">
      <p className="font-semibold text-text-primary mb-2">{d.floorName}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Pass Rate</span>
          <span className="font-bold" style={{ color: getBarColor(d.passRate) }}>{d.passRate}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Total Attempts</span>
          <span className="font-medium text-text-primary">{d.totalAttempts}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-status-ok">PASS</span>
          <span className="font-medium text-text-primary">{d.passCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-status-critical">FAIL</span>
          <span className="font-medium text-text-primary">{d.failCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Equipments tested</span>
          <span className="font-medium text-text-primary">{d.testedEquipmentCount}</span>
        </div>
      </div>
    </div>
  );
};

export const FloorComparisonChart: React.FC<FloorComparisonChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        No floor data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
        />
        <YAxis
          type="category"
          dataKey="floorName"
          tick={{ fontSize: 12, fill: 'var(--color-text-secondary, #6b7280)', fontWeight: 500 }}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey="passRate" name="Pass Rate" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry) => (
            <Cell key={entry.floorId} fill={getBarColor(entry.passRate)} />
          ))}
          <LabelList
            dataKey="passRate"
            position="right"
            formatter={(v: any) => `${v}%`}
            style={{ fontSize: 12, fontWeight: 600, fill: 'var(--color-text-primary, #111827)' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
