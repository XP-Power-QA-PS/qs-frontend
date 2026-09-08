import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { DailyTrendDTO } from '@/types/equipment';

interface AttemptScatterPlotProps {
  data: DailyTrendDTO[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DailyTrendDTO & { label: string };
  const status = d.failCount === 0 ? 'ALL PASS' : 'HAS FAIL';
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg px-4 py-3 text-sm min-w-[170px]">
      <p className="font-semibold text-text-primary mb-2">{d.label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Total Attempts</span>
          <span className="font-bold text-text-primary">{d.totalAttempts}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Pass Rate</span>
          <span className="font-bold text-sky-500">{d.passRate}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Status</span>
          <span className={`font-bold ${d.failCount === 0 ? 'text-status-ok' : 'text-status-critical'}`}>{status}</span>
        </div>
      </div>
    </div>
  );
};

export const AttemptScatterPlot: React.FC<AttemptScatterPlotProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        No data for scatter analysis
      </div>
    );
  }

  // X axis = day index, Y axis = totalAttempts
  const formatted = data.map((d, idx) => ({
    ...d,
    dayIndex: idx + 1,
    label: d.testDate.slice(5).replace('-', '/'),
  }));

  // Avg attempts line
  const avgAttempts = formatted.reduce((sum, d) => sum + d.totalAttempts, 0) / (formatted.length || 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" />
        <XAxis
          type="number"
          dataKey="dayIndex"
          name="Day"
          domain={[0, formatted.length + 1]}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
          tickFormatter={(v) => formatted[v - 1]?.label ?? v}
          label={{ value: 'Day', position: 'insideBottomRight', offset: -4, fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="totalAttempts"
          name="Attempts"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
          allowDecimals={false}
          label={{ value: 'Attempts', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        {/* Average reference line */}
        <ReferenceLine
          y={Math.round(avgAttempts * 10) / 10}
          stroke="#0ea5e9"
          strokeDasharray="5 5"
          strokeWidth={1.5}
          label={{ value: `avg ${Math.round(avgAttempts * 10) / 10}`, position: 'right', fontSize: 10, fill: '#0ea5e9' }}
        />
        <Scatter name="Daily Attempts" data={formatted}>
          {formatted.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.failCount === 0 ? '#22c55e' : '#ef4444'}
              fillOpacity={0.85}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};
