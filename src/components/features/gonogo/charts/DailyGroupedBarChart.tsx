import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyTrendDTO } from '@/types/equipment';

interface DailyGroupedBarChartProps {
  data: DailyTrendDTO[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg px-4 py-3 text-sm min-w-[160px]">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 text-xs">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-text-primary">{p.value}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 text-xs border-t border-border-subtle mt-1.5 pt-1.5">
        <span className="text-text-muted">Pass Rate</span>
        <span className="font-bold text-sky-500">
          {payload[0]?.payload?.passRate ?? 0}%
        </span>
      </div>
    </div>
  );
};

export const DailyGroupedBarChart: React.FC<DailyGroupedBarChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        No daily data for this month
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: d.testDate.slice(5).replace('-', '/'), // "05/09"
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="passCount" name="PASS" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Bar dataKey="failCount" name="FAIL" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};
